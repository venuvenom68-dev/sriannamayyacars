"use client";
import { useEffect, useMemo, useState } from "react";
import Preloader from "@/components/Preloader";
import CarModal from "@/components/CarModal";
import WaChooser from "@/components/WaChooser";
import { getCars, rupee, PHONE, PHONE_DISPLAY, ADMIN_URL } from "@/lib/api";
import { CAR_BRANDS, FUEL_TYPES } from "@/lib/brands";

const WA_MSG = "Hi Sri Annamayya Cars, I'm interested in your used cars. Please share the available cars and details.";

// Official WhatsApp glyph (bubble + handset)
const waIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M12 2a10 10 0 0 0-8.7 15L2 22l5.2-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.6 0a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2l.1-.4a.5.5 0 0 0 0-.4L9.4 7c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4 5.3 5.3 0 0 0 3.2.6 2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2z" />
  </svg>
);
const phoneIcon = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
);

// Contacts from the shop signboard
const CONTACTS = [
  { name: "Eswar", num: "919441775216", show: "94417 75216" },
  { name: "Malli", num: "919440826161", show: "94408 26161" },
  { name: "Pavan", num: "919398104188", show: "93981 04188" },
];
const OFFICE = { tel: "917893846323", show: "78938 46323" };
const waTo = (num) => `https://wa.me/${num}?text=${encodeURIComponent(WA_MSG)}`;

// Google Maps location of the showroom
const MAP_LINK = "https://maps.app.goo.gl/zWacxZGHHqz75NKr8";
const MAP_EMBED = "https://www.google.com/maps?q=Sri+Annamayya+Cars,+NH+42,+Basinikonda+Rural,+Andhra+Pradesh+517326&output=embed";

// Budget / KM ranges for the filter bar (value = "min-max")
const BUDGETS = [
  ["", "Any budget"],
  ["0-300000", "Under ₹3 Lakh"],
  ["300000-500000", "₹3 – 5 Lakh"],
  ["500000-800000", "₹5 – 8 Lakh"],
  ["800000-1200000", "₹8 – 12 Lakh"],
  ["1200000-100000000", "Above ₹12 Lakh"],
];
const KMS = [
  ["", "Any KMs"],
  ["0-30000", "Under 30,000 km"],
  ["30000-60000", "30,000 – 60,000 km"],
  ["60000-100000", "60,000 – 1,00,000 km"],
  ["100000-100000000", "Above 1,00,000 km"],
];

// Popular car brands for the scrolling strip (slug → real logo in /public/brands)
const MARQUEE_BRANDS = [
  { name: "Maruti Suzuki", slug: "suzuki" },
  { name: "Hyundai", slug: "hyundai" },
  { name: "Tata", slug: "tata" },
  { name: "Mahindra", slug: "mahindra" },
  { name: "Toyota", slug: "toyota" },
  { name: "Honda", slug: "honda" },
  { name: "Kia", slug: "kia" },
  { name: "Renault", slug: "renault" },
  { name: "Nissan", slug: "nissan" },
  { name: "Volkswagen", slug: "volkswagen" },
  { name: "Skoda", slug: "skoda" },
  { name: "Ford", slug: "ford" },
  { name: "MG", slug: "mg" },
  { name: "BMW", slug: "bmw" },
  { name: "Mercedes-Benz", slug: "mercedes" },
  { name: "Audi", slug: "audi" },
];
const initials = (name) =>
  name.split(/[\s-]+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

export default function Home() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [fuel, setFuel] = useState("");
  const [year, setYear] = useState("");
  const [budget, setBudget] = useState("");
  const [kmr, setKmr] = useState("");
  const [sort, setSort] = useState("new");
  const [selected, setSelected] = useState(null);
  const [stuck, setStuck] = useState(false);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const [waMsg, setWaMsg] = useState(WA_MSG);
  const [sell, setSell] = useState({ name: "", phone: "", car: "", year: "", km: "", price: "", notes: "" });
  const [sellSent, setSellSent] = useState(false);

  const openWa = (msg = WA_MSG) => { setWaMsg(msg); setWaOpen(true); };
  const setSellField = (k) => (e) => setSell((s) => ({ ...s, [k]: e.target.value }));
  const submitSell = (e) => {
    e.preventDefault();
    const s = sell;
    const msg =
      `Hi Sri Annamayya Cars, I want to SELL my car.\n\n` +
      `Name: ${s.name}\nPhone: ${s.phone}\nCar: ${s.car}${s.year ? ` (${s.year})` : ""}\n` +
      `KMs driven: ${s.km || "-"}\nExpected price: ${s.price ? `₹${s.price}` : "Please suggest"}` +
      `${s.notes ? `\nNotes: ${s.notes}` : ""}\n\nPlease give me a quote.`;
    openWa(msg);
    setSellSent(true);
  };
  const sellAnother = () => {
    setSellSent(false);
    setSell({ name: "", phone: "", car: "", year: "", km: "", price: "", notes: "" });
  };

  useEffect(() => {
    getCars()
      .then(setCars)
      .catch(() => setErr("Could not reach the server. Please make sure the backend is running."))
      .finally(() => setLoading(false));
    const onScroll = () => setStuck(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reveal-on-scroll animation for sections
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: "0px 0px -40px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [loading]);

  const inRange = (v, range) => {
    if (!range) return true;
    const [mn, mx] = range.split("-").map(Number);
    return v >= mn && v <= mx;
  };
  const modelKey = (c) => c.model || c.name;

  const filtered = useMemo(() => {
    let list = cars.filter((c) => {
      const q = search.trim().toLowerCase();
      if (q && !(`${c.name} ${c.brand} ${c.model || ""} ${c.year} ${c.fuel} ${c.colour} ${c.reg}`.toLowerCase().includes(q))) return false;
      if (brand && c.brand !== brand) return false;
      if (model && modelKey(c) !== model) return false;
      if (fuel && c.fuel !== fuel) return false;
      if (year && String(c.year) !== year) return false;
      if (!inRange(c.price, budget)) return false;
      if (!inRange(c.km, kmr)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "low") return a.price - b.price;
      if (sort === "high") return b.price - a.price;
      if (sort === "km") return a.km - b.km;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return list;
  }, [cars, search, brand, model, fuel, year, budget, kmr, sort]);

  // brands shown = every brand we stock (from data) + full master list, de-duped
  const brandOptions = useMemo(() => {
    const inStock = [...new Set(cars.map((c) => c.brand))];
    return [...new Set([...inStock, ...CAR_BRANDS])].filter(Boolean);
  }, [cars]);
  const modelOptions = useMemo(
    () => [...new Set(cars.map(modelKey))].filter(Boolean).sort(),
    [cars]
  );
  const yearOptions = useMemo(
    () => [...new Set(cars.map((c) => c.year))].filter(Boolean).sort((a, b) => b - a),
    [cars]
  );

  const resetFilters = () => {
    setSearch(""); setBrand(""); setModel(""); setFuel("");
    setYear(""); setBudget(""); setKmr(""); setSort("new");
  };

  return (
    <>
      <Preloader onDone={() => setReady(true)} />

      <div className={`page-enter ${ready ? "in" : ""}`}>
      {/* Header */}
      <header className={`hd ${stuck ? "stuck" : ""}`}>
        <div className="wrap">
          <a href="#top" className="brand" aria-label="Sri Annamayya Cars">
            <img src="/logo.png" alt="Sri Annamayya Cars" />
          </a>
          <nav className="nav">
            <a href="#inventory">Cars</a>
            <a href="#sell">Sell Car</a>
            <a href="#why">Why Us</a>
            <a href="#showroom">Showroom</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="hd-cta">
            <a className="btn btn-line" href={`tel:+${PHONE}`}>Call <span>{PHONE_DISPLAY}</span></a>
            <button className="btn btn-wa" onClick={() => openWa()}>{waIcon}<span>WhatsApp</span></button>
          </div>
          <button className={`burger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`drawer-scrim ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)} />
      <aside className={`drawer ${menuOpen ? "open" : ""}`}>
        <div className="d-head">
          <img src="/logo.png" alt="Sri Annamayya Cars" />
          <button className="dx" onClick={() => setMenuOpen(false)} aria-label="Close menu">✕</button>
        </div>
        <a className="d-link" href="#inventory" onClick={() => setMenuOpen(false)}>Cars</a>
        <a className="d-link" href="#sell" onClick={() => setMenuOpen(false)}>Sell Car</a>
        <a className="d-link" href="#why" onClick={() => setMenuOpen(false)}>Why Us</a>
        <a className="d-link" href="#showroom" onClick={() => setMenuOpen(false)}>Showroom</a>
        <a className="d-link" href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        <div className="d-cta">
          <a className="btn btn-line btn-block" href={`tel:+${PHONE}`}>Call {PHONE_DISPLAY}</a>
          <button className="btn btn-wa btn-block" onClick={() => { setMenuOpen(false); openWa(); }}>{waIcon} WhatsApp Us</button>
        </div>
      </aside>

      {/* Hero */}
      <section className="hero" id="top">
        <div className="hero-bg"><img src="/hero.jpg" alt="" aria-hidden="true" /></div>
        <div className="wrap">
          <div className="eyebrow">Madanapalle · Annamayya District · A.P.</div>
          <h1>Quality pre-owned <em>cars</em>,<br />honestly priced.</h1>
          <p>All types of cars, bought and sold. Every vehicle verified, papers clear, ready to drive home. Park &amp; sale facility available.</p>
          <div className="hero-cta">
            <a className="btn btn-brass" href="#inventory">Browse Cars</a>
            <button className="btn btn-wa" onClick={() => openWa()}>{waIcon} Enquire on WhatsApp</button>
          </div>
          <div className="stats">
            <div className="stat"><b>{cars.length || "—"}</b><span>Cars in stock</span></div>
            <div className="stat"><b>All</b><span>Brands accepted</span></div>
            <div className="stat"><b>100%</b><span>Verified papers</span></div>
          </div>
        </div>
      </section>

      {/* Inventory */}
      <section className="section" id="inventory">
        <div className="wrap">
          <div className="eyebrow">Available Cars</div>
          <h2 className="serif" style={{ fontSize: 40, marginBottom: 26 }}>Find your next car</h2>

          <div className="filters">
            <div className="field span2">
              <label>Search</label>
              <input className="input" placeholder="Model, brand, colour, reg no…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="field">
              <label>Brand</label>
              <select className="select" value={brand} onChange={(e) => setBrand(e.target.value)}>
                <option value="">All brands</option>
                {brandOptions.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Model</label>
              <select className="select" value={model} onChange={(e) => setModel(e.target.value)}>
                <option value="">All models</option>
                {modelOptions.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Fuel</label>
              <select className="select" value={fuel} onChange={(e) => setFuel(e.target.value)}>
                <option value="">Any fuel</option>
                {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Year</label>
              <select className="select" value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">Any year</option>
                {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Budget</label>
              <select className="select" value={budget} onChange={(e) => setBudget(e.target.value)}>
                {BUDGETS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="field">
              <label>KMs driven</label>
              <select className="select" value={kmr} onChange={(e) => setKmr(e.target.value)}>
                {KMS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Sort by</label>
              <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="new">Newest first</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
                <option value="km">KMs: low to high</option>
              </select>
            </div>
          </div>

          <div className="results-head">
            <span className="count">{filtered.length} car{filtered.length !== 1 ? "s" : ""} available</span>
            <button className="btn btn-ghost" onClick={resetFilters}>Reset filters</button>
          </div>

          {/* Brand strip — scrolls left → right */}
          <div className="marquee" aria-hidden="true">
            <div className="marquee-track">
              {[...MARQUEE_BRANDS, ...MARQUEE_BRANDS].map((b, i) => (
                <span className="mq-chip" key={i}>
                  {b.slug ? (
                    <span className="mq-badge"><img src={`/brands/${b.slug}.svg`} alt={b.name} /></span>
                  ) : (
                    <span className="mq-mono">{initials(b.name)}</span>
                  )}
                  {b.name}
                </span>
              ))}
            </div>
          </div>

          <div className="grid">
            {loading && <div className="empty"><h3>Loading cars…</h3></div>}

            {!loading && err && (
              <div className="empty">
                <h3>Can’t load cars right now</h3>
                <p>{err}</p>
              </div>
            )}

            {!loading && !err && filtered.length === 0 && (
              <div className="empty">
                <h3>{cars.length === 0 ? "New stock arriving soon" : "Nothing matches those filters"}</h3>
                <p>{cars.length === 0 ? "We’re updating our listings. Message us and we’ll share what’s available today." : "Try widening your search or clearing the filters."}</p>
                <button className="btn btn-wa" onClick={() => openWa()}>{waIcon} Ask on WhatsApp</button>
              </div>
            )}

            {!loading && !err && filtered.map((c) => (
              <article key={c._id} className="card" onClick={() => setSelected(c)}>
                <div className="shot">
                  {c.badge && <span className={`badge ${c.badge === "FEATURED" ? "b-feat" : "b-good"}`}>{c.badge}</span>}
                  {c.images?.length > 1 && (
                    <span className="img-count">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 15l5-5 4 4 3-3 6 6" /></svg>
                      {c.images.length}
                    </span>
                  )}
                  {c.reg && <span className="reg">{c.reg}</span>}
                  {c.status === "sold" && <div className="sold-veil"><b>SOLD</b></div>}
                  {c.images?.[0] ? <img src={c.images[0]} alt={c.name} loading="lazy" /> : <div className="noimg">No photo</div>}
                </div>
                <div className="card-b">
                  <span className="card-brand">{c.brand}</span>
                  <h3>{c.name}</h3>
                  <div className="pills">
                    <span className="pill">{c.year}</span>
                    <span className="pill">{Number(c.km).toLocaleString("en-IN")} km</span>
                    <span className="pill">{c.fuel}</span>
                    <span className="pill">{c.transmission}</span>
                  </div>
                  <div className="card-foot">
                    <span className="price">{rupee(c.price)}</span>
                    <span className="btn btn-line" style={{ padding: "8px 14px" }}>View</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="wrap"><div className="hair" /></div>

      {/* Why us */}
      <section className="section" id="why">
        <div className="wrap">
          <div className="eyebrow">Why Sri Annamayya</div>
          <h2 className="serif" style={{ fontSize: 40, marginBottom: 26 }}>Buying made simple &amp; safe</h2>
          <div className="cards3">
            {[
              ["Verified &amp; clear papers", "Every car checked, RC and insurance details confirmed before it’s listed."],
              ["Fair, honest pricing", "Straight prices with no hidden charges. What you see is what you pay."],
              ["Loan assistance", "We help arrange bank finance and guide you through the paperwork."],
              ["Buy · Sell · Exchange", "Selling your old car? Bring it in — we buy all makes and models too."],
            ].map(([t, d]) => (
              <div className="feat reveal" key={t}>
                <div className="ico"><svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4" /><path d="M12 2l8 4v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6z" /></svg></div>
                <h4 dangerouslySetInnerHTML={{ __html: t }} />
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sell your car */}
      <section className="section" id="sell">
        <div className="wrap">
          <div className="sell-card reveal">
            <div className="sell-left">
              <div className="eyebrow">Sell / Exchange</div>
              <h2 className="serif">Want to sell your car?</h2>
              <p>We buy all makes and models. Share a few details and our team will get back to you on WhatsApp with a fair quote — quick and hassle-free.</p>
              <ul className="sell-points">
                <li>All brands &amp; models accepted</li>
                <li>Instant response on WhatsApp</li>
                <li>Free valuation &amp; paperwork help</li>
                <li>Park &amp; sale facility available</li>
              </ul>
            </div>
            {sellSent ? (
              <div className="sell-success">
                <div className="check">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <h3>Request sent!</h3>
                <p>We’ve opened WhatsApp with your car details — just press <b>send</b> to reach our team. We’ll get back to you shortly with a fair quote.</p>
                <button type="button" className="btn btn-line" onClick={sellAnother}>Send another car</button>
              </div>
            ) : (
              <form className="sell-form" onSubmit={submitSell}>
                <div className="field"><label>Your name *</label><input className="input" required placeholder="Full name" value={sell.name} onChange={setSellField("name")} /></div>
                <div className="field"><label>Phone *</label><input className="input" required type="tel" placeholder="Mobile number" value={sell.phone} onChange={setSellField("phone")} /></div>
                <div className="field full"><label>Car (make &amp; model) *</label><input className="input" required placeholder="e.g. Maruti Suzuki Swift VXi" value={sell.car} onChange={setSellField("car")} /></div>
                <div className="field"><label>Year</label><input className="input" type="number" placeholder="2018" value={sell.year} onChange={setSellField("year")} /></div>
                <div className="field"><label>KMs driven</label><input className="input" type="number" placeholder="45000" value={sell.km} onChange={setSellField("km")} /></div>
                <div className="field full"><label>Expected price (₹)</label><input className="input" type="number" placeholder="Optional — we can suggest" value={sell.price} onChange={setSellField("price")} /></div>
                <div className="field full"><label>Notes</label><textarea rows={2} placeholder="Condition, ownership, insurance, anything else…" value={sell.notes} onChange={setSellField("notes")} /></div>
                <button className="btn btn-brass btn-block full" type="submit">{waIcon} Get a Quote on WhatsApp</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="section" id="about">
        <div className="wrap">
          <div className="eyebrow">About Sri Annamayya Cars</div>
          <h2 className="serif" style={{ fontSize: 40, marginBottom: 16 }}>Your trusted local car dealer in Madanapalle</h2>
          <p style={{ color: "var(--mute)", maxWidth: 720 }}>
            Sri Annamayya Cars deals in all types of pre-owned cars — buying and selling. Located opposite Royal Arabia
            Restaurant on the New By-Pass Punganur Road, Madanapalle, we offer a park &amp; sale facility and a friendly,
            no-pressure buying experience. Come visit the yard, or message us and we’ll help you find the right car.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="section" id="contact">
        <div className="wrap">
          <div className="eyebrow">Visit / Contact</div>
          <h2 className="serif" style={{ fontSize: 40, marginBottom: 26 }}>Come see the cars</h2>
          <div className="contact-grid">
            <div>
              <div className="cline"><b>Showroom</b><span>Opp. Royal Arabia Restaurant, New By-Pass Punganur Road, Madanapalle – 517325, Annamayya Dist, A.P.</span></div>
              <div className="cline" style={{ borderBottom: "none", paddingBottom: 4 }}><b>Call / WhatsApp</b></div>
              <div className="team">
                {CONTACTS.map((c) => (
                  <div className="team-row" key={c.num}>
                    <div className="who"><b>{c.name}</b><span>{c.show}</span></div>
                    <div className="acts">
                      <a className="icon-btn call" href={`tel:+${c.num}`} aria-label={`Call ${c.name}`}>{phoneIcon}</a>
                      <a className="icon-btn wa" href={waTo(c.num)} target="_blank" rel="noopener" aria-label={`WhatsApp ${c.name}`}>{waIcon}</a>
                    </div>
                  </div>
                ))}
              </div>
              <div className="cline"><b>Office</b><span>{OFFICE.show}</span></div>
              <div className="cline"><b>Hours</b><span>Mon – Sun · 9:00 AM – 8:30 PM</span></div>
              <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
                <button className="btn btn-wa" onClick={() => openWa()}>{waIcon} WhatsApp Us</button>
                <a className="btn btn-line" href={MAP_LINK} target="_blank" rel="noopener">Directions</a>
              </div>
            </div>
            <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--line)", minHeight: 260 }}>
              <iframe
                title="Sri Annamayya Cars location"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ width: "100%", height: "100%", minHeight: 260, border: 0, filter: "grayscale(.3) invert(.9) hue-rotate(180deg)" }}
                src={MAP_EMBED}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our showroom — real photos */}
      <section className="section" id="showroom">
        <div className="wrap">
          <div className="eyebrow">Our Showroom</div>
          <h2 className="serif" style={{ fontSize: 40, marginBottom: 26 }}>Visit us at Madanapalle</h2>
          <div className="gallery-grid">
            <figure className="gal reveal">
              <img src="/shop1.jpg" alt="Sri Annamayya Cars showroom signboard" loading="lazy" />
              <figcaption>Sri Annamayya Cars · All types of cars — selling &amp; buying</figcaption>
            </figure>
            <figure className="gal reveal">
              <img src="/shop2.jpg" alt="Sri Annamayya Cars yard with cars parked" loading="lazy" />
              <figcaption>Park &amp; sale facility · New By-Pass Punganur Road</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-col">
              <img src="/logo.png" alt="Sri Annamayya Cars" style={{ height: 66, marginBottom: 14 }} />
              <p style={{ color: "var(--mute)", fontSize: 14 }}>
                Your trusted local dealer for quality pre-owned cars in Madanapalle. All types of cars bought and sold —
                honest pricing, verified papers, park &amp; sale facility.
              </p>
              <div className="foot-social">
                <button onClick={() => openWa()} aria-label="WhatsApp">{waIcon}</button>
                <a href={`tel:+${PHONE}`} aria-label="Call">{phoneIcon}</a>
                <a href={MAP_LINK} target="_blank" rel="noopener" aria-label="Map">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                </a>
              </div>
            </div>

            <div className="foot-col">
              <h4>Explore</h4>
              <a href="#inventory">Available Cars</a>
              <a href="#why">Why Choose Us</a>
              <a href="#showroom">Our Showroom</a>
              <a href="#contact">Visit / Contact</a>
            </div>

            <div className="foot-col">
              <h4>Our Services</h4>
              <span className="li">All brands — buy &amp; sell</span>
              <span className="li">Old car exchange</span>
              <span className="li">Bank loan assistance</span>
              <span className="li">Park &amp; sale facility</span>
              <span className="li">Verified &amp; clear papers</span>
            </div>

            <div className="foot-col">
              <h4>Reach Us</h4>
              <span className="li">Opp. Royal Arabia Restaurant, New By-Pass Punganur Road, Madanapalle – 517325, Annamayya Dist, A.P.</span>
              <a href={`tel:+${PHONE}`}>Eswar · {CONTACTS[0].show}</a>
              <a href={`tel:+${CONTACTS[1].num}`}>Malli · {CONTACTS[1].show}</a>
              <a href={`tel:+${CONTACTS[2].num}`}>Pavan · {CONTACTS[2].show}</a>
              <span className="li">Office · {OFFICE.show}</span>
              <span className="li">Open daily · 9:00 AM – 8:30 PM</span>
            </div>
          </div>

          <div className="foot-bottom">
            <span>© {new Date().getFullYear()} Sri Annamayya Cars. All Rights Reserved.</span>
            <span>All types of cars — selling &amp; buying · Madanapalle</span>
            <a href={ADMIN_URL} className="owner-login" rel="nofollow">Owner Login</a>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <button className="float" onClick={() => openWa()} aria-label="WhatsApp">{waIcon}</button>
      </div>

      {selected && <CarModal car={selected} onClose={() => setSelected(null)} />}
      {waOpen && <WaChooser contacts={CONTACTS} message={waMsg} onClose={() => setWaOpen(false)} />}
    </>
  );
}
