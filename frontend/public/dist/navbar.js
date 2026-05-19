/**
 * SnapBook — Global Navigation Bar
 * Standalone vanilla JS • no React dependency • works on all pages
 */
(function () {
  'use strict';

  // Prevent double-injection
  if (document.getElementById('sk-global-nav')) return;

  /* ── Inject CSS ──────────────────────────────────────────── */
  var style = document.createElement('style');
  style.id = 'sk-global-nav-css';
  style.textContent = [
    '#sk-global-nav {',
    '  display:flex; align-items:center; justify-content:space-between;',
    '  padding:0 40px; height:60px;',
    '  background:#3E2723; border-bottom:2px solid #D84315;',
    '  position:sticky; top:0; z-index:1000; gap:20px;',
    '  box-sizing:border-box;',
    '  font-family:"DM Sans","Inter",system-ui,sans-serif;',
    '}',
    '#sk-global-nav * { box-sizing:border-box; text-decoration:none; }',
    '#sk-global-nav .gn-left  { display:flex; align-items:center; gap:32px; }',
    '#sk-global-nav .gn-right { display:flex; align-items:center; gap:10px; }',
    /* Logo */
    '#sk-global-nav .gn-logo {',
    '  font-family:"DM Serif Display",Georgia,serif;',
    '  font-size:1.4rem; color:#fff; letter-spacing:-0.02em;',
    '  cursor:pointer; white-space:nowrap;',
    '}',
    /* Nav links */
    '#sk-global-nav .gn-links { display:flex; align-items:center; gap:4px; }',
    '#sk-global-nav .gn-link {',
    '  font-family:"Caveat",cursive; font-size:1rem; font-weight:600;',
    '  color:rgba(255,255,255,0.78); padding:6px 14px;',
    '  border-radius:999px; transition:background .2s,color .2s;',
    '}',
    '#sk-global-nav .gn-link:hover,',
    '#sk-global-nav .gn-link.active {',
    '  background:rgba(255,255,255,0.14); color:#fff;',
    '}',
    /* Auth area */
    '#sk-global-nav .gn-auth { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }',
    '#sk-global-nav .gn-user-name {',
    '  font-family:"Caveat",cursive; font-size:1rem; font-weight:700; color:#fff;',
    '}',
    '#sk-global-nav .gn-user-role { font-size:.78rem; color:rgba(255,255,255,.5); }',
    /* Icon links (Cart, Wishlist, Dashboard) */
    '#sk-global-nav .gn-icon-link {',
    '  font-family:"Caveat",cursive; font-size:.9rem;',
    '  color:rgba(255,255,255,.78); padding:6px 12px;',
    '  border-radius:999px; transition:background .2s;',
    '}',
    '#sk-global-nav .gn-icon-link:hover { background:rgba(255,255,255,.14); color:#fff; }',
    /* Buttons */
    '#sk-global-nav .gn-btn {',
    '  display:inline-flex; align-items:center; padding:6px 18px;',
    '  font-family:"Caveat",cursive; font-size:.95rem; font-weight:700;',
    '  border:2px solid; border-radius:999px; cursor:pointer;',
    '  transition:background .2s,color .2s; white-space:nowrap;',
    '}',
    '#sk-global-nav .gn-btn-ghost { background:transparent; color:#fff; border-color:rgba(255,255,255,.45); }',
    '#sk-global-nav .gn-btn-ghost:hover { background:rgba(255,255,255,.1); border-color:rgba(255,255,255,.7); }',
    '#sk-global-nav .gn-btn-primary { background:#D84315; color:#fff; border-color:#b33a10; }',
    '#sk-global-nav .gn-btn-primary:hover { background:#c03b11; }',
    /* Logout */
    '#sk-global-nav .gn-logout {',
    '  background:transparent; color:rgba(255,255,255,.65);',
    '  border:2px solid rgba(255,255,255,.25); padding:6px 14px;',
    '  border-radius:999px; font-family:"Caveat",cursive;',
    '  font-size:.9rem; font-weight:600; cursor:pointer;',
    '  transition:background .2s,color .2s,border-color .2s;',
    '}',
    '#sk-global-nav .gn-logout:hover {',
    '  background:rgba(216,67,21,.18); color:#D84315;',
    '  border-color:rgba(216,67,21,.4);',
    '}',
    /* Responsive */
    '@media (max-width:640px) {',
    '  #sk-global-nav { padding:0 16px; }',
    '  #sk-global-nav .gn-links { display:none; }',
    '  #sk-global-nav .gn-user-role { display:none; }',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  /* ── Read auth state ─────────────────────────────────────── */
  var token = localStorage.getItem('token');
  var user  = null;
  try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch (e) {}

  /* ── Escape helper ───────────────────────────────────────── */
  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Build right-side HTML ───────────────────────────────── */
  var rightHtml = '';
  if (token && user) {
    var roleLinks = '';
    if (user.role === 'customer') {
      roleLinks =
        '<a href="/customer-dashboard.html" class="gn-icon-link">🛒 Cart</a>' +
        '<a href="/customer-dashboard.html" class="gn-icon-link">♡ Wishlist</a>' +
        '<a href="/customer-dashboard.html" class="gn-icon-link">Dashboard</a>';
    } else if (user.role === 'photographer') {
      roleLinks = '<a href="/photographer-dashboard.html" class="gn-icon-link">Dashboard</a>';
    } else if (user.role === 'admin') {
      roleLinks = '<a href="/admin-dashboard.html" class="gn-icon-link">Admin Panel</a>';
    }
    rightHtml =
      '<div class="gn-auth">' +
        '<span class="gn-user-name">' + esc(user.name) + '</span>' +
        '<span class="gn-user-role">' + esc(user.role) + '</span>' +
        roleLinks +
        '<button class="gn-logout" id="sk-gn-logout">Logout</button>' +
      '</div>';
  } else {
    rightHtml =
      '<div class="gn-auth">' +
        '<a href="/login.html" class="gn-btn gn-btn-ghost">Login</a>' +
        '<a href="/register.html" class="gn-btn gn-btn-primary">Sign Up</a>' +
      '</div>';
  }

  /* ── Active link detection ───────────────────────────────── */
  var path = window.location.pathname;
  var homeClass  = (path === '/' || /index\.html$/.test(path)) ? ' active' : '';
  var photogClass = /for-photographers/.test(path) ? ' active' : '';

  /* ── Build nav element ───────────────────────────────────── */
  var nav = document.createElement('nav');
  nav.id = 'sk-global-nav';
  nav.setAttribute('aria-label', 'Main navigation');
  nav.innerHTML =
    '<div class="gn-left">' +
      '<a href="/" class="gn-logo">SnapBook</a>' +
      '<div class="gn-links">' +
        '<a href="/" class="gn-link' + homeClass + '">Find Photographers</a>' +
        '<a href="/for-photographers.html" class="gn-link' + photogClass + '">Become a Seller</a>' +
      '</div>' +
    '</div>' +
    '<div class="gn-right">' + rightHtml + '</div>';

  /* ── Inject & attach handlers ────────────────────────────── */
  function inject() {
    if (!document.getElementById('sk-global-nav') && document.body) {
      document.body.insertBefore(nav, document.body.firstChild);
      var logoutBtn = document.getElementById('sk-gn-logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
        });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

}());
