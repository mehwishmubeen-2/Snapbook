console.log("react-app.js loaded");

const { useState, useEffect, useRef } = React;
const Helmet = (window.ReactHelmet && window.ReactHelmet.Helmet) || ((props) => props.children);

// ===== NAVBAR =====
function Navbar({ current }) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <span className="logo-text">SnapBook</span>
        <nav className="nav-links">
          <a href="/" className={"nav-link" + (current === "home" ? " active" : "")}>Find Photographers</a>
          <a href="/for-photographers.html" className={"nav-link" + (current === "for-photographers" ? " active" : "")}>Become a Seller (Photographer)</a>
        </nav>
      </div>
      <div className="navbar-right">
        {token && user ? (
          <div className="navbar-auth">
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">({user.role})</span>
            </div>
            {user.role === "customer" && (
              <>
                <a href="/customer-dashboard.html#cart" className="nav-icon" title="Shopping Cart">Cart</a>
                <a href="/customer-dashboard.html#wishlist" className="nav-icon" title="Wishlist">Wishlist</a>
                <a href="/customer-dashboard.html" className="nav-icon" title="My Dashboard">Dashboard</a>
              </>
            )}
            {user.role === "photographer" && (
              <a href="/photographer-dashboard.html" className="nav-icon" title="Photographer Dashboard">Dashboard</a>
            )}
            {user.role === "admin" && (
              <a href="/admin-dashboard.html" className="nav-icon" title="Admin Dashboard">Admin</a>
            )}
            <button onClick={handleLogout} className="btn btn-ghost">Logout</button>
          </div>
        ) : (
          <>
            <a href="login.html" className="btn btn-navbar-ghost">Login</a>
            <a href="register.html" className="btn btn-primary">Sign Up</a>
          </>
        )}
      </div>
    </header>
  );
}

// ===== FOOTER =====
function Footer() {
  return (
    <footer className="sk-footer">
      {/* Hand-drawn top border via CSS */}
      <div className="sk-footer-inner">
        <div className="sk-footer-col sk-footer-brand">
          <div className="sk-footer-logo">
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <path d="M5 16 L5 40 C5 41.5 6.5 43 8 43 L40 43 C41.5 43 43 41.5 43 40 L43 16 C43 14.5 41.5 13 40 13 L8 13 C6.5 13 5 14.5 5 16 Z" stroke="#FDFBF7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="24" cy="28" r="8" stroke="#FDFBF7" strokeWidth="2.2"/>
              <circle cx="24" cy="28" r="3" stroke="#D84315" strokeWidth="1.8"/>
              <path d="M18 13 L20 7 L28 7 L30 13" stroke="#FDFBF7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>SnapBook</span>
          </div>
          <p className="sk-footer-tagline">The sketchbook for your most important moments.</p>
        </div>
        <div className="sk-footer-col">
          <h4>For Clients</h4>
          <a href="#">Browse Photographers</a>
          <a href="#">How It Works</a>
          <a href="register.html">Create Account</a>
          <a href="login.html">Sign In</a>
        </div>
        <div className="sk-footer-col">
          <h4>For Photographers</h4>
          <a href="register.html">Join SnapBook</a>
          <a href="/photographer-dashboard.html">Dashboard</a>
          <a href="#">Pricing</a>
          <a href="#">Success Stories</a>
        </div>
        <div className="sk-footer-col">
          <h4>Contact</h4>
          <a href="mailto:support@snapbook.com">support@snapbook.com</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Help Centre</a>
        </div>
      </div>
      <div className="sk-footer-bottom">&copy; 2024 SnapBook. All rights reserved.</div>
    </footer>
  );
}

// ===== CATEGORY ICONS =====
function CategoryIcon({ name, color }) {
  if (name === "Weddings") return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="17" cy="28" r="10" stroke={color} strokeWidth="2.5"/>
      <circle cx="31" cy="28" r="10" stroke={color} strokeWidth="2.5" strokeDasharray="3 1.5"/>
      <path d="M24 17 C24 17 21 12 17 14 C13 16 13 20 17 22 C20 23.5 24 26 24 26 C24 26 28 23.5 31 22 C35 20 35 16 31 14 C27 12 24 17 24 17Z" fill={color} opacity="0.25" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
      <circle cx="17" cy="17" r="2" fill={color} opacity="0.7"/>
    </svg>
  );
  if (name === "Portraits") return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="36" height="36" rx="3" stroke={color} strokeWidth="2.5"/>
      <rect x="10" y="10" width="28" height="28" rx="2" fill={color} opacity="0.08"/>
      <circle cx="24" cy="21" r="7" stroke={color} strokeWidth="2"/>
      <path d="M11 42 C13 33 18 29 24 29 C30 29 35 33 37 42" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
  if (name === "Corporate") return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="9" y="10" width="30" height="32" rx="2" stroke={color} strokeWidth="2.5" fill={color} fillOpacity="0.06"/>
      <path d="M9 20 L39 20M9 30 L39 30" stroke={color} strokeWidth="1.5" opacity="0.5"/>
      <rect x="20" y="36" width="8" height="6" stroke={color} strokeWidth="2"/>
      <rect x="13" y="14" width="4" height="4" rx="1" fill={color} opacity="0.5"/>
      <rect x="22" y="14" width="4" height="4" rx="1" fill={color} opacity="0.5"/>
      <rect x="31" y="14" width="4" height="4" rx="1" fill={color} opacity="0.5"/>
      <rect x="13" y="24" width="4" height="4" rx="1" fill={color} opacity="0.5"/>
      <rect x="22" y="24" width="4" height="4" rx="1" fill={color} opacity="0.5"/>
      <rect x="31" y="24" width="4" height="4" rx="1" fill={color} opacity="0.5"/>
    </svg>
  );
  if (name === "Fashion") return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 5 C22 5 20 7 20 9" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M26 9 C26 7 26 5 24 5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 9 L10 20 L17 22 L11 43 L37 43 L31 22 L38 20 L28 9" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.12"/>
      <path d="M20 9 C20 9 22 13 24 13 C26 13 28 9 28 9" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
  if (name === "Events") return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 20 L7 42 C7 43.5 8.5 45 10 45 L38 45 C39.5 45 41 43.5 41 42 L41 20 C41 18.5 39.5 17 38 17 L10 17 C8.5 17 7 18.5 7 20Z" stroke={color} strokeWidth="2.5" fill={color} fillOpacity="0.08"/>
      <circle cx="24" cy="31" r="7" stroke={color} strokeWidth="2"/>
      <circle cx="24" cy="31" r="3" fill={color} opacity="0.5"/>
      <path d="M18 17 L20 11 L28 11 L30 17" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="36" cy="22" r="2.5" fill={color}/>
      <path d="M14 6 L15 10M20 4 L20 8M26 4 L27 8" stroke={color} strokeWidth="1.8" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
  if (name === "Family") return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 22 L24 7 L41 22 L41 44 L7 44Z" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.1"/>
      <path d="M18 44 L18 32 C18 29.5 20.5 28 24 28 C27.5 28 30 29.5 30 32 L30 44" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M24 16 C24 16 19 13 19 18 C19 21 21.5 23 24 25 C26.5 23 29 21 29 18 C29 13 24 16 24 16Z" fill={color} stroke={color} strokeWidth="1.5" strokeLinejoin="round" opacity="0.7"/>
    </svg>
  );
  return null;
}

// ===== LANDING PAGE =====
function LandingPage() {
  const [cities, setCities] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedEventType, setSelectedEventType] = useState("");
  const [photographers, setPhotographers] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loadingPhotographers, setLoadingPhotographers] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const featuredRef = useRef(null);

  useEffect(() => {
    fetch("/api/photographers/filters/cities")
      .then(r => r.json())
      .then(d => { if (d.success) setCities(d.cities); })
      .catch(() => {});
    fetch("/api/photographers/filters/event-types")
      .then(r => r.json())
      .then(d => { if (d.success) setEventTypes(d.eventTypes); })
      .catch(() => {});
    loadPhotographers("All");
  }, []);

  const loadPhotographers = (filter) => {
    setLoadingPhotographers(true);
    const params = new URLSearchParams({ limit: 6 });
    if (filter && filter !== "All") params.set("eventType", filter);
    fetch(`/api/photographers?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setPhotographers(d.photographers);
        setLoadingPhotographers(false);
      })
      .catch(() => setLoadingPhotographers(false));
  };

  const handleSearch = () => {
    setLoadingPhotographers(true);
    setHasSearched(true);
    const params = new URLSearchParams({ limit: 12 });
    if (selectedCity) params.set("city", selectedCity);
    if (selectedEventType) params.set("eventType", selectedEventType);
    fetch(`/api/photographers?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setPhotographers(d.photographers);
        setLoadingPhotographers(false);
        setTimeout(() => featuredRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      })
      .catch(() => setLoadingPhotographers(false));
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setHasSearched(false);
    loadPhotographers(filter);
  };

  const renderStars = (rating) => Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < Math.round(rating || 0) ? "#D84315" : "#c9b499" }}>★</span>
  ));

  const ROTATIONS = ["-2.2deg", "1.6deg", "-1deg", "2.4deg", "-0.6deg", "1.2deg"];
  const FILTER_PILLS = ["All", "Wedding", "Portrait", "Corporate", "Fashion", "Events"];
  const CATEGORIES = [
    { name: "Weddings",  color: "#C2185B", bg: "#FCE4EC" },
    { name: "Portraits", color: "#6A1B9A", bg: "#F3E5F5" },
    { name: "Corporate", color: "#1565C0", bg: "#E3F2FD" },
    { name: "Fashion",   color: "#AD1457", bg: "#FCE4EC" },
    { name: "Events",    color: "#E64A19", bg: "#FBE9E7" },
    { name: "Family",    color: "#2E7D32", bg: "#E8F5E9" },
  ];
  const TESTIMONIALS = [
    { quote: "SnapBook connected me with an absolutely incredible photographer. My wedding photos are better than I ever imagined!", name: "Aisha Rahman", city: "Lahore", rating: 5, rot: "-2.2deg" },
    { quote: "Found a great portrait photographer in minutes. The booking process was so smooth and stress-free.", name: "Carlos Mendez", city: "Karachi", rating: 5, rot: "1.8deg" },
    { quote: "As a corporate event manager, I need reliable photographers fast. SnapBook never lets me down.", name: "Priya Sharma", city: "Islamabad", rating: 5, rot: "-1.5deg" },
  ];

  return (
    <>
      <Helmet>
        <title>SnapBook — Find Your Perfect Photographer</title>
      </Helmet>
      <Navbar current="home" />

      {/* ━━━━━━━━━━━ HERO ━━━━━━━━━━━ */}
      <section className="sk-hero">
        {/* Floating photoshoot imagery — Polaroid-style */}
        <div className="sk-hero-gallery" aria-hidden="true">
          <img className="sk-hg-img sk-hg-img--1" src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=320&q=75" alt="" onError={e => { e.target.style.display='none'; }}/>
          <img className="sk-hg-img sk-hg-img--2" src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=320&q=75" alt="" onError={e => { e.target.style.display='none'; }}/>
          <img className="sk-hg-img sk-hg-img--3" src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=320&q=75" alt="" onError={e => { e.target.style.display='none'; }}/>
          <img className="sk-hg-img sk-hg-img--4" src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=320&q=75" alt="" onError={e => { e.target.style.display='none'; }}/>
        </div>
        <div className="sk-hero-inner">
          <div className="sk-hero-badge">✦ Trusted by 50,000+ customers</div>
          <h1 className="sk-hero-title">
            Find Your Perfect{" "}
            <span className="sk-hero-accent">
              Photographer
              <svg className="sk-hero-circle" viewBox="0 0 300 72" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18,46 C28,8 78,2 150,6 C222,10 280,20 284,42 C288,64 228,68 150,66 C72,64 8,58 18,46 Z" stroke="#D84315" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </h1>
          <p className="sk-hero-sub">Book verified professionals for weddings, portraits, corporate events &amp; more</p>

          {/* Sketchy search bar */}
          <div className="sk-search-bar">
            <div className="sk-search-field">
              <svg className="sk-search-icon" viewBox="0 0 24 24" fill="none">
                <circle cx="10.5" cy="10.5" r="6" stroke="#3E2723" strokeWidth="2" strokeLinecap="round"/>
                <path d="M15.5 15.5 L21 21" stroke="#3E2723" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
              <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="sk-select">
                <option value="">All Cities</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sk-search-divider" />
            <div className="sk-search-field">
              <svg className="sk-search-icon" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="17" rx="2" stroke="#3E2723" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16 2v4M8 2v4M3 10h18" stroke="#3E2723" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <select value={selectedEventType} onChange={e => setSelectedEventType(e.target.value)} className="sk-select">
                <option value="">All Event Types</option>
                {eventTypes.map(et => <option key={et} value={et}>{et}</option>)}
              </select>
            </div>
            <button onClick={handleSearch} className="sk-search-btn">
              Search
              <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16, marginLeft: 8, flexShrink: 0 }}>
                <path d="M4 10h12M12 6l4 4-4 4" stroke="#FDFBF7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Stats bar */}
          <div className="sk-stats-bar">
            <span className="sk-stat">500+ Photographers</span>
            <span className="sk-stat-dot">✦</span>
            <span className="sk-stat">50,000+ Photos</span>
            <span className="sk-stat-dot">✦</span>
            <span className="sk-stat">4.9 / 5 Rating</span>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━ HOW IT WORKS ━━━━━━━━━━━ */}
      <section className="sk-section sk-how">
        <h2 className="sk-section-title">How SnapBook Works</h2>
        <div className="sk-steps">

          {/* Step 1 */}
          <div className="sk-step">
            <div className="sk-step-icon">
              <svg viewBox="0 0 64 64" fill="none">
                <circle cx="26" cy="26" r="16" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M37 37 L54 54" stroke="#3E2723" strokeWidth="3" strokeLinecap="round"/>
                <path d="M20 26 C20 22 24 18 28 18" stroke="#3E2723" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="26" cy="26" r="6" stroke="#D84315" strokeWidth="1.5" strokeDasharray="3 2"/>
              </svg>
            </div>
            <div className="sk-step-num">01</div>
            <h3>Search</h3>
            <p>Browse verified photographers by city, style &amp; budget</p>
          </div>

          {/* Doodle arrow */}
          <div className="sk-arrow">
            <svg viewBox="0 0 80 40" fill="none">
              <path d="M5,20 C20,8 45,8 60,20 C67,25 71,28 73,30" stroke="#D84315" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3"/>
              <path d="M67 24 L73 30 L65 32" stroke="#D84315" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>

          {/* Step 2 */}
          <div className="sk-step">
            <div className="sk-step-icon">
              <svg viewBox="0 0 64 64" fill="none">
                <rect x="8" y="12" width="48" height="44" rx="3" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M8 24 L56 24" stroke="#3E2723" strokeWidth="2" strokeLinecap="round"/>
                <path d="M22 8 L22 18 M42 8 L42 18" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="22" cy="36" r="3" fill="#D84315"/>
                <circle cx="32" cy="36" r="3" fill="#D84315"/>
                <circle cx="42" cy="36" r="3" stroke="#3E2723" strokeWidth="2"/>
                <path d="M22 46 L36 46" stroke="#3E2723" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="sk-step-num">02</div>
            <h3>Book</h3>
            <p>Pick your date, confirm details, and pay securely</p>
          </div>

          {/* Doodle arrow (flipped wave) */}
          <div className="sk-arrow">
            <svg viewBox="0 0 80 40" fill="none">
              <path d="M5,20 C20,32 45,32 60,20 C67,15 71,12 73,10" stroke="#D84315" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3"/>
              <path d="M67 16 L73 10 L65 8" stroke="#D84315" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>

          {/* Step 3 */}
          <div className="sk-step">
            <div className="sk-step-icon">
              <svg viewBox="0 0 64 64" fill="none">
                <path d="M6 22 L6 52 C6 54 8 56 10 56 L54 56 C56 56 58 54 58 52 L58 22 C58 20 56 18 54 18 L10 18 C8 18 6 20 6 22 Z" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="32" cy="38" r="11" stroke="#3E2723" strokeWidth="2.5"/>
                <circle cx="32" cy="38" r="5" stroke="#D84315" strokeWidth="1.8"/>
                <path d="M24 18 L27 10 L37 10 L40 18" stroke="#3E2723" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="50" cy="24" r="2.5" fill="#D84315"/>
              </svg>
            </div>
            <div className="sk-step-num">03</div>
            <h3>Capture</h3>
            <p>Meet your photographer and create stunning memories</p>
          </div>

        </div>
      </section>

      {/* ━━━━━━━━━━━ FEATURED PHOTOGRAPHERS ━━━━━━━━━━━ */}
      <section className="sk-section sk-featured" ref={featuredRef}>
        <div className="sk-section-header">
          <h2 className="sk-section-title">{hasSearched ? "Search Results" : "Featured Photographers"}</h2>
          {!hasSearched && <a href="#" className="sk-view-all">View All →</a>}
        </div>
        {hasSearched && (selectedCity || selectedEventType) && (
          <p style={{margin:"-8px 0 16px",fontSize:14,color:"#795548",fontFamily:"'Caveat',cursive",fontSize:16}}>
            {[selectedCity && `City: ${selectedCity}`, selectedEventType && `Event: ${selectedEventType}`].filter(Boolean).join(" · ")}
            {" — "}{photographers.length} photographer{photographers.length !== 1 ? "s" : ""} found
          </p>
        )}

        {/* Filter pills — hidden when showing search results */}
        {!hasSearched && (
        <div className="sk-filter-pills">
          {FILTER_PILLS.map(f => (
            <button
              key={f}
              className={"sk-pill" + (activeFilter === f ? " active" : "")}
              onClick={() => handleFilterChange(f)}
            >
              {f}
            </button>
          ))}
        </div>
        )}

        {/* Grid */}
        {loadingPhotographers ? (
          <div className="sk-loading">
            <div className="sk-loading-dot" />
            <div className="sk-loading-dot" />
            <div className="sk-loading-dot" />
          </div>
        ) : photographers.length === 0 ? (
          <p className="sk-empty">No photographers found for this category yet.</p>
        ) : (
          <div className="sk-photographer-grid">
            {photographers.slice(0, 6).map((p, i) => (
              <article
                key={p._id}
                className="sk-photo-card"
                style={{ transform: `rotate(${ROTATIONS[i % ROTATIONS.length]})` }}
              >
                <div className="sk-card-cover">
                  {p.profileImage
                    ? <img
                        src={p.profileImage}
                        alt={p.name}
                        onError={e => {
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = '<div class="sk-card-cover-placeholder"><svg viewBox="0 0 80 80" fill="none"><circle cx="40" cy="30" r="14" stroke="#3E2723" stroke-width="2" stroke-dasharray="4 2"/><path d="M14 70 C16 52 26 44 40 44 C54 44 64 52 66 70" stroke="#3E2723" stroke-width="2" stroke-linecap="round"/></svg></div>';
                        }}
                      />
                    : (
                      <div className="sk-card-cover-placeholder">
                        <svg viewBox="0 0 80 80" fill="none">
                          <circle cx="40" cy="30" r="14" stroke="#3E2723" strokeWidth="2" strokeDasharray="4 2"/>
                          <path d="M14 70 C16 52 26 44 40 44 C54 44 64 52 66 70" stroke="#3E2723" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                    )}
                </div>
                <div className="sk-card-body">
                  <div className="sk-card-name">{p.name}</div>
                  <div className="sk-card-meta">
                    {p.city && <span className="sk-city-badge">{p.city}</span>}
                    {p.specialization && <span className="sk-spec-tag">{p.specialization}</span>}
                  </div>
                  <div className="sk-card-rating">
                    <span className="sk-stars">{renderStars(p.rating)}</span>
                    <span className="sk-review-count">({p.totalReviews || 0})</span>
                  </div>
                  <div className="sk-card-footer">
                    <span className="sk-price">PKR {(p.pricePerHour || 0).toLocaleString()}/hr</span>
                    <a href={"/photographer/" + (p.slug || p._id)} className="sk-book-btn">Book</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ━━━━━━━━━━━ TRENDING CATEGORIES ━━━━━━━━━━━ */}
      <section className="sk-section sk-categories">
        <h2 className="sk-section-title">Browse by Category</h2>
        <div className="sk-category-scroll">
          {CATEGORIES.map(cat => (
            <div key={cat.name} className="sk-category-card" style={{ "--cat-bg": cat.bg }}>
              <span className="sk-category-icon"><CategoryIcon name={cat.name} color={cat.color} /></span>
              <span className="sk-category-name">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ━━━━━━━━━━━ TESTIMONIALS ━━━━━━━━━━━ */}
      <section className="sk-section sk-testimonials">
        <h2 className="sk-section-title">What Clients Say</h2>
        <div className="sk-testimonial-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="sk-testimonial-card" style={{ transform: `rotate(${t.rot})` }}>
              <div className="sk-testimonial-stars">
                {Array.from({ length: t.rating }, (_, j) => <span key={j} style={{ color: "#D84315", fontSize: "18px" }}>★</span>)}
              </div>
              <p className="sk-testimonial-text">"{t.quote}"</p>
              <div className="sk-testimonial-author">
                <strong>{t.name}</strong>
                <span>{t.city}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}

// ===== LOGIN PAGE =====
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => {
        if (data.user.role === "customer") window.location.href = "/customer-dashboard.html";
        else if (data.user.role === "photographer") window.location.href = "/photographer-dashboard.html";
        else window.location.href = "/admin-dashboard.html";
      }, 1000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <Helmet><title>Login - SnapBook</title></Helmet>
      <Navbar />
      <main className="page auth-page">
        <section className="auth-card">
          <h1>Sign In</h1>
          <p className="subtext">Welcome back to SnapBook</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="form-label">Email<input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
            <label className="form-label">Password<input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
            <button type="submit" className="btn btn-primary btn-full">Sign In</button>
            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}
          </form>
          <p className="auth-switch">Don't have an account? <a href="register.html">Sign Up</a></p>
        </section>
      </main>
      <Footer />
    </>
  );
}

// ===== REGISTER PAGE =====
function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const roleHint = role === "photographer" ? "As a photographer, your account will need admin approval before it's public." : "As a customer, you can immediately start booking photographers.";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim(), password: password.trim(), role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Registration failed"); return; }
      setSuccess(role === "photographer"
        ? "Registered as photographer. Please wait for admin approval."
        : "Registered successfully! You can now login.");
      setTimeout(() => { window.location.href = "/login.html"; }, 1500);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <Helmet><title>Register - SnapBook</title></Helmet>
      <Navbar />
      <main className="page auth-page">
        <section className="auth-card">
          <h1>Create your account</h1>
          <p className="subtext">Sign up as a customer or photographer.</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="form-label">Name<input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required /></label>
            <label className="form-label">Email<input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
            <label className="form-label">Phone (optional)<input type="text" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
            <label className="form-label">Password<input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
            <label className="form-label">
              Role
              <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="customer">Customer</option>
                <option value="photographer">Photographer</option>
              </select>
            </label>
            <p className="subtext">{roleHint}</p>
            <button type="submit" className="btn btn-primary btn-full">Sign Up</button>
            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}
          </form>
          <p className="auth-switch">Already have an account? <a href="login.html">Login</a></p>
        </section>
      </main>
      <Footer />
    </>
  );
}

// ===== CUSTOMER DASHBOARD PAGE =====
function CustomerDashboardPage() {
  const [activeTab, setActiveTab] = useState("browse");
  const [token] = useState(localStorage.getItem("token"));
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState(null);
  const [wishlist, setWishlist] = useState(null);
  const [selectedPhotographer, setSelectedPhotographer] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photographers, setPhotographers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [bookingForm, setBookingForm] = useState({ eventDate: "", eventLocation: "", duration: 4 });
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [maxPriceLimit, setMaxPriceLimit] = useState(500);

  const apiCall = async (endpoint, method = "GET", body = null) => {
    try {
      const options = { method, headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` } };
      if (body) options.body = JSON.stringify(body);
      const res = await fetch(`/api${endpoint}`, options);
      return await res.json();
    } catch (error) {
      return { success: false, message: "Error" };
    }
  };

  const fetchOrders = async () => {
    const data = await apiCall("/orders");
    if (data.success) setOrders(data.orders || []);
  };

  const fetchCart = async () => {
    const data = await apiCall("/cart");
    if (data.success) setCart(data.cart);
  };

  const fetchWishlist = async () => {
    const data = await apiCall("/wishlist");
    if (data.success) setWishlist(data.wishlist);
  };

  const handleRemoveFromCart = async (itemId) => {
    const data = await apiCall(`/cart/remove/${itemId}`, "DELETE");
    if (data.success) setCart(data.cart);
  };

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) { setError("Cart is empty"); return; }
    const data = await apiCall("/orders/create-from-cart", "POST");
    if (data.success) {
      setError(""); fetchOrders(); setCart({ items: [], totalCost: 0 });
      alert("Orders created successfully!"); setActiveTab("orders");
    } else setError(data.message || "Failed to create orders");
  };

  const handleRemoveFromWishlist = async (photographerId) => {
    const data = await apiCall(`/wishlist/remove/${photographerId}`, "DELETE");
    if (data.success) setWishlist(data.wishlist);
  };

  const handleBookNow = async () => {
    if (!selectedPhotographer) return;
    
    if (!bookingForm.eventDate || !bookingForm.eventLocation) {
      setError("Please fill in event date and location");
      return;
    }

    if (!selectedPhotographer.userId) {
      setError("Photographer ID not available. Please select a different photographer.");
      console.error("Missing userId in selectedPhotographer:", selectedPhotographer);
      return;
    }

    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ 
          photographerId: selectedPhotographer.userId,
          eventDate: bookingForm.eventDate,
          eventType: selectedPhotographer.specialization,
          location: bookingForm.eventLocation,
          duration: bookingForm.duration,
          pricePerHour: selectedPhotographer.pricePerHour
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Added to cart successfully!");
        setSelectedPhotographer(null);
        setBookingForm({ eventDate: "", eventLocation: "", duration: 4 });
        setError("");
        fetchCart();
      } else {
        setError(data.message || "Failed to add to cart");
      }
    } catch (err) {
      setError("Failed to add to cart. Please try again.");
    }
  };

  const handleAddToWishlist = async () => {
    if (!selectedPhotographer) return;
    
    if (!selectedPhotographer.userId) {
      setError("Photographer ID not available. Please select a different photographer.");
      console.error("Missing userId in selectedPhotographer:", selectedPhotographer);
      return;
    }

    try {
      const res = await fetch("/api/wishlist/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ photographerId: selectedPhotographer.userId }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Added to wishlist!");
        setError("");
        fetchWishlist();
      } else {
        setError(data.message || "Failed to add to wishlist");
      }
    } catch (err) {
      setError("Failed to add to wishlist. Please try again.");
    }
  };

  useEffect(() => {
    if (!token) { window.location.href = "/login.html"; return; }
    fetchOrders(); fetchCart(); fetchWishlist();
    
    fetch("/api/photographers")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.photographers) {
          console.log("📸 [DASHBOARD] Loaded photographers:", data.photographers.length);
          console.log("📊 [DASHBOARD] Photographer prices:", data.photographers.map(p => ({ name: p.name, price: p.pricePerHour })));
          setPhotographers(data.photographers);
          // Calculate max price from photographers
          const maxPrice = Math.max(...data.photographers.map(p => p.pricePerHour || 0), 500);
          console.log("💰 [DASHBOARD] Max price calculated:", maxPrice);
          setMaxPriceLimit(maxPrice);
          setMaxPrice(maxPrice);
          const cats = {};
          data.photographers.forEach(p => { 
            if (p.specialization) {
              cats[p.specialization] = (cats[p.specialization] || 0) + 1;
            }
          });
          setCategories(Object.entries(cats).map(([name, count]) => ({ name, count })));
        }
      });
      
    fetch("/api/orders/reviews")
      .then(res => res.json())
      .then(data => { if (data.reviews) setReviews(data.reviews); });
  }, [token]);

  return (
    <>
      <Helmet><title>My Dashboard - SnapBook</title></Helmet>
      <Navbar current="home" />
      <main className="page dashboard-page">

        <section className="featured-photographers">
          <h2>Find Your Perfect Photographer</h2>
          <div className="photographer-grid">
            {photographers.length === 0 ? <p>No photographers found.</p> : photographers.filter(p => {
              const price = p.pricePerHour || 0;
              return price >= minPrice && price <= maxPrice;
            }).slice(0, 6).map((p) => (
              <div 
                className="photographer-card" 
                key={p._id}
                onClick={() => setSelectedPhotographer(p)}
                style={{ cursor: "pointer", transition: "transform 0.3s" }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                <img src={p.profileImage || "https://via.placeholder.com/200x250"} alt={p.name} className="photographer-image" />
                <div className="photographer-info">
                  <h3>{p.name}</h3>
                  <p className="specialty">{p.specialization || "Photographer"}</p>
                  <div className="rating">
                    <span className="stars">{'★'.repeat(Math.floor(p.rating || 0))} {p.rating || 0}</span>
                    <span className="reviews">({p.totalReviews || 0} reviews)</span>
                  </div>
                  <div className="details">
                    <span className="price">Rs. {p.pricePerHour}/hr</span>
                    <span className="city">{p.city}</span>
                  </div>
                  <button className="view-details-btn">View Details →</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {selectedPhotographer && (
          <div className="modal-overlay" onClick={() => setSelectedPhotographer(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedPhotographer(null)}>✕</button>
              
              {error && <div style={{ padding: "16px", background: "#fee2e2", color: "#b91c1c", borderRadius: "6px", marginBottom: "16px", margin: "16px", textAlign: "center", fontWeight: "500", fontSize: "0.95rem" }}>{error}</div>}
              <div className="modal-photographer">
                <img src={selectedPhotographer.profileImage || "https://via.placeholder.com/300"} alt={selectedPhotographer.name} className="modal-image" />
                
                <div className="modal-details">
                  <h2>{selectedPhotographer.name}</h2>
                  <p className="specialty-large">{selectedPhotographer.specialization}</p>
                  
                  <div className="rating-large">
                    <span className="stars-large">{'★'.repeat(Math.floor(selectedPhotographer.rating || 0))}</span>
                    <span className="rating-text">{selectedPhotographer.rating || 0} ({selectedPhotographer.totalReviews || 0} reviews)</span>
                  </div>

                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Experience</strong>
                      <p>{selectedPhotographer.experience || 0}+ Years</p>
                    </div>
                    <div className="info-item">
                      <strong>Rate</strong>
                      <p>Rs. {selectedPhotographer.pricePerHour}/hr</p>
                    </div>
                    <div className="info-item">
                      <strong>Location</strong>
                      <p>{selectedPhotographer.city}</p>
                    </div>
                    <div className="info-item">
                      <strong>Event Types</strong>
                      <p>{(selectedPhotographer.eventTypes || []).join(", ") || "Various"}</p>
                    </div>
                  </div>

                  <div className="bio-section">
                    <h3>About</h3>
                    <p>{selectedPhotographer.bio || "No bio available"}</p>
                  </div>

                  <div className="highlights-section">
                    <h3>Service Highlights</h3>
                    <ul className="highlights-list">
                      {(selectedPhotographer.serviceHighlights ||[]).map((highlight, idx) => (
                        <li key={idx}>✓ {highlight}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="booking-form-section" style={{ marginTop: "24px", padding: "20px", background: "var(--surface-soft)", borderRadius: "var(--radius-md)" }}>
                    <h3 style={{ marginBottom: "12px" }}>Book Photographer</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem", fontWeight: "500" }}>Event Date</label>
                        <input 
                          type="date" 
                          value={bookingForm.eventDate} 
                          onChange={(e) => setBookingForm({...bookingForm, eventDate: e.target.value})}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "0.9rem" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem", fontWeight: "500" }}>Event Location</label>
                        <input 
                          type="text" 
                          placeholder="Enter event location"
                          value={bookingForm.eventLocation} 
                          onChange={(e) => setBookingForm({...bookingForm, eventLocation: e.target.value})}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "0.9rem" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "4px", fontSize: "0.9rem", fontWeight: "500" }}>Duration (hours)</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="12"
                          value={bookingForm.duration} 
                          onChange={(e) => setBookingForm({...bookingForm, duration: parseInt(e.target.value)})}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "0.9rem" }}
                        />
                      </div>
                      <div style={{ fontSize: "0.95rem", color: "var(--primary)", fontWeight: "600", marginTop: "8px" }}>
                        Total: Rs. {selectedPhotographer.pricePerHour * bookingForm.duration}/-
                      </div>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button className="btn btn-primary btn-large" onClick={handleBookNow}>Add to Cart</button>
                    <button className="btn btn-secondary btn-large" onClick={handleAddToWishlist}>Add to Wishlist</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <section className="browse-category">
          <h2>Browse by Category</h2>
          
          {/* Price Filter Section */}
          <div style={{ marginBottom: "24px", padding: "20px", background: "var(--surface-soft)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "600" }}>Filter by Price Range</h3>
              <button 
                onClick={() => { setMinPrice(0); setMaxPrice(maxPriceLimit); }} 
                style={{ 
                  padding: "6px 12px", 
                  fontSize: "0.85rem", 
                  background: "var(--border-subtle)", 
                  border: "none", 
                  borderRadius: "4px", 
                  cursor: "pointer",
                  fontWeight: "500"
                }}
              >
                Reset
              </button>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              {/* Min Price Input */}
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: "500" }}>
                  Min Price (Rs. {minPrice})
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max={maxPriceLimit}
                  value={minPrice}
                  onChange={(e) => setMinPrice(parseInt(e.target.value))}
                  style={{ width: "100%", cursor: "pointer" }}
                />
                <input 
                  type="number" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  style={{ width: "100%", marginTop: "8px", padding: "8px", borderRadius: "4px", border: "1px solid var(--border-subtle)", fontSize: "0.9rem" }}
                  placeholder="Min price"
                />
              </div>

              {/* Max Price Input */}
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", fontWeight: "500" }}>
                  Max Price (Rs. {maxPrice})
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max={maxPriceLimit}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  style={{ width: "100%", cursor: "pointer" }}
                />
                <input 
                  type="number" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Math.min(maxPriceLimit, parseInt(e.target.value) || maxPriceLimit))}
                  style={{ width: "100%", marginTop: "8px", padding: "8px", borderRadius: "4px", border: "1px solid var(--border-subtle)", fontSize: "0.9rem" }}
                  placeholder="Max price"
                />
              </div>

              {/* Results Count */}
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <div style={{ padding: "12px 16px", background: "var(--primary)", color: "white", borderRadius: "4px", fontWeight: "500", fontSize: "0.95rem" }}>
                  {photographers.filter(p => {
                    const price = p.pricePerHour || 0;
                    return price >= minPrice && price <= maxPrice;
                  }).length} photographers found
                </div>
              </div>
            </div>
          </div>

          {selectedCategory && (
            <button 
              className="btn btn-secondary" 
              onClick={() => setSelectedCategory(null)}
              style={{ marginBottom: "16px" }}
            >
              ← Back to All Photographers
            </button>
          )}
          {!selectedCategory ? (
            <div className="category-grid">
              {categories.length === 0 ? <p>No categories found.</p> : categories.map((cat) => (
                <div 
                  className="category-card" 
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  style={{ cursor: "pointer", transition: "all 0.3s" }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 8px 24px rgba(124, 58, 237, 0.15)"}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"}
                >
                  <h3>{cat.name}</h3>
                  <p>{cat.count} Photographers</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="photographer-grid">
              {photographers.filter(p => p.specialization === selectedCategory && ((p.pricePerHour || 0) >= minPrice && (p.pricePerHour || 0) <= maxPrice)).length === 0 ? (
                <p>No photographers found in this category within the selected price range.</p>
              ) : (
                photographers
                  .filter(p => p.specialization === selectedCategory && ((p.pricePerHour || 0) >= minPrice && (p.pricePerHour || 0) <= maxPrice))
                  .map((p) => (
                    <div 
                      className="photographer-card" 
                      key={p._id}
                      onClick={() => setSelectedPhotographer(p)}
                      style={{ cursor: "pointer", transition: "transform 0.3s" }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                    >
                      <img src={p.profileImage || "https://via.placeholder.com/200x250"} alt={p.name} className="photographer-image" />
                      <div className="photographer-info">
                        <h3>{p.name}</h3>
                        <p className="specialty">{p.specialization || "Photographer"}</p>
                        <div className="rating">
                          <span className="stars">{'★'.repeat(Math.floor(p.rating || 0))} {p.rating || 0}</span>
                          <span className="reviews">({p.totalReviews || 0} reviews)</span>
                        </div>
                        <div className="details">
                          <span className="price">Rs. {p.pricePerHour}/hr</span>
                          <span className="city">{p.city}</span>
                        </div>
                        <button className="view-details-btn">View Details →</button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </section>

        <section className="client-reviews">
          <h2>What Our Clients Say</h2>
          <div className="reviews-grid">
            {reviews.length === 0 ? <p>No reviews yet.</p> : reviews.slice(0, 6).map((r) => (
              <div className="review-card" key={r._id}>
                <div className="review-stars">{'★'.repeat(r.rating || 5)}</div>
                <p className="review-text">{r.text || r.comment}</p>
                <div className="review-client">
                  <strong>{r.customerName || (r.customer && r.customer.name) || 'Customer'}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-header">
          <h1>My Dashboard</h1>
          <p className="subtext">Manage your bookings, cart, and wishlist</p>
        </section>

        <div className="dashboard-tabs">
          <button onClick={() => setActiveTab("orders")} className={"tab-btn " + (activeTab === "orders" ? "active" : "")}>Orders ({orders.length})</button>
          <button onClick={() => setActiveTab("cart")} className={"tab-btn " + (activeTab === "cart" ? "active" : "")}>Cart ({cart?.items?.length || 0})</button>
          <button onClick={() => setActiveTab("wishlist")} className={"tab-btn " + (activeTab === "wishlist" ? "active" : "")}>Wishlist ({wishlist?.photographers?.length || 0})</button>
        </div>

        {activeTab === "orders" && (
          <section className="bookings-section">
            {orders.length === 0 ? <p style={{ margin: "20px 0" }}>No orders yet.</p> : (
              <div className="bookings-list">
                {orders.map((order) => (
                  <div className="booking-card" key={order._id}>
                    <div className="booking-main">
                      <img src={order.photographer?.profileImage || "https://via.placeholder.com/84"} alt="Photographer" className="booking-photo" />
                      <div className="booking-info">
                        <div className="booking-name">{order.photographer?.name || "Photographer"}</div>
                        <div className="booking-type">{order.eventType}</div>
                        <div className="booking-meta-row">
                          <span>{new Date(order.eventDate).toLocaleDateString()}</span>
                          <span>{order.location}</span>
                          <span>{order.duration}h</span>
                        </div>
                      </div>
                    </div>
                    <div className="booking-side">
                      <div className="booking-price">Rs. {order.totalPrice}</div>
                      <span className={"badge-status badge-status-" + (order.status === "completed" ? "green" : order.status === "confirmed" ? "blue" : "amber")}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "cart" && (
          <section className="bookings-section">
            {!cart || cart.items.length === 0 ? <p style={{ margin: "20px 0" }}>Your cart is empty.</p> : (
              <>
                <div className="bookings-list">
                  {cart.items.map((item) => (
                    <div className="booking-card" key={item._id}>
                      <div className="booking-main">
                        <div className="booking-info">
                          <div className="booking-name">{item.photographerId?.name || "Photographer"}</div>
                          <div className="booking-type">{item.eventType}</div>
                          <div className="booking-meta-row">
                            <span>{new Date(item.eventDate).toLocaleDateString()}</span>
                            <span>{item.duration}h</span>
                          </div>
                        </div>
                      </div>
                      <div className="booking-side">
                        <div className="booking-price">Rs. {item.totalPrice}</div>
                        <button className="booking-btn cancel" onClick={() => handleRemoveFromCart(item._id)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "20px", textAlign: "right" }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "12px" }}>Total: Rs. {cart.totalCost}</div>
                  <button className="btn btn-primary" onClick={handleCheckout}>Proceed to Checkout</button>
                </div>
              </>
            )}
          </section>
        )}

        {activeTab === "wishlist" && (
          <section className="bookings-section">
            {!wishlist || wishlist.photographers.length === 0 ? <p style={{ margin: "20px 0" }}>Your wishlist is empty.</p> : (
              <div className="photographer-grid">
                {wishlist.photographers.map((p) => (
                  <div className="photographer-card" key={p._id} style={{ position: "relative" }}>
                    <img src={p.profileImage || "https://via.placeholder.com/200x250"} alt={p.name} className="photographer-image" />
                    <button className="booking-btn" style={{ position: "absolute", top: "8px", right: "8px", background: "#fee2e2", color: "#b91c1c" }} onClick={() => handleRemoveFromWishlist(p._id)}>Remove</button>
                    <div className="photographer-info">
                      <h3>{p.name}</h3>
                      <p className="specialty">{p.specialization}</p>
                      <div className="rating">
                        <span className="stars">{'⭐'.repeat(Math.floor(p.rating || 0))}</span>
                      </div>
                      <div className="details">
                        <span className="price">Rs. {p.pricePerHour}/hr</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

// ===== PHOTOGRAPHER DASHBOARD PAGE =====
function PhotographerDashboardPage() {
  return (
    <>
      <Helmet><title>Photographer Dashboard - SnapBook</title></Helmet>
      <Navbar current="photographer" />
      <main className="page dashboard-page">
        <section className="dashboard-header">
          <h1>Photographer Dashboard</h1>
          <p className="subtext">Manage your bookings and portfolio</p>
        </section>
      </main>
      <Footer />
    </>
  );
}

// (AdminDashboardPage implemented later with full admin UI)

// ===== APP ROUTER =====
const rootElement = document.getElementById("root");

function App() {
  const path = window.location.pathname.replace(/\.html$/, "");
  if (path === "/login") return <LoginPage />;
  if (path === "/register") return <RegisterPage />;
  if (path === "/customer-dashboard") return <CustomerDashboardPage />;
  if (path === "/photographer-dashboard") return <PhotographerDashboardPage />;
  if (path === "/admin-dashboard" || path === "/admin") return <AdminDashboardPage />;
  return <LandingPage />;
}

if (rootElement) {
  if (ReactDOM.createRoot) {
    ReactDOM.createRoot(rootElement).render(<App />);
  } else {
    ReactDOM.render(<App />, rootElement);
  }
}
// Replace the AdminDashboardPage function with this:

// ===== ADMIN DASHBOARD PAGE =====
function AdminDashboardPage() {
  const [token] = useState(localStorage.getItem("token"));
  const [activeTab, setActiveTab] = useState("pending");
  const [photographers, setPhotographers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedPhotographer, setSelectedPhotographer] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [formData, setFormData] = useState({ seoTitle: "", seoDescription: "" });

  useEffect(() => {
    if (!token) {
      window.location.href = "/login.html";
      return;
    }
    fetchPhotographers();
  }, [token]);

  // Fetch all photographers with their status
  const fetchPhotographers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/photographers", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.photographers) {
        setPhotographers(data.photographers);
        console.log("✅ Loaded photographers:", data.photographers.length);
      }
    } catch (err) {
      setError("Failed to load photographers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Approve photographer
  const handleApprove = async (photographerId) => {
    try {
      const res = await fetch(`/api/admin/photographers/${photographerId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("✅ Photographer approved!");
        setTimeout(() => setSuccess(""), 3000);
        fetchPhotographers();
      } else {
        setError(data.message || "Failed to approve photographer");
      }
    } catch (err) {
      setError("Error approving photographer");
      console.error(err);
    }
  };

  // Reject photographer
  const handleReject = async (photographerId) => {
    if (!window.confirm("Are you sure you want to reject this photographer?")) return;
    
    try {
      const res = await fetch(`/api/admin/photographers/${photographerId}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("❌ Photographer rejected!");
        setTimeout(() => setSuccess(""), 3000);
        fetchPhotographers();
      } else {
        setError(data.message || "Failed to reject photographer");
      }
    } catch (err) {
      setError("Error rejecting photographer");
      console.error(err);
    }
  };

  // Open SEO edit modal
  const openSeoModal = (photographer) => {
    setSelectedPhotographer(photographer);
    setEditModal("seo");
    setFormData({
      seoTitle: photographer.seoTitle || "",
      seoDescription: photographer.seoDescription || ""
    });
  };

  // Open Portfolio edit modal
  const openPortfolioModal = (photographer) => {
    setSelectedPhotographer(photographer);
    setEditModal("portfolio");
    setFormData({
      portfolio: photographer.portfolio || []
    });
  };

  // Save SEO changes
  const handleSaveSeO = async () => {
    try {
      const res = await fetch(`/api/admin/photographers/${selectedPhotographer._id}/seo`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          seoTitle: formData.seoTitle,
          seoDescription: formData.seoDescription
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("✅ SEO info updated!");
        setTimeout(() => setSuccess(""), 3000);
        setEditModal(null);
        fetchPhotographers();
      } else {
        setError(data.message || "Failed to update SEO");
      }
    } catch (err) {
      setError("Error updating SEO");
      console.error(err);
    }
  };

  // Save Portfolio changes
  const handleSavePortfolio = async () => {
    try {
      const res = await fetch(`/api/admin/photographers/${selectedPhotographer._id}/portfolio`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          portfolio: formData.portfolio
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("✅ Portfolio updated!");
        setTimeout(() => setSuccess(""), 3000);
        setEditModal(null);
        fetchPhotographers();
      } else {
        setError(data.message || "Failed to update portfolio");
      }
    } catch (err) {
      setError("Error updating portfolio");
      console.error(err);
    }
  };

  // Filter photographers by status
  const filteredPhotographers = photographers.filter(p => {
    if (activeTab === "pending") return p.status === "pending";
    if (activeTab === "approved") return p.status === "approved";
    if (activeTab === "rejected") return p.status === "rejected";
    return true;
  });

  return (
    <>
      <Helmet><title>Admin Dashboard - SnapBook</title></Helmet>
      <Navbar current="admin" />
      <main className="page dashboard-page">
        
        {/* Header */}
        <section className="admin-dashboard-header">
          <h1>Admin Dashboard</h1>
          <button className="btn btn-primary" onClick={fetchPhotographers}>Refresh</button>
        </section>

        {/* Messages */}
        {success && <div style={{ padding: "16px", background: "#dcfce7", color: "#166534", borderRadius: "8px", marginBottom: "16px", fontSize: "0.95rem", fontWeight: "500" }}>{success}</div>}
        {error && <div style={{ padding: "16px", background: "#fee2e2", color: "#991b1b", borderRadius: "8px", marginBottom: "16px", fontSize: "0.95rem", fontWeight: "500" }}>{error}</div>}

        {/* Quick Stats */}
        <div className="admin-quick-stats">
          <div className="admin-stat-card">
            <span className="admin-stat-label">Pending Requests</span>
            <span className="admin-stat-value">{photographers.filter(p => p.status === "pending").length}</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Approved</span>
            <span className="admin-stat-value">{photographers.filter(p => p.status === "approved").length}</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Rejected</span>
            <span className="admin-stat-value">{photographers.filter(p => p.status === "rejected").length}</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Total Photographers</span>
            <span className="admin-stat-value">{photographers.length}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs-container">
          <button className={"admin-tab-btn " + (activeTab === "pending" ? "active" : "")} onClick={() => setActiveTab("pending")}>
            Pending ({photographers.filter(p => p.status === "pending").length})
          </button>
          <button className={"admin-tab-btn " + (activeTab === "approved" ? "active" : "")} onClick={() => setActiveTab("approved")}>
            Approved ({photographers.filter(p => p.status === "approved").length})
          </button>
          <button className={"admin-tab-btn " + (activeTab === "rejected" ? "active" : "")} onClick={() => setActiveTab("rejected")}>
            Rejected ({photographers.filter(p => p.status === "rejected").length})
          </button>
        </div>

        {/* Loading State */}
        {loading && <div className="admin-loading">Loading photographers...</div>}

        {/* Photographers List */}
        {!loading && filteredPhotographers.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
            No photographers in this category.
          </div>
        )}

        {!loading && filteredPhotographers.map((photographer) => (
          <div className="admin-card" key={photographer._id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
              
              {/* Photographer Info */}
              <div style={{ flex: 1, minWidth: "250px" }}>
                <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <img 
                    src={photographer.profileImage || "https://via.placeholder.com/60"} 
                    alt={photographer.name}
                    style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }}
                  />
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600" }}>{photographer.name}</h3>
                    <p style={{ margin: "4px 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>{photographer.email}</p>
                    <p style={{ margin: "4px 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>{photographer.phone || "N/A"}</p>
                    <p style={{ margin: "4px 0", color: "var(--primary)", fontSize: "0.9rem", fontWeight: "500" }}>
                      {photographer.specialization || "General Photographer"}
                    </p>
                    <div style={{ marginTop: "8px" }}>
                      <span className="status-badge" style={{ background: photographer.status === "pending" ? "#fef3c7" : photographer.status === "approved" ? "#dcfce7" : "#fee2e2", color: photographer.status === "pending" ? "#92400e" : photographer.status === "approved" ? "#166534" : "#991b1b" }}>
                        {photographer.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {photographer.description && (
                  <div style={{ marginTop: "12px", padding: "12px", background: "var(--surface-soft)", borderRadius: "6px", fontSize: "0.9rem" }}>
                    <strong>Description:</strong> {photographer.description}
                  </div>
                )}

                {/* SEO Info */}
                <div style={{ marginTop: "12px", padding: "12px", background: "var(--surface-soft)", borderRadius: "6px", fontSize: "0.85rem" }}>
                  <p style={{ margin: "0 0 4px 0" }}><strong>SEO Title:</strong> {photographer.seoTitle || "Not set"}</p>
                  <p style={{ margin: "0" }}><strong>SEO Description:</strong> {photographer.seoDescription || "Not set"}</p>
                </div>

                {/* Portfolio Count */}
                <div style={{ marginTop: "8px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                  📷 Portfolio: {photographer.portfolio?.length || 0} items
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "150px" }}>
                {photographer.status === "pending" && (
                  <>
                    <button 
                      className="admin-action-btn" 
                      style={{ background: "#dcfce7", color: "#166534", width: "100%" }}
                      onClick={() => handleApprove(photographer._id)}
                    >
                      ✅ Approve
                    </button>
                    <button 
                      className="admin-action-btn" 
                      style={{ background: "#fee2e2", color: "#991b1b", width: "100%" }}
                      onClick={() => handleReject(photographer._id)}
                    >
                      ❌ Reject
                    </button>
                  </>
                )}

                <button 
                  className="admin-action-btn" 
                  style={{ background: "#dbeafe", color: "#1e40af", width: "100%" }}
                  onClick={() => openSeoModal(photographer)}
                >
                  ✏️ Edit SEO
                </button>

                <button 
                  className="admin-action-btn" 
                  style={{ background: "var(--primary-soft)", color: "var(--primary)", width: "100%" }}
                  onClick={() => openPortfolioModal(photographer)}
                >
                  📷 Edit Portfolio
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* SEO Edit Modal */}
        {editModal === "seo" && selectedPhotographer && (
          <div className="admin-modal-overlay" onClick={() => setEditModal(null)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2 className="admin-modal-title">✏️ Edit SEO - {selectedPhotographer.name}</h2>
                <button className="admin-modal-close" onClick={() => setEditModal(null)}>✕</button>
              </div>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">SEO Title</label>
                  <input 
                    type="text"
                    className="admin-form-input"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({...formData, seoTitle: e.target.value})}
                    placeholder="E.g., Professional Wedding Photographer in Karachi"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">SEO Description</label>
                  <textarea 
                    className="admin-form-textarea"
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({...formData, seoDescription: e.target.value})}
                    placeholder="E.g., Book professional photography services for weddings, events, and portaits..."
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button className="btn btn-ghost" onClick={() => setEditModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSaveSeO}>Save Changes</button>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Edit Modal */}
        {editModal === "portfolio" && selectedPhotographer && (
          <div className="admin-modal-overlay" onClick={() => setEditModal(null)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2 className="admin-modal-title">📷 Edit Portfolio - {selectedPhotographer.name}</h2>
                <button className="admin-modal-close" onClick={() => setEditModal(null)}>✕</button>
              </div>
              <div className="admin-modal-body">
                <div style={{ padding: "16px", background: "#fef3c7", borderRadius: "6px", marginBottom: "16px", fontSize: "0.9rem" }}>
                  💡 Portfolio management coming soon. You can manage portfolio items through the photographer's profile settings.
                </div>
                <div style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
                  Current Portfolio Items: {selectedPhotographer.portfolio?.length || 0}
                </div>
              </div>
              <div className="admin-modal-footer">
                <button className="btn btn-ghost" onClick={() => setEditModal(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

// ...existing code...