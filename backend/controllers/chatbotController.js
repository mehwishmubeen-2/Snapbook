const User = require("../models/user");
const Order = require("../models/order");
const PhotographerProfile = require("../models/photographerProfile");
const Cart = require("../models/cart");
const FAQ = require("../models/faq");
const OrderTimeline = require("../models/orderTimeline");
const Coupon = require("../models/coupon");
const Analytic = require("../models/analytic");

// ══════════════════════════════════════════════════════════════════════════════
// GROQ SETUP — model cascade on 429 / error
// ══════════════════════════════════════════════════════════════════════════════

const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
];

async function callGroq(messages, systemPrompt, modelIndex = 0, maxTokens = 800) {
  if (modelIndex >= GROQ_MODELS.length) throw new Error("All Groq models exhausted");
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.GROQ_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODELS[modelIndex],
        max_tokens: maxTokens,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    });
    if (response.status === 429) return callGroq(messages, systemPrompt, modelIndex + 1, maxTokens);
    const data = await response.json();
    if (!data.choices || !data.choices[0]) throw new Error("Empty Groq response");
    return data.choices[0].message.content;
  } catch (e) {
    console.error(`[GROQ] model ${GROQ_MODELS[modelIndex]} failed:`, e.message);
    return callGroq(messages, systemPrompt, modelIndex + 1, maxTokens);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// CONTEXT BUILDER — injected into every Groq system prompt
// ══════════════════════════════════════════════════════════════════════════════

async function buildContext(userId) {
  const [user, cart, lastOrder] = await Promise.all([
    User.findById(userId).select("name"),
    Cart.findOne({ userId }),
    Order.findOne({ customerId: userId }).sort({ createdAt: -1 }).select("status eventType eventDate"),
  ]);
  return {
    userName: user?.name || "Customer",
    cartCount: cart?.items?.length || 0,
    lastOrderStatus: lastOrder
      ? `${lastOrder.status} (${lastOrder.eventType}, ${lastOrder.eventDate?.toLocaleDateString()})`
      : "none",
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// INTENT CLASSIFICATION
// ══════════════════════════════════════════════════════════════════════════════

const INTENTS = ["search_photographer", "track_order", "cart_action", "apply_coupon", "faq", "recommendation", "general"];

async function classifyIntent(message) {
  const msg = message.toLowerCase();

  // Fast keyword pre-pass
  if (msg.match(/^(hello|hi|hey|greetings|good morning|good afternoon|good evening)/i)) return "general";
  if (msg.includes("my order") || msg.includes("track") || msg.includes("booking status") || msg.includes("where is my")) return "track_order";
  if (msg.includes("coupon") || msg.includes("discount") || msg.includes("promo code")) return "apply_coupon";
  if (msg.includes("add to cart") || msg.includes("remove from cart") || msg.includes("my cart") || msg.includes("view cart")) return "cart_action";
  // If a city is mentioned alongside photographer, always treat as search — not recommendation
  const KNOWN_CITIES = ["lahore", "karachi", "islamabad", "rawalpindi", "peshawar", "multan", "faisalabad", "quetta", "sialkot", "hyderabad"];
  const hasCityMention = KNOWN_CITIES.some((c) => msg.includes(c));
  if (
    msg.includes("find photographer") || msg.includes("search photographer") ||
    msg.includes("looking for a photographer") || msg.includes("photographer in") ||
    msg.includes("photographer for") || msg.includes("photographer") ||
    msg.match(/\b(rate|rates|price|prices|cost|hourly|per hour|how much|charge|fee|budget)\b/) ||
    msg.match(/\b(duration|hours|session|package)\b/) ||
    hasCityMention
  ) return "search_photographer";
  if (msg.includes("recommend") || msg.includes("suggest") || msg.includes("best photographer") || msg.includes("top photographer")) return "recommendation";
  if (msg.includes("policy") || msg.includes("cancel") || msg.includes("refund") || msg.includes("how does") || msg.includes("what is")) return "faq";

  // Groq classification for ambiguous messages
  try {
    const systemPrompt =
      "You are an intent classifier for SnapBook, a photographer booking platform. " +
      "Classify the user message into exactly one of these intents: " +
      INTENTS.join(", ") +
      ". Reply with ONLY the intent label, nothing else.";
    const result = await callGroq([{ role: "user", content: message }], systemPrompt);
    const classified = result.trim().toLowerCase().replace(/[^a-z_]/g, "");
    return INTENTS.includes(classified) ? classified : "general";
  } catch (e) {
    return "general";
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// SEARCH PHOTOGRAPHER — Groq extracts filters, queries DB
// ══════════════════════════════════════════════════════════════════════════════

async function handleSearchPhotographer(message, userId) {
  let filters = { city: null, eventType: null, minBudget: null, maxBudget: null, date: null };
  try {
    const extractPrompt =
      "Extract search filters from the user message and return ONLY a valid JSON object with these keys: " +
      '{ "city": string|null, "eventType": string|null, "minBudget": number|null, "maxBudget": number|null, "date": string|null }. ' +
      "minBudget is the minimum price (e.g. from 'between 200 and 500' minBudget=200, maxBudget=500). " +
      "eventType must be one of: Wedding, Portrait, Corporate, Fashion, Events, Maternity, Birthday or null. " +
      "No explanation, just JSON.";
    const raw = await callGroq([{ role: "user", content: message }], extractPrompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) filters = { ...filters, ...JSON.parse(jsonMatch[0]) };
  } catch (e) {
    // Keyword fallback
    const msg = message.toLowerCase();
    ["wedding", "portrait", "corporate", "fashion", "events", "maternity", "birthday"].forEach((t) => {
      if (msg.includes(t)) filters.eventType = t.charAt(0).toUpperCase() + t.slice(1);
    });
    ["lahore", "karachi", "islamabad", "rawalpindi", "peshawar", "multan", "faisalabad"].forEach((c) => {
      if (msg.includes(c)) filters.city = c.charAt(0).toUpperCase() + c.slice(1);
    });
    // "between 200 and 500" / "200 to 500" / "200-500"
    const rangeMatch = msg.match(/(?:between\s+)?(?:rs\.?\s*)?(\d+)\s*(?:to|-|and)\s*(?:rs\.?\s*)?(\d+)/i);
    if (rangeMatch) {
      filters.minBudget = parseInt(rangeMatch[1]);
      filters.maxBudget = parseInt(rangeMatch[2]);
    } else {
      const maxMatch = msg.match(/(?:under|below|max|less than|upto|up to)\s*(?:rs\.?\s*)?(\d+)/i);
      if (maxMatch) filters.maxBudget = parseInt(maxMatch[1]);
      const minMatch = msg.match(/(?:above|over|more than|at least|minimum|min|from)\s*(?:rs\.?\s*)?(\d+)/i);
      if (minMatch) filters.minBudget = parseInt(minMatch[1]);
    }
  }

  const query = { isPublished: true };
  if (filters.city) query.city = new RegExp(filters.city, "i");
  if (filters.eventType) query.eventTypes = filters.eventType;
  if (filters.minBudget || filters.maxBudget) {
    query.pricePerHour = {};
    if (filters.minBudget) query.pricePerHour.$gte = filters.minBudget;
    if (filters.maxBudget) query.pricePerHour.$lte = filters.maxBudget;
  }

  const photographers = await PhotographerProfile.find(query)
    .populate("userId", "name profileImage")
    .sort({ rating: -1 })
    .limit(6);

  for (const p of photographers) {
    await Analytic.create({ userId, photographerId: p._id, action: "view", eventType: filters.eventType });
  }

  const count = photographers.length;
  return {
    type: "photographers",
    message: count
      ? `Found ${count} photographer${count > 1 ? "s" : ""}${filters.city ? ` in ${filters.city}` : ""}${filters.eventType ? ` for ${filters.eventType}` : ""}.`
      : "No photographers matched your criteria. Try broadening your search.",
    photographers: photographers.map((p) => ({
      id: p._id,
      slug: p.slug,
      name: p.userId?.name,
      image: p.userId?.profileImage,
      userId: p.userId?._id,
      specialization: p.specialization,
      city: p.city,
      pricePerHour: p.pricePerHour,
      rating: p.rating,
      totalReviews: p.totalReviews,
    })),
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// TRACK ORDER — most recent order + populated OrderTimeline
// ══════════════════════════════════════════════════════════════════════════════

async function handleTrackOrder(userId) {
  const order = await Order.findOne({ customerId: userId })
    .populate("photographerId", "name")
    .sort({ createdAt: -1 });

  if (!order) {
    return { type: "text", message: "You don't have any bookings yet. Would you like me to help you find a photographer?" };
  }

  const timeline = await OrderTimeline.find({ orderId: order._id }).sort({ timestamp: 1 });

  const timelineText = timeline.length
    ? timeline
        .map((t) => `• [${new Date(t.timestamp).toLocaleDateString()}] ${t.status.replace(/_/g, " ").toUpperCase()}${t.message ? " — " + t.message : ""}`)
        .join("\n")
    : "No timeline events recorded yet.";

  const msg_text =
    `Your latest booking:\n` +
    `Photographer: ${order.photographerId?.name || "N/A"}\n` +
    `Event: ${order.eventType} on ${order.eventDate?.toLocaleDateString()}\n` +
    `Status: ${order.status.toUpperCase()} | Payment: ${order.paymentStatus}\n` +
    `Amount: Rs. ${order.totalAmount}/-\n\n` +
    `Timeline:\n${timelineText}`;

  return {
    type: "booking_timeline",
    message: msg_text,
    booking: {
      id: order._id,
      photographer: order.photographerId?.name,
      eventType: order.eventType,
      eventDate: order.eventDate,
      status: order.status,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
    },
    timeline: timeline.map((t) => ({ status: t.status, message: t.message, timestamp: t.timestamp })),
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// CART ACTION
// ══════════════════════════════════════════════════════════════════════════════

async function handleCartAction(message, userId) {
  const msg = message.toLowerCase();

  if (msg.includes("remove")) {
    const cart = await Cart.findOne({ userId }).populate("items.photographerId");
    if (!cart || !cart.items.length) return { type: "text", message: "Your cart is already empty." };
    const itemIndex = msg.includes("last") ? cart.items.length - 1 : 0;
    const removed = cart.items.splice(itemIndex, 1)[0];
    cart.totalCost = cart.items.reduce((sum, i) => sum + (i.totalPrice || 0), 0);
    await cart.save();
    return { type: "text", message: `Removed ${removed.photographerId?.name || "item"} from cart. New total: Rs. ${cart.totalCost}/-` };
  }

  // Default: view cart
  const cart = await Cart.findOne({ userId }).populate("items.photographerId", "name");
  if (!cart || !cart.items?.length) {
    return { type: "text", message: "Your cart is empty. Want me to help you find a photographer?" };
  }
  return {
    type: "cart",
    message: `You have ${cart.items.length} item(s) in your cart. Total: Rs. ${cart.totalCost}/-`,
    cart: {
      items: cart.items.map((item) => ({
        id: item._id,
        photographer: item.photographerId?.name,
        eventType: item.eventType,
        eventDate: item.eventDate,
        duration: item.duration,
        totalPrice: item.totalPrice,
      })),
      totalCost: cart.totalCost,
    },
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// APPLY COUPON
// ══════════════════════════════════════════════════════════════════════════════

async function handleApplyCoupon(message, userId) {
  const codeMatch = message.match(/\b([A-Z0-9]{3,20})\b/i);
  const code = codeMatch ? codeMatch[1].toUpperCase() : null;
  if (!code) return { type: "text", message: "Please share the coupon code. E.g. 'Apply code SAVE20'" };

  const coupon = await Coupon.findOne({ code, active: true });
  if (!coupon || (coupon.isValid && !coupon.isValid())) {
    return { type: "text", message: `Coupon "${code}" is invalid or has expired.` };
  }

  const cart = await Cart.findOne({ userId });
  if (!cart || !cart.items.length) {
    return { type: "text", message: `Coupon "${code}" is valid! Add items to your cart first to apply it.` };
  }

  if (cart.totalCost < (coupon.minOrderValue || 0)) {
    return { type: "text", message: `This coupon requires a minimum order of Rs. ${coupon.minOrderValue}/-. Your cart total is Rs. ${cart.totalCost}/-` };
  }

  const discount = coupon.calculateDiscount ? coupon.calculateDiscount(cart.totalCost) : Math.round(cart.totalCost * 0.1);
  cart.couponCode = code;
  cart.discount = discount;
  await cart.save();
  coupon.usedCount = (coupon.usedCount || 0) + 1;
  await coupon.save();

  return {
    type: "text",
    message: `Coupon "${code}" applied! Discount: Rs. ${discount}/-. New total: Rs. ${Math.max(0, cart.totalCost - discount)}/-`,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// FAQ — DB lookup then Groq fallback
// ══════════════════════════════════════════════════════════════════════════════

async function handleFAQ(message, ctx) {
  const msg = message.toLowerCase();

  if (msg.includes("cancel") || msg.includes("refund")) {
    return {
      type: "text",
      message:
        "Cancellation & Refund Policy:\n\n" +
        "\u2022 Cancel 24+ hours before the event \u2192 full refund\n" +
        "\u2022 Cancel within 24 hours \u2192 no refund (unless the photographer cancels)\n\n" +
        "To cancel: go to My Orders \u2192 select the booking \u2192 Cancel.",
    };
  }

  const faq = await FAQ.findOne({ keywords: { $in: msg.split(" ") }, active: true }).sort({ views: -1 });
  if (faq) {
    faq.views = (faq.views || 0) + 1;
    await faq.save();
    return { type: "text", message: `${faq.question}\n\n${faq.answer}` };
  }

  const systemPrompt =
    `You are SnapBook's helpful FAQ assistant. Platform policies: 24-hour cancellation for full refund. ` +
    `Payment via card and bank transfer. Photographers are verified professionals. ` +
    `User: ${ctx.userName}. Answer concisely in 2-4 sentences.`;
  const answer = await callGroq([{ role: "user", content: message }], systemPrompt);
  return { type: "text", message: answer };
}

// ══════════════════════════════════════════════════════════════════════════════
// RECOMMENDATION — top 3 rated photographers (user's city preferred)
// ══════════════════════════════════════════════════════════════════════════════

async function handleRecommendation(userId, message) {
  // Extract city from the message first (keyword scan)
  let cityHint = null;
  if (message) {
    const msg = message.toLowerCase();
    const KNOWN_CITIES = ["lahore", "karachi", "islamabad", "rawalpindi", "peshawar", "multan", "faisalabad", "quetta", "sialkot", "hyderabad"];
    for (const c of KNOWN_CITIES) {
      if (msg.includes(c)) { cityHint = c.charAt(0).toUpperCase() + c.slice(1); break; }
    }
  }
  // Fall back to user's last order location only if no city was in the message
  if (!cityHint) {
    const lastOrder = await Order.findOne({ customerId: userId }).sort({ createdAt: -1 }).select("location");
    const loc = lastOrder?.location || null;
    if (loc) cityHint = loc.split(",")[0].trim();
  }

  const query = { isPublished: true, rating: { $gte: 3 } };
  if (cityHint) query.city = new RegExp(cityHint, "i");

  const photographers = await PhotographerProfile.find(query)
    .populate("userId", "name profileImage")
    .sort({ rating: -1, totalReviews: -1 })
    .limit(3);

  return {
    type: "photographers",
    message: photographers.length
      ? `Here are our top-rated photographers${cityHint ? ` in ${cityHint}` : ""}:`
      : "Here are our top-rated photographers on SnapBook:",
    photographers: photographers.map((p) => ({
      id: p._id,
      slug: p.slug,
      name: p.userId?.name,
      image: p.userId?.profileImage,
      userId: p.userId?._id,
      specialization: p.specialization,
      city: p.city,
      pricePerHour: p.pricePerHour,
      rating: p.rating,
      totalReviews: p.totalReviews,
    })),
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// GENERAL — Full-purpose AI assistant (like Meta AI) with SnapBook awareness
// ══════════════════════════════════════════════════════════════════════════════

async function handleGeneral(message, conversationHistory, ctx) {
  const today = new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const systemPrompt =
    `You are SnapBook AI — a smart, friendly assistant embedded in SnapBook, a photographer booking platform in Pakistan. ` +
    `You work like Meta AI: you can answer ANY question the user asks — general knowledge, science, math, history, coding, jokes, recipes, advice, current events, and more. ` +
    `You also know the SnapBook platform deeply: you can help users find photographers, manage bookings, check their cart, apply coupons, and understand platform policies. ` +
    `\n\nUser context: Name=${ctx.userName}, Cart items=${ctx.cartCount}, Last order=${ctx.lastOrderStatus}. ` +
    `Today's date: ${today}. ` +
    `SnapBook policies: 24-hour cancellation for full refund; payment via card and bank transfer; all photographers are verified. ` +
    `\n\nGuidelines:\n` +
    `- Answer general questions fully and accurately, like a knowledgeable friend.\n` +
    `- For math or logic, show your working step by step.\n` +
    `- For coding questions, provide clean code examples.\n` +
    `- Keep responses concise but complete. Use bullet points or numbered lists where helpful.\n` +
    `- If the user seems to want to book a photographer, gently guide them toward using the search feature.\n` +
    `- Always respond in the same language the user writes in (Urdu or English).\n` +
    `- Never make up photographer names, prices, or availability — only use real data from the platform.`;

  const history = conversationHistory.slice(-10).map((m) => ({ role: m.role, content: m.content }));
  const answer = await callGroq([...history, { role: "user", content: message }], systemPrompt, 0, 1500);
  return { type: "text", message: answer };
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN CHAT HANDLER
// ══════════════════════════════════════════════════════════════════════════════

exports.chat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const [intent, ctx] = await Promise.all([classifyIntent(message), buildContext(userId)]);

    console.log(`[CHATBOT] User=${ctx.userName} | Intent=${intent} | Msg=${message.substring(0, 60)}`);

    let responseData;
    switch (intent) {
      case "search_photographer":
        responseData = await handleSearchPhotographer(message, userId);
        break;
      case "track_order":
        responseData = await handleTrackOrder(userId);
        break;
      case "cart_action":
        responseData = await handleCartAction(message, userId);
        break;
      case "apply_coupon":
        responseData = await handleApplyCoupon(message, userId);
        break;
      case "faq":
        responseData = await handleFAQ(message, ctx);
        break;
      case "recommendation":
        responseData = await handleRecommendation(userId, message);
        break;
      default:
        responseData = await handleGeneral(message, conversationHistory, ctx);
    }

    res.json({ success: true, intent, ...responseData });
  } catch (err) {
    console.error("[CHATBOT ERROR]", err);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

