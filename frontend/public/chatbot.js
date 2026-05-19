// frontend/public/chatbot.js — Creative Sketchbook floating chatbot widget
(function () {
  "use strict";

  // ── Inject Google Fonts (idempotent) ───────────────────────
  if (!document.querySelector('link[data-sb-fonts]')) {
    const lnk = document.createElement("link");
    lnk.rel = "stylesheet";
    lnk.setAttribute("data-sb-fonts", "1");
    lnk.href =
      "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Caveat:wght@400;600;700&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(lnk);
  }

  // ── Styles ─────────────────────────────────────────────────
  const css = `
    /* ─ Trigger button ─ */
    #sk-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 10000;
      width: 56px; height: 56px; border-radius: 52% 48% 55% 45% / 48% 52% 48% 52%;
      background: #7c4a1e; border: 2px solid #3E2723;
      box-shadow: 4px 4px 0 #3E2723;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: transform 0.14s, box-shadow 0.14s;
      padding: 0;
    }
    #sk-btn:hover { transform: translate(-1px,-1px); box-shadow: 6px 6px 0 #3E2723; }
    #sk-btn svg { width: 28px; height: 28px; pointer-events: none; }

    /* ─ Unread badge ─ */
    #sk-badge {
      position: absolute; top: -4px; right: -4px;
      min-width: 20px; height: 20px; padding: 0 5px;
      background: #D84315; color: #fff;
      border-radius: 10px; border: 2px solid #3E2723;
      font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 700;
      display: none; align-items: center; justify-content: center;
    }
    #sk-badge.visible { display: flex; }
    #sk-badge::before {
      content: '';
      position: absolute; inset: -5px;
      border-radius: 50%; border: 2px solid #D84315;
      animation: sk-pulse 1.6s ease-out infinite;
      pointer-events: none;
    }
    @keyframes sk-pulse {
      0%   { transform: scale(1);   opacity: 0.7; }
      70%  { transform: scale(1.7); opacity: 0; }
      100% { transform: scale(1.7); opacity: 0; }
    }

    /* ─ Chat window ─ */
    #sk-win {
      position: fixed; bottom: 92px; right: 24px; z-index: 9999;
      width: 380px; height: 560px;
      background: #fffcf5; border: 2px solid #3E2723;
      border-radius: 18px 22px 16px 20px;
      box-shadow: 8px 8px 0 #3E2723;
      display: none; flex-direction: column; overflow: hidden;
      font-family: 'Inter', sans-serif;
      transform-origin: bottom right;
      animation: sk-open 0.18s cubic-bezier(.34,1.2,.64,1);
    }
    #sk-win.open { display: flex; }
    @keyframes sk-open {
      from { transform: scale(0.88); opacity: 0; }
      to   { transform: scale(1);    opacity: 1; }
    }

    /* ─ Header ─ */
    #sk-head {
      background: #3E2723; padding: 14px 16px;
      display: flex; align-items: center; justify-content: space-between;
      flex-shrink: 0;
    }
    #sk-head-left { display: flex; align-items: center; gap: 10px; }
    #sk-head-av {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg,#c07c1a,#D84315);
      border: 2px solid rgba(255,255,255,0.3);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    #sk-head-av svg { width: 18px; height: 18px; }
    #sk-head-info { }
    #sk-head-title {
      font-family: 'DM Serif Display', serif;
      font-size: 16px; color: #fffcf5; line-height: 1.1;
    }
    #sk-head-status { display: flex; align-items: center; gap: 5px; margin-top: 2px; }
    #sk-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #4a7c59; border: 1px solid rgba(255,255,255,0.3);
    }
    #sk-head-status span {
      font-size: 11px; color: rgba(255,255,255,0.55); font-weight: 400;
    }
    #sk-close {
      background: rgba(255,255,255,0.1); border: 1.5px solid rgba(255,255,255,0.2);
      border-radius: 50%; width: 28px; height: 28px; cursor: pointer;
      color: rgba(255,255,255,0.75); font-size: 15px;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.14s; flex-shrink: 0;
    }
    #sk-close:hover { background: rgba(255,255,255,0.2); color: #fff; }

    /* ─ Messages area ─ */
    #sk-msgs {
      flex: 1; overflow-y: auto; padding: 14px 12px;
      display: flex; flex-direction: column; gap: 2px;
      scrollbar-width: thin; scrollbar-color: rgba(62,39,35,0.15) transparent;
    }
    #sk-msgs::-webkit-scrollbar { width: 4px; }
    #sk-msgs::-webkit-scrollbar-thumb { background: rgba(62,39,35,0.15); border-radius: 2px; }

    /* ─ Message bubbles ─ */
    .sk-row { display: flex; flex-direction: column; margin-bottom: 8px; }
    .sk-row.user { align-items: flex-end; }
    .sk-row.bot  { align-items: flex-start; }
    .sk-bubble {
      max-width: 82%;
      padding: 9px 13px;
      font-size: 13.5px; line-height: 1.55; border: 2px solid #3E2723;
      box-shadow: 2px 2px 0 #3E2723;
      word-wrap: break-word;
    }
    .sk-row.user .sk-bubble {
      background: #7c4a1e; color: #fffcf5;
      border-radius: 16px 18px 4px 16px;
    }
    .sk-row.bot .sk-bubble {
      background: #f3e8d8; color: #3E2723;
      border-radius: 4px 16px 16px 18px;
    }
    .sk-ts {
      font-size: 10.5px; color: rgba(62,39,35,0.38);
      margin-top: 3px; padding: 0 2px;
      font-family: 'Inter', sans-serif;
    }

    /* ─ Loading dots (sk-bounce) ─ */
    .sk-bounce-row { display: flex; align-items: center; gap: 5px; padding: 4px 2px; }
    .sk-dot-b {
      width: 7px; height: 7px; border-radius: 50%;
      background: #D84315;
      animation: sk-bounce-anim 1.1s ease-in-out infinite;
    }
    .sk-dot-b:nth-child(1) { animation-delay: 0s; }
    .sk-dot-b:nth-child(2) { animation-delay: 0.18s; }
    .sk-dot-b:nth-child(3) { animation-delay: 0.36s; }
    @keyframes sk-bounce-anim {
      0%, 60%, 100% { transform: translateY(0); }
      30%            { transform: translateY(-7px); }
    }

    /* ─ Photographer Polaroid cards ─ */
    .sk-polaroids { display: flex; flex-direction: column; gap: 9px; margin-top: 8px; }
    .sk-polaroid {
      background: #fff; border: 2px solid #3E2723;
      border-radius: 10px 12px 10px 12px;
      box-shadow: 3px 3px 0 #3E2723;
      overflow: hidden; color: inherit;
      display: flex; flex-direction: column;
      transition: transform 0.12s, box-shadow 0.12s;
      cursor: pointer;
    }
    .sk-polaroid:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 #3E2723; }
    .sk-polaroid-photo {
      width: 100%; height: 100px; object-fit: cover;
      border-bottom: 2px solid #3E2723; display: block;
    }
    .sk-polaroid-ph {
      width: 100%; height: 100px; background: #f3e8d8;
      border-bottom: 2px solid #3E2723;
      display: flex; align-items: center; justify-content: center;
    }
    .sk-polaroid-body { padding: 8px 11px 10px; }
    .sk-polaroid-name {
      font-family: 'DM Serif Display', serif; font-size: 14px; color: #3E2723;
      margin-bottom: 3px; line-height: 1.2;
    }
    .sk-polaroid-price {
      font-family: 'Caveat', cursive; font-size: 16px; font-weight: 700; color: #D84315;
    }
    .sk-polaroid-sub { font-size: 11.5px; color: rgba(62,39,35,0.6); margin-top: 2px; }
    .sk-polaroid-actions {
      display: flex; gap: 5px; margin-top: 8px;
    }
    .sk-polaroid-link {
      flex: 1; text-align: center; padding: 5px 0;
      font-family: 'Caveat', cursive; font-size: 12.5px; font-weight: 600;
      color: #3E2723; text-decoration: none;
      border: 1.5px solid #3E2723; border-radius: 5px;
      transition: background 0.12s, color 0.12s;
    }
    .sk-polaroid-link:hover { background: #f3e8d8; }
    .sk-polaroid-cart {
      flex: 1; text-align: center; padding: 5px 0;
      font-family: 'Caveat', cursive; font-size: 12.5px; font-weight: 700;
      color: #fff; text-decoration: none; cursor: pointer;
      background: #D84315; border: 1.5px solid #3E2723; border-radius: 5px;
      transition: background 0.12s;
    }
    .sk-polaroid-cart:hover { background: #bf360c; }

    /* ─ Inline booking form ─ */
    .sk-booking-form {
      background: #fff; border: 2px solid #3E2723;
      border-radius: 10px 12px 10px 12px;
      box-shadow: 3px 3px 0 #3E2723; padding: 13px 14px; width: 100%;
    }
    .sk-bf-ph-row {
      display: flex; align-items: center; gap: 9px;
      margin-bottom: 10px; padding-bottom: 10px;
      border-bottom: 1px dashed rgba(62,39,35,0.2);
    }
    .sk-bf-ph-name { font-family: 'DM Serif Display', serif; font-size: 13.5px; color: #3E2723; }
    .sk-bf-ph-sub  { font-size: 11px; color: rgba(62,39,35,0.5); margin-top: 1px; }
    .sk-bf-label {
      display: block; font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.05em;
      color: #795548; margin-bottom: 4px; margin-top: 10px;
    }
    .sk-bf-input {
      width: 100%; background: #f3e8d8;
      border: 1.5px solid rgba(62,39,35,0.25); border-radius: 7px;
      padding: 7px 10px; font-size: 13px; color: #3E2723;
      font-family: 'Inter', sans-serif; outline: none; box-sizing: border-box;
    }
    .sk-bf-input:focus { border-color: #D84315; }
    .sk-bf-dur-row { display: flex; gap: 5px; margin-top: 4px; }
    .sk-bf-dur-btn {
      flex: 1; padding: 6px 0; text-align: center;
      font-family: 'Caveat', cursive; font-size: 15px; font-weight: 700; color: #3E2723;
      background: #fff; border: 1.5px solid #3E2723; border-radius: 6px;
      cursor: pointer; transition: all 0.1s;
    }
    .sk-bf-dur-btn.active { background: #3E2723; color: #fff; }
    .sk-bf-price {
      margin-top: 10px; font-family: 'Caveat', cursive;
      font-size: 16px; font-weight: 700; color: #3E2723;
    }
    .sk-bf-price span { font-size: 12px; font-weight: 400; color: #795548; font-family: 'Inter', sans-serif; }
    .sk-bf-submit {
      width: 100%; margin-top: 10px; padding: 9px;
      background: #D84315; color: #fff;
      border: 1.5px solid #3E2723; border-radius: 7px;
      font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700;
      cursor: pointer; transition: opacity 0.1s, transform 0.1s;
    }
    .sk-bf-submit:not(:disabled):hover { opacity: 0.9; transform: translateY(-1px); }
    .sk-bf-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .sk-bf-success {
      text-align: center; padding: 14px 8px;
      font-family: 'Caveat', cursive; font-size: 16px;
    }
    .sk-bf-success-check { font-size: 30px; margin-bottom: 6px; }

    /* ─ Order timeline ─ */
    .sk-timeline { display: flex; flex-direction: column; gap: 0; margin-top: 8px; }
    .sk-tl-item { display: flex; gap: 10px; padding-bottom: 12px; position: relative; }
    .sk-tl-item::before {
      content: ''; position: absolute; left: 8px; top: 16px; bottom: 0;
      width: 2px;
      border-left: 2px dashed rgba(62,39,35,0.25);
    }
    .sk-tl-item:last-child::before { display: none; }
    .sk-tl-dot {
      width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0;
      border: 2px solid #3E2723; background: #D84315;
      margin-top: 1px; z-index: 1;
    }
    .sk-tl-dot.done  { background: #4a7c59; }
    .sk-tl-dot.wait  { background: #f3e8d8; }
    .sk-tl-dot.active{ background: #D84315; }
    .sk-tl-body { flex: 1; }
    .sk-tl-status { font-size: 12.5px; font-weight: 600; color: #3E2723; line-height: 1.3; }
    .sk-tl-msg    { font-size: 12px;   color: rgba(62,39,35,0.65); margin-top: 1px; line-height: 1.45; }
    .sk-tl-time   { font-size: 10.5px; color: rgba(62,39,35,0.38); margin-top: 2px; }

    /* ─ Booking card ─ */
    .sk-booking {
      background: #fff; border: 2px solid #3E2723; border-radius: 10px;
      box-shadow: 2px 2px 0 #3E2723; padding: 10px 12px; margin-top: 6px;
      font-size: 13px; line-height: 1.55;
    }
    .sk-booking strong { font-weight: 600; }
    .sk-b-badge {
      display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 8px;
      border-radius: 10px; border: 1.5px solid; margin-top: 4px; text-transform: uppercase;
    }
    .sk-b-pending   { color: #c07c1a; border-color: #c07c1a; background: rgba(192,124,26,0.1); }
    .sk-b-confirmed { color: #4a7c59; border-color: #4a7c59; background: rgba(74,124,89,0.1); }
    .sk-b-completed { color: #1565c0; border-color: #1565c0; background: rgba(21,101,192,0.1); }
    .sk-b-cancelled { color: #b84040; border-color: #b84040; background: rgba(184,64,64,0.1); }

    /* ─ Quick reply chips ─ */
    #sk-chips {
      padding: 8px 12px 0;
      display: flex; flex-wrap: wrap; gap: 7px;
      border-top: 1px solid rgba(62,39,35,0.08);
      flex-shrink: 0;
    }
    .sk-chip {
      font-family: 'Caveat', cursive; font-size: 13.5px; font-weight: 600;
      color: #3E2723; background: #f3e8d8;
      border: 2px solid #3E2723; border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
      padding: 4px 13px; cursor: pointer;
      box-shadow: 2px 2px 0 #3E2723;
      transition: transform 0.12s, box-shadow 0.12s, background 0.12s;
      white-space: nowrap;
    }
    .sk-chip:hover {
      background: #D84315; color: #fff;
      transform: translate(-1px,-1px); box-shadow: 3px 3px 0 #3E2723;
    }

    /* ─ Input row ─ */
    #sk-input-row {
      display: flex; gap: 8px; padding: 10px 12px 12px;
      border-top: 2px solid rgba(62,39,35,0.1);
      flex-shrink: 0; background: #fffcf5;
    }
    #sk-input {
      flex: 1; border: 2px solid #3E2723; border-radius: 10px;
      padding: 9px 12px; font-family: 'Inter', sans-serif; font-size: 13.5px;
      background: #f3e8d8; color: #3E2723; outline: none;
      box-shadow: inset 0 0 0 0 transparent; transition: box-shadow 0.15s;
    }
    #sk-input:focus { box-shadow: 2px 2px 0 #3E2723; }
    #sk-input::placeholder { color: rgba(62,39,35,0.45); }
    #sk-send {
      width: 40px; height: 40px; border-radius: 50%;
      background: #D84315; border: 2px solid #3E2723;
      box-shadow: 2px 2px 0 #3E2723;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: transform 0.12s, box-shadow 0.12s; flex-shrink: 0;
    }
    #sk-send:hover:not(:disabled) { transform: translate(-1px,-1px); box-shadow: 3px 3px 0 #3E2723; }
    #sk-send:disabled { opacity: 0.5; cursor: default; transform: none; }
    #sk-send svg { width: 17px; height: 17px; pointer-events: none; }
  `;

  const styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── SVG Assets ─────────────────────────────────────────────
  const CAMERA_SVG = `<svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="9" width="22" height="15" rx="3" stroke="white" stroke-width="2"/>
    <path d="M10 9V8C10 6.9 10.9 6 12 6H16C17.1 6 18 6.9 18 8V9" stroke="white" stroke-width="2"/>
    <circle cx="14" cy="16" r="3.5" stroke="white" stroke-width="2"/>
    <rect x="19" y="12" width="3" height="2" rx="0.5" fill="white"/>
  </svg>`;

  const SEND_SVG = `<svg viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 8.5H15M15 8.5L9.5 3M15 8.5L9.5 14" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  const BOT_SVG = `<svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="14" height="10" rx="3" stroke="white" stroke-width="1.6"/>
    <circle cx="6.5" cy="11" r="1.5" fill="white"/>
    <circle cx="11.5" cy="11" r="1.5" fill="white"/>
    <path d="M9 2V6M7 2H11" stroke="white" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`;

  // ── DOM Construction ───────────────────────────────────────
  const btn = document.createElement("button");
  btn.id = "sk-btn";
  btn.title = "Chat with SnapBook AI";
  btn.setAttribute("aria-label", "Open chat");
  btn.innerHTML = CAMERA_SVG;

  const badge = document.createElement("span");
  badge.id = "sk-badge";
  badge.textContent = "1";
  btn.appendChild(badge);

  const win = document.createElement("div");
  win.id = "sk-win";
  win.setAttribute("role", "dialog");
  win.setAttribute("aria-label", "SnapBook AI chat");
  win.innerHTML = `
    <div id="sk-head">
      <div id="sk-head-left">
        <div id="sk-head-av">${BOT_SVG}</div>
        <div id="sk-head-info">
          <div id="sk-head-title">SnapBook AI</div>
          <div id="sk-head-status">
            <div id="sk-dot"></div>
            <span>Online</span>
          </div>
        </div>
      </div>
      <button id="sk-close" aria-label="Close chat">×</button>
    </div>
    <div id="sk-msgs" role="log" aria-live="polite" aria-label="Chat messages"></div>
    <div id="sk-chips">
      <button class="sk-chip" data-msg="Find a photographer">Find Photographer</button>
      <button class="sk-chip" data-msg="Show my orders">My Orders</button>
      <button class="sk-chip" data-msg="How do I book?">How to Book</button>
      <button class="sk-chip" data-msg="What is your refund policy?">Refund Policy</button>
    </div>
    <div id="sk-input-row">
      <input id="sk-input" type="text" placeholder="Ask me anything…" autocomplete="off" maxlength="500" />
      <button id="sk-send" aria-label="Send message">${SEND_SVG}</button>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(win);

  // ── References ─────────────────────────────────────────────
  const msgsEl  = win.querySelector("#sk-msgs");
  const inputEl = win.querySelector("#sk-input");
  const sendBtn = win.querySelector("#sk-send");

  // ── State ──────────────────────────────────────────────────
  let isOpen      = false;
  let isWaiting   = false;
  let history     = [];            // {role, content}
  let initialized = false;

  const token = () => localStorage.getItem("token");

  function getUserName() {
    try {
      const raw = localStorage.getItem("user");
      if (raw) { const u = JSON.parse(raw); if (u?.name) return u.name; }
      const t = token();
      if (t) { const pl = JSON.parse(atob(t.split(".")[1])); return pl.name || pl.email || null; }
    } catch (_) {}
    return null;
  }

  // ── Open / Close ───────────────────────────────────────────
  function openChat() {
    isOpen = true;
    win.classList.add("open");
    badge.classList.remove("visible");
    btn.setAttribute("aria-expanded", "true");
    inputEl.focus();
    if (!initialized) { initialized = true; showWelcome(); }
    scrollBottom();
  }

  function closeChat() {
    isOpen = false;
    win.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  }

  btn.addEventListener("click", () => isOpen ? closeChat() : openChat());
  win.querySelector("#sk-close").addEventListener("click", closeChat);

  // ── Show unread badge after 4s if not opened ───────────────
  setTimeout(() => { if (!isOpen) badge.classList.add("visible"); }, 4000);

  // ── Welcome message ────────────────────────────────────────
  function showWelcome() {
    const name = getUserName();
    const greeting = name ? `Hi ${name}! ` : "Hi there! ";
    addBotRow(`${greeting}I'm SnapBook AI. How can I help you today?`);
  }

  // ── Quick reply chips ──────────────────────────────────────
  win.querySelectorAll(".sk-chip").forEach(chip => {
    chip.addEventListener("click", () => send(chip.dataset.msg));
  });

  // ── Input handlers ─────────────────────────────────────────
  sendBtn.addEventListener("click", () => send());
  inputEl.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } });

  // ── Send ───────────────────────────────────────────────────
  async function send(text) {
    if (isWaiting) return;
    const msg = (text || inputEl.value).trim();
    if (!msg) return;
    inputEl.value = "";

    if (!token()) {
      addBotRow("Please log in to chat with SnapBook AI. 👉 [Login](/login.html)");
      return;
    }

    addUserRow(msg);
    history.push({ role: "user", content: msg });
    if (history.length > 12) history = history.slice(-12);

    isWaiting = true;
    sendBtn.disabled = true;
    const typingEl = addTypingRow();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token() },
        body: JSON.stringify({ message: msg, conversationHistory: history.slice(-6) }),
      });

      typingEl.remove();

      if (res.status === 401) { window.location.href = "/login.html"; return; }
      if (!res.ok) { addBotRow("Connection error — please try again."); return; }

      const data = await res.json();
      if (!data.success) { addBotRow(data.message || "Something went wrong."); return; }

      history.push({ role: "assistant", content: data.message || "" });
      if (history.length > 12) history = history.slice(-12);

      renderResponse(data);
    } catch (e) {
      typingEl.remove();
      addBotRow("Network error — please check your connection.");
    } finally {
      isWaiting = false;
      sendBtn.disabled = false;
    }
  }

  // ── Response renderer ──────────────────────────────────────
  function renderResponse(data) {
    const type = data.type;

    if (type === "photographers" && data.photographers?.length) {
      addBotRow(data.message);
      const row = document.createElement("div");
      row.className = "sk-row bot";
      const polaroids = document.createElement("div");
      polaroids.className = "sk-polaroids";
      data.photographers.forEach(p => {
        polaroids.appendChild(buildPolaroid(p));
      });
      row.appendChild(polaroids);
      msgsEl.appendChild(row);

    } else if (type === "booking_timeline" && data.booking) {
      addBotRow(data.message);
      const row = document.createElement("div");
      row.className = "sk-row bot";
      const card = buildBookingCard(data.booking);
      if (data.timeline?.length) {
        card.appendChild(buildTimeline(data.timeline));
      }
      row.appendChild(card);
      msgsEl.appendChild(row);

    } else if (type === "bookings" && data.bookings?.length) {
      addBotRow(data.message);
      const row = document.createElement("div");
      row.className = "sk-row bot";
      data.bookings.forEach(b => row.appendChild(buildBookingCard(b)));
      msgsEl.appendChild(row);

    } else if (type === "cart" && data.cart) {
      addBotRow(data.message);
      if (data.cart.items?.length) {
        const row = document.createElement("div");
        row.className = "sk-row bot";
        data.cart.items.forEach(item => {
          const c = document.createElement("div");
          c.className = "sk-booking";
          c.innerHTML = `
            <strong>${esc(item.photographer || "Photographer")}</strong> &middot; ${esc(item.eventType || "")}<br>
            📅 ${item.eventDate ? new Date(item.eventDate).toLocaleDateString() : "—"} &middot; ${item.duration || "—"}h<br>
            <strong style="color:#D84315">PKR ${Number(item.totalPrice || 0).toLocaleString("en-PK")}</strong>
          `;
          row.appendChild(c);
        });
        if (data.cart.totalCost) {
          const total = document.createElement("div");
          total.style.cssText = "margin-top:8px;font-family:'Caveat',cursive;font-size:16px;font-weight:700;color:#3E2723;";
          total.textContent = `Total: PKR ${Number(data.cart.totalCost).toLocaleString("en-PK")}`;
          row.appendChild(total);
        }
        msgsEl.appendChild(row);
      }

    } else {
      addBotRow(data.message || "I'm not sure how to help with that.");
    }

    scrollBottom();
  }

  // ── Rich element builders ──────────────────────────────────
  function buildPolaroid(p) {
    const profileUrl = p.slug
      ? `/photographer/${esc(p.slug)}`
      : (p.id || p._id ? `/photographer/${esc(p.id || p._id)}` : "#");
    const bookingUrl = profileUrl !== "#" ? profileUrl + "#booking-sidebar" : "#";
    const imgSrc = p.image || p.profileImage || "";

    const div = document.createElement("div");
    div.className = "sk-polaroid";
    div.addEventListener("click", function (e) {
      if (e.target.closest(".sk-polaroid-cart")) return;
      window.location.href = profileUrl;
    });

    div.innerHTML = `
      ${ imgSrc
        ? `<img class="sk-polaroid-photo" src="${esc(imgSrc)}" alt="${esc(p.name || 'Photographer')}" loading="lazy"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
           <div class="sk-polaroid-ph" style="display:none"><svg viewBox="0 0 24 24" fill="none" stroke="#c9b499" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:32px;height:32px"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg></div>`
        : `<div class="sk-polaroid-ph"><svg viewBox="0 0 24 24" fill="none" stroke="#c9b499" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:32px;height:32px"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg></div>`
      }
      <div class="sk-polaroid-body">
        <div class="sk-polaroid-name">${esc(p.name || "Photographer")}</div>
        <div class="sk-polaroid-price">PKR ${Number(p.pricePerHour || 0).toLocaleString("en-PK")}/hr</div>
        <div class="sk-polaroid-sub">
          ${p.specialization ? esc(p.specialization) : "Photography"}
          ${p.city ? " &middot; " + esc(p.city) : ""}
          ${p.rating ? " &middot; " + Number(p.rating).toFixed(1) + " \u2605" : ""}
        </div>
        <div class="sk-polaroid-actions">
          <a class="sk-polaroid-link" href="${esc(profileUrl)}">View Profile</a>
          <button class="sk-polaroid-cart" type="button">Add to Cart</button>
        </div>
      </div>
    `;
    div.querySelector(".sk-polaroid-cart").addEventListener("click", function (e) {
      e.stopPropagation();
      showBookingForm(p);
    });
    return div;
  }

  function buildBookingCard(b) {
    const card = document.createElement("div");
    card.className = "sk-booking";
    const status = (b.status || "pending").toLowerCase();
    card.innerHTML = `
      <strong>${esc(b.photographer || b.photographerName || "Photographer")}</strong> &middot; ${esc(b.eventType || "")}<br>
      📅 ${b.eventDate ? new Date(b.eventDate).toLocaleDateString("en-US", {month:"short",day:"numeric",year:"numeric"}) : "—"}
      ${b.location ? " &middot; 📍 " + esc(b.location) : ""}<br>
      <strong style="color:#D84315">PKR ${Number(b.totalAmount || b.totalPrice || 0).toLocaleString("en-PK")}</strong>
      <div><span class="sk-b-badge sk-b-${esc(status)}">${esc(status)}</span></div>
    `;
    return card;
  }

  function buildTimeline(items) {
    const tl = document.createElement("div");
    tl.className = "sk-timeline";
    tl.style.marginTop = "10px";
    items.forEach((t, i) => {
      const step = document.createElement("div");
      step.className = "sk-tl-item";
      const isDone = i < items.length - 1;
      const dotCls = isDone ? "done" : "active";
      step.innerHTML = `
        <div class="sk-tl-dot ${dotCls}"></div>
        <div class="sk-tl-body">
          <div class="sk-tl-status">${esc(t.status || "")}</div>
          ${t.message ? `<div class="sk-tl-msg">${esc(t.message)}</div>` : ""}
          ${t.timestamp ? `<div class="sk-tl-time">${new Date(t.timestamp).toLocaleString("en-US",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})}</div>` : ""}
        </div>
      `;
      tl.appendChild(step);
    });
    return tl;
  }

  // ── Inline booking form ────────────────────────────────────
  let _bfCounter = 0;
  const BOOKING_EVENT_TYPES = ['Wedding','Portrait','Corporate','Fashion','Events','Family','Birthday','Maternity','Real Estate','Product','Sports'];

  function showBookingForm(p) {
    addBotRow(`Book ${esc(p.name || 'this photographer')} — fill in the details below:`);
    const row = document.createElement("div");
    row.className = "sk-row bot";
    row.style.maxWidth = "100%";
    row.appendChild(buildBookingForm(p));
    msgsEl.appendChild(row);
    scrollBottom();
  }

  function buildBookingForm(p) {
    ++_bfCounter;
    const photographerId = p.userId || p.id || p._id;
    const pph = Number(p.pricePerHour || 0);
    let duration = 4;

    const wrap = document.createElement("div");
    wrap.className = "sk-booking-form";
    wrap.innerHTML = `
      <div class="sk-bf-ph-row">
        <div>
          <div class="sk-bf-ph-name">${esc(p.name || 'Photographer')}</div>
          <div class="sk-bf-ph-sub">PKR ${pph.toLocaleString('en-PK')}/hr · ${esc(p.specialization || 'Photography')}${p.city ? ' · ' + esc(p.city) : ''}</div>
        </div>
      </div>
      <label class="sk-bf-label">Shoot Date *</label>
      <input type="date" class="sk-bf-input" data-bf="date" min="${new Date().toISOString().split('T')[0]}" />
      <label class="sk-bf-label">Event Type *</label>
      <select class="sk-bf-input" data-bf="event">
        <option value="">Select event type…</option>
        ${BOOKING_EVENT_TYPES.map(et => `<option value="${esc(et)}">${esc(et)}</option>`).join('')}
      </select>
      <label class="sk-bf-label">Location *</label>
      <input type="text" class="sk-bf-input" data-bf="location" placeholder="e.g. Gulberg, Lahore" maxlength="200" />
      <label class="sk-bf-label">Duration</label>
      <div class="sk-bf-dur-row">
        ${[2,4,6,8].map(h => `<button class="sk-bf-dur-btn${h===4?' active':''}" data-h="${h}" type="button">${h}h</button>`).join('')}
      </div>
      <label class="sk-bf-label">Notes (optional)</label>
      <textarea class="sk-bf-input" data-bf="notes" rows="2" placeholder="Special requests…" style="resize:vertical;border-radius:7px;" maxlength="1000"></textarea>
      <div class="sk-bf-price" data-bf="price">Total: PKR ${(pph * 4).toLocaleString('en-PK')} <span>(4h)</span></div>
      <button class="sk-bf-submit" type="button">Add to Cart</button>
    `;

    // Duration toggle
    const durRow   = wrap.querySelector('.sk-bf-dur-row');
    const priceDiv = wrap.querySelector('[data-bf="price"]');
    durRow.addEventListener('click', e => {
      const b = e.target.closest('.sk-bf-dur-btn');
      if (!b) return;
      durRow.querySelectorAll('.sk-bf-dur-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      duration = parseInt(b.dataset.h);
      priceDiv.innerHTML = `Total: PKR ${(pph * duration).toLocaleString('en-PK')} <span>(${duration}h)</span>`;
    });

    // Submit
    const submitBtn = wrap.querySelector('.sk-bf-submit');
    submitBtn.addEventListener('click', async () => {
      if (!token()) { window.location.href = '/login.html'; return; }
      const dateVal     = wrap.querySelector('[data-bf="date"]').value;
      const eventVal    = wrap.querySelector('[data-bf="event"]').value;
      const locationVal = wrap.querySelector('[data-bf="location"]').value.trim();
      const notesVal    = wrap.querySelector('[data-bf="notes"]').value.trim();

      if (!dateVal)     { addBotRow('Please select a shoot date.'); scrollBottom(); return; }
      if (!eventVal)    { addBotRow('Please select an event type.'); scrollBottom(); return; }
      if (!locationVal) { addBotRow('Please enter a location.'); scrollBottom(); return; }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Adding…';

      try {
        const res = await fetch('/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() },
          body: JSON.stringify({
            photographerId,
            eventDate: dateVal,
            eventType: eventVal,
            location: locationVal,
            duration,
            pricePerHour: pph,
            notes: notesVal,
          }),
        });
        if (res.status === 401) { window.location.href = '/login.html'; return; }
        const data = await res.json();
        if (data?.success) {
          wrap.innerHTML = `
            <div class="sk-bf-success">
              <div class="sk-bf-success-check" style="color:#4a7c59">✓</div>
              <strong style="font-size:18px;color:#4a7c59;">Added to Cart!</strong><br>
              <span style="font-size:12.5px;color:#5D4037;font-weight:400;font-family:'Inter',sans-serif;line-height:1.6;">
                ${esc(p.name || 'Photographer')} · ${esc(eventVal)}<br>
                ${esc(dateVal)} · ${duration}h · PKR ${(pph * duration).toLocaleString('en-PK')}
              </span><br>
              <a href="/customer-dashboard.html" style="display:inline-block;margin-top:10px;padding:7px 18px;background:#3E2723;color:#fff;border-radius:20px;font-size:12px;font-weight:700;text-decoration:none;font-family:'Inter',sans-serif;">View Cart →</a>
            </div>
          `;
          scrollBottom();
        } else {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Add to Cart';
          addBotRow(data?.message || 'Could not add to cart. Please try again.');
          scrollBottom();
        }
      } catch (_) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add to Cart';
        addBotRow('Network error. Please try again.');
        scrollBottom();
      }
    });

    return wrap;
  }

  // ── DOM row helpers ────────────────────────────────────────
  function addUserRow(text) {
    const row = document.createElement("div");
    row.className = "sk-row user";
    const bubble = document.createElement("div");
    bubble.className = "sk-bubble";
    bubble.textContent = text;
    const ts = mkTs();
    row.appendChild(bubble);
    row.appendChild(ts);
    msgsEl.appendChild(row);
    scrollBottom();
  }

  function addBotRow(text) {
    const row = document.createElement("div");
    row.className = "sk-row bot";
    const bubble = document.createElement("div");
    bubble.className = "sk-bubble";
    bubble.textContent = text;
    const ts = mkTs();
    row.appendChild(bubble);
    row.appendChild(ts);
    msgsEl.appendChild(row);
    scrollBottom();
    return row;
  }

  function addTypingRow() {
    const row = document.createElement("div");
    row.className = "sk-row bot";
    const bubble = document.createElement("div");
    bubble.className = "sk-bubble";
    bubble.innerHTML = `<div class="sk-bounce-row"><div class="sk-dot-b"></div><div class="sk-dot-b"></div><div class="sk-dot-b"></div></div>`;
    row.appendChild(bubble);
    msgsEl.appendChild(row);
    scrollBottom();
    return row;
  }

  function mkTs() {
    const el = document.createElement("div");
    el.className = "sk-ts";
    el.textContent = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    return el;
  }

  // ── Utilities ──────────────────────────────────────────────
  function scrollBottom() {
    requestAnimationFrame(() => { msgsEl.scrollTop = msgsEl.scrollHeight; });
  }

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

})();
