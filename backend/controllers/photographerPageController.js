/**
 * photographerPageController.js
 *
 * Serves photographer profile pages with SEO tags injected SERVER-SIDE so
 * search engine crawlers see the tags immediately (no JS required).
 *
 * Flow:
 *  1. Request hits GET /photographer/:slug
 *  2. Server fetches the profile from MongoDB
 *  3. If seoStatus === 'approved'  → inject approved tags into the HTML template
 *     If seoStatus === 'none'      → inject fallback tags + trigger AI generation in background
 *     If seoStatus === 'pending_review' → inject fallback tags (AI pending admin approval)
 *  4. Return the pre-rendered HTML to the browser / crawler
 */

const fs   = require("fs");
const path = require("path");
const User = require("../models/user");
const PhotographerProfile = require("../models/photographerProfile");

const SITE_URL = process.env.SITE_URL || "http://localhost:3000";

// Read HTML template on every request in dev mode so file changes are always served.
// In production (NODE_ENV=production) a one-time cache is used for performance.
const TEMPLATE_PATH = path.join(
  __dirname,
  "../../frontend/public/photographer-profile.html"
);
let _templateCache = null;
function getTemplate() {
  if (process.env.NODE_ENV === "production") {
    if (!_templateCache) {
      _templateCache = fs.readFileSync(TEMPLATE_PATH, "utf8");
    }
    return _templateCache;
  }
  // Development: always read fresh so edits to the HTML are reflected immediately
  return fs.readFileSync(TEMPLATE_PATH, "utf8");
}

// ── Groq AI setup ────────────────────────────────────────────────────────────
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
];

async function callGroq(systemPrompt, userMessage) {
  if (!process.env.GROQ_API_KEY) {
    console.error("[SEO-AI] GROQ_API_KEY is not set — add it to Render environment variables.");
    return null;
  }
  for (const model of GROQ_MODELS) {
    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + process.env.GROQ_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            max_tokens: 500,
            temperature: 0.7,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user",   content: userMessage   },
            ],
          }),
        }
      );
      if (response.status === 429) { console.warn(`[SEO-AI] ${model} rate-limited, trying next.`); continue; }
      if (response.status === 401) { console.error("[SEO-AI] Invalid GROQ_API_KEY (401). Check Render env vars."); return null; }
      if (!response.ok) { console.error(`[SEO-AI] ${model} returned HTTP ${response.status}`); continue; }
      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      }
    } catch (e) {
      console.error(`[SEO-AI] Model ${model} failed:`, e.message);
    }
  }
  return null;
}

// ── HTML escaping ─────────────────────────────────────────────────────────────
function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ── Build fallback SEO from raw profile data (instant, no AI) ─────────────────
function buildFallbackSeo(profile, user) {
  const name         = user?.name || "Photographer";
  const city         = profile?.city || "";
  const state        = profile?.state || "";
  const specialization = profile?.specialization || "";
  const eventTypes   = (profile?.eventTypes || []).join(", ");
  const slug         = profile?.slug || String(profile?._id);
  const image        = user?.profileImage || "";
  const pageUrl      = `${SITE_URL}/photographer/${slug}`;
  const location     = [city, state].filter(Boolean).join(", ");

  const title = [name, location || "Pakistan", "SnapBook"]
    .filter(Boolean)
    .join(" — ")
    .slice(0, 65);

  const description = [
    `Book ${name} on SnapBook.`,
    specialization ? `Professional ${specialization.toLowerCase()} photographer.` : "Professional photographer.",
    eventTypes      ? `Specializes in ${eventTypes}.` : "",
    location        ? `Based in ${location}, Pakistan.` : "Based in Pakistan.",
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, 158);

  const keywords = [
    name,
    city,
    specialization,
    "photographer",
    "book photographer",
    "SnapBook",
    "Pakistan",
    ...(profile?.eventTypes || []),
  ]
    .filter(Boolean)
    .join(", ");

  return { title, description, keywords, image, pageUrl, name, city, slug };
}

// ── Inject SEO into HTML string ───────────────────────────────────────────────
function injectSeoIntoHtml(html, seo, profile) {
  const schema = {
    "@context": "https://schema.org",
    "@type":    ["Person", "LocalBusiness"],
    "name":        seo.name,
    "description": seo.description,
    "url":         seo.pageUrl,
    ...(seo.image ? { "image": seo.image } : {}),
    "jobTitle": profile?.seoHeading || "Professional Photographer",
    ...(seo.city
      ? { "address": { "@type": "PostalAddress", "addressLocality": seo.city, "addressCountry": "PK" } }
      : {}),
    ...(profile?.rating && profile?.totalReviews
      ? { "aggregateRating": {
          "@type":       "AggregateRating",
          "ratingValue": String(profile.rating),
          "reviewCount": String(profile.totalReviews),
          "bestRating":  "5",
          "worstRating": "1",
        }}
      : {}),
    "isPartOf": { "@type": "WebSite", "name": "SnapBook", "url": SITE_URL },
  };

  let out = html;

  // Title tag
  out = out.replace(
    /<title>[^<]*<\/title>/,
    `<title>${esc(seo.title)}</title>`
  );

  // Canonical
  out = out.replace(
    /(<link rel="canonical" href=")[^"]*(" id="canonical-tag")/,
    `$1${esc(seo.pageUrl)}$2`
  );

  // Helper: replace <meta name="X" content="...">
  const setName = (name, value) => {
    out = out.replace(
      new RegExp(`(<meta name="${name}" content=")[^"]*(")`),
      `$1${esc(value)}$2`
    );
  };

  // Helper: replace <meta property="X" content="...">
  const setProp = (prop, value) => {
    out = out.replace(
      new RegExp(`(<meta property="${escapeRegex(prop)}" content=")[^"]*(")`),
      `$1${esc(value)}$2`
    );
  };

  setName("description",          seo.description);
  setName("keywords",             seo.keywords);
  setName("robots",               "index, follow, max-snippet:-1, max-image-preview:large");
  setName("twitter:title",        seo.title);
  setName("twitter:description",  seo.description);
  setName("twitter:image",        seo.image);

  setProp("og:title",       seo.title);
  setProp("og:description", seo.description);
  setProp("og:url",         seo.pageUrl);
  setProp("og:image",       seo.image);
  setProp("og:image:alt",   `${seo.name} — SnapBook photographer`);

  // Structured data
  out = out.replace(
    /<script type="application\/ld\+json" id="structured-data-ld"><\/script>/,
    `<script type="application/ld+json" id="structured-data-ld">${JSON.stringify(schema)}</script>`
  );

  return out;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ── Background AI SEO generation (fire-and-forget) ───────────────────────────
async function triggerAiSeoGeneration(profileId, userId) {
  try {
    const [user, profile] = await Promise.all([
      User.findById(userId).select("name"),
      PhotographerProfile.findById(profileId),
    ]);

    // Allow triggering for profiles where seoStatus is undefined/null (old docs) or 'none'
    if (!profile || (profile.seoStatus && profile.seoStatus !== "none")) return;

    // Mark immediately so we don't trigger twice
    await PhotographerProfile.findByIdAndUpdate(profileId, {
      seoStatus: "pending_review",
    });

    const name         = user?.name || "Photographer";
    const location     = [profile.city, profile.state, "Pakistan"].filter(Boolean).join(", ");
    const bio          = profile.bio || "";
    const specialization = profile.specialization || "";
    const eventTypes   = (profile.eventTypes || []).join(", ");
    const experience   = profile.experience ? `${profile.experience} years` : "";
    const price        = profile.pricePerHour ? `PKR ${profile.pricePerHour}/hr` : "";
    const highlights   = (profile.serviceHighlights || []).join(", ");

    const systemPrompt =
      "You are an expert SEO specialist for SnapBook, a photography booking platform in Pakistan. " +
      "Generate optimized SEO metadata for a photographer's public profile page. " +
      "Respond ONLY with a valid JSON object — no markdown, no explanation.";

    const userMessage =
      `Generate SEO for this photographer:\n\n` +
      `Name: ${name}\nLocation: ${location}\nSpecialization: ${specialization}\n` +
      `Event Types: ${eventTypes || "general photography"}\nExperience: ${experience}\n` +
      `Price: ${price}\nBio: ${bio}\nHighlights: ${highlights}\n\n` +
      `Return ONLY this JSON:\n` +
      `{\n` +
      `  "metaTitle": "50-60 char title: name + city + niche",\n` +
      `  "metaDescription": "120-158 char compelling search snippet",\n` +
      `  "metaKeywords": ["kw1","kw2","kw3","kw4","kw5","kw6","kw7","kw8"],\n` +
      `  "seoHeading": "H1 heading under 70 chars",\n` +
      `  "slug": "name-city-lowercase-hyphens-max-50-chars"\n` +
      `}`;

    const rawText = await callGroq(systemPrompt, userMessage);
    if (!rawText) {
      await PhotographerProfile.findByIdAndUpdate(profileId, { seoStatus: "none" });
      return;
    }

    // Parse JSON response
    const cleaned   = rawText.replace(/```json|```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      await PhotographerProfile.findByIdAndUpdate(profileId, { seoStatus: "none" });
      return;
    }

    const s = JSON.parse(jsonMatch[0]);

    await PhotographerProfile.findByIdAndUpdate(profileId, {
      seoStatus:              "pending_review",
      pendingMetaTitle:       String(s.metaTitle       || "").slice(0, 70),
      pendingMetaDescription: String(s.metaDescription || "").slice(0, 160),
      pendingMetaKeywords:    Array.isArray(s.metaKeywords)
        ? s.metaKeywords.map((k) => String(k).trim()).filter(Boolean).slice(0, 10)
        : [],
      pendingSeoHeading:      String(s.seoHeading || "").slice(0, 100),
      pendingSlug:            String(s.slug || "")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60),
      seoGeneratedAt:         new Date(),
    });

    console.log(`[SEO-AI] Tags generated for profile ${profileId} — awaiting admin approval`);
  } catch (err) {
    console.error("[SEO-AI] Background generation failed:", err.message);
    // Reset so it can be retried on next visit
    await PhotographerProfile.findByIdAndUpdate(profileId, {
      seoStatus: "none",
    }).catch(() => {});
  }
}

// ── Main route handler ────────────────────────────────────────────────────────
exports.servePhotographerPage = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) return res.status(400).send("Missing photographer slug.");

    // Find by slug field, or by profile _id / userId when an ObjectId is given
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
    const query = isObjectId
      ? { $or: [{ slug }, { _id: slug }, { userId: slug }] }
      : { slug };

    const profile = await PhotographerProfile.findOne(query).populate(
      "userId",
      "name email profileImage"
    );

    if (!profile || profile.isPublished === false) {
      // Show a proper 404 page instead of the homepage
      return res.status(404).send(`<!DOCTYPE html><html><head><title>Photographer Not Found — SnapBook</title><meta name="robots" content="noindex"/><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#faf3e8;color:#3E2723;text-align:center}.box{padding:40px}.h1{font-size:2rem;margin-bottom:12px}.a{color:#D84315}</style></head><body><div class="box"><div style="font-size:64px">📷</div><h1>Photographer Not Found</h1><p>This profile doesn't exist or hasn't been published yet.</p><a href="/" style="color:#D84315;font-weight:700">← Browse Photographers</a></div></body></html>`);
    }

    const user = profile.userId;

    // Determine which SEO tags to inject
    let seo;
    if (profile.seoStatus === "approved" && profile.metaTitle) {
      // ✅ Admin-approved AI tags — use them
      const kw      = Array.isArray(profile.metaKeywords)
        ? profile.metaKeywords.join(", ")
        : profile.metaKeywords || "";
      const pageUrl = `${SITE_URL}/photographer/${profile.slug || profile._id}`;
      seo = {
        title:       profile.metaTitle,
        description: profile.metaDescription || "",
        keywords:    kw,
        image:       user?.profileImage || "",
        pageUrl,
        name:        user?.name || "Photographer",
        city:        profile.city || "",
        slug:        profile.slug || String(profile._id),
      };
    } else {
      // ⏳ No approved tags yet — use instant fallback from raw data
      seo = buildFallbackSeo(profile, user);

      // Trigger AI generation in background if not already started.
      // Also handle existing DB docs where seoStatus was never set (undefined/null).
      if (!profile.seoStatus || profile.seoStatus === "none") {
        const uid = profile.userId?._id || profile.userId;
        setImmediate(() => triggerAiSeoGeneration(profile._id, uid));
      }
    }

    const html = injectSeoIntoHtml(getTemplate(), seo, profile);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    // Cache approved pages for 1 hour, fallback pages not at all
    res.setHeader(
      "Cache-Control",
      profile.seoStatus === "approved" ? "public, max-age=3600" : "no-cache, no-store"
    );
    res.send(html);
  } catch (err) {
    console.error("[Photographer Page] Error:", err.message);
    res.status(500).send("Server error loading photographer page.");
  }
};
