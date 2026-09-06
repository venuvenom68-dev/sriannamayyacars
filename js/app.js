/* ══════════════════════════════════════════════════════════════
   Sri Annamayya Cars — public website logic (vanilla JS)
   ══════════════════════════════════════════════════════════════ */

// ── SVG icons ───────────────────────────────────────────────────
const WA_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2a10 10 0 0 0-8.7 15L2 22l5.2-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.6 0a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2l.1-.4a.5.5 0 0 0 0-.4L9.4 7c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4 5.3 5.3 0 0 0 3.2.6 2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2z"/></svg>';
const PHONE_SVG = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>';
const PIN_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
const shieldIco = '<svg viewBox="0 0 24 24"><path d="M9 12l2 2 4-4"/><path d="M12 2l8 4v6c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6z"/></svg>';
const chevL = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>';
const chevR = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
const imgCountSvg = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 15l5-5 4 4 3-3 6 6"/></svg>';

// ── Constants ───────────────────────────────────────────────────
const WA_MSG = "Hi Sri Annamayya Cars, I'm interested in your used cars. Please share the available cars and details.";
const CONTACTS = [
  { name: "Eswar", num: "919441775216", show: "94417 75216" },
  { name: "Malli", num: "919440826161", show: "94408 26161" },
  { name: "Pavan", num: "919398104188", show: "93981 04188" },
];
const waTo = (num, msg) => `https://wa.me/${num}?text=${encodeURIComponent(msg || WA_MSG)}`;

const BUDGETS = [["", "Any budget"], ["0-300000", "Under ₹3 Lakh"], ["300000-500000", "₹3 – 5 Lakh"], ["500000-800000", "₹5 – 8 Lakh"], ["800000-1200000", "₹8 – 12 Lakh"], ["1200000-100000000", "Above ₹12 Lakh"]];
const KMS = [["", "Any KMs"], ["0-30000", "Under 30,000 km"], ["30000-60000", "30,000 – 60,000 km"], ["60000-100000", "60,000 – 1,00,000 km"], ["100000-100000000", "Above 1,00,000 km"]];
const MARQUEE_BRANDS = [
  { name: "Maruti Suzuki", slug: "suzuki" }, { name: "Hyundai", slug: "hyundai" }, { name: "Tata", slug: "tata" },
  { name: "Mahindra", slug: "mahindra" }, { name: "Toyota", slug: "toyota" }, { name: "Honda", slug: "honda" },
  { name: "Kia", slug: "kia" }, { name: "Renault", slug: "renault" }, { name: "Nissan", slug: "nissan" },
  { name: "Volkswagen", slug: "volkswagen" }, { name: "Skoda", slug: "skoda" }, { name: "Ford", slug: "ford" },
  { name: "MG", slug: "mg" }, { name: "BMW", slug: "bmw" }, { name: "Mercedes-Benz", slug: "mercedes" }, { name: "Audi", slug: "audi" },
];
const WHY = [
  ["Verified &amp; clear papers", "Every car checked, RC and insurance details confirmed before it's listed."],
  ["Fair, honest pricing", "Straight prices with no hidden charges. What you see is what you pay."],
  ["Loan assistance", "We help arrange bank finance and guide you through the paperwork."],
  ["Buy · Sell · Exchange", "Selling your old car? Bring it in — we buy all makes and models too."],
];

// ── Helpers ─────────────────────────────────────────────────────
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const modelKey = (c) => c.model || c.name;

// ── State ───────────────────────────────────────────────────────
let ALL = [];
const filters = { search: "", brand: "", model: "", fuel: "", year: "", budget: "", kmr: "", sort: "new" };

// ── Boot ────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  ALL = Store.getPublicCars();
  $("#year").textContent = new Date().getFullYear();
  buildStaticBits();
  buildFilterOptions();
  bindEvents();
  render();
  runPreloader();
  setupReveal();
  setupHeaderScroll();
});

// ── Preloader (min 1.4s, like the original) ─────────────────────
function runPreloader() {
  const pre = $("#pre"), page = $("#page");
  const finish = () => { pre.classList.add("done"); page.classList.add("in"); };
  const t0 = performance.now();
  const reveal = () => setTimeout(finish, Math.max(0, 1400 - (performance.now() - t0)));
  if (document.readyState === "complete") reveal(); else window.addEventListener("load", reveal);
  setTimeout(finish, 5000);
}

function setupHeaderScroll() {
  const hd = $("#hd");
  const onScroll = () => hd.classList.toggle("stuck", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function setupReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px" });
  $$(".reveal").forEach((el) => io.observe(el));
}

// ── Static content (marquee, why cards, contacts, footer social) ─
function buildStaticBits() {
  $("#marquee").innerHTML = [...MARQUEE_BRANDS, ...MARQUEE_BRANDS].map((b) =>
    `<span class="mq-chip"><span class="mq-badge"><img src="assets/brands/${b.slug}.svg" alt="${esc(b.name)}" onerror="this.parentElement.outerHTML='<span class=\\'mq-mono\\'>${esc(b.name.slice(0, 2).toUpperCase())}</span>'"/></span>${esc(b.name)}</span>`
  ).join("");

  $("#whyGrid").innerHTML = WHY.map(([t, d]) =>
    `<div class="feat reveal"><div class="ico">${shieldIco}</div><h4>${t}</h4><p>${esc(d)}</p></div>`
  ).join("");

  $("#teamList").innerHTML = CONTACTS.map((c) =>
    `<div class="team-row"><div class="who"><b>${esc(c.name)}</b><span>${esc(c.show)}</span></div>
      <div class="acts">
        <a class="icon-btn call" href="tel:+${c.num}" aria-label="Call ${esc(c.name)}">${PHONE_SVG}</a>
        <a class="icon-btn wa" href="${waTo(c.num)}" target="_blank" rel="noopener" aria-label="WhatsApp ${esc(c.name)}">${WA_SVG}</a>
      </div></div>`
  ).join("");

  $("#footSocial").innerHTML =
    `<button data-wa aria-label="WhatsApp">${WA_SVG}</button>
     <a href="tel:+${PHONE}" aria-label="Call">${PHONE_SVG}</a>
     <a href="https://maps.app.goo.gl/zWacxZGHHqz75NKr8" target="_blank" rel="noopener" aria-label="Map">${PIN_SVG}</a>`;

  // put the WA glyph inside every data-wa button that has no content
  $$("[data-wa]").forEach((b) => { if (!b.innerHTML.trim()) b.innerHTML = WA_SVG; });
}

function buildFilterOptions() {
  const inStock = [...new Set(ALL.map((c) => c.brand))];
  const brandOptions = [...new Set([...inStock, ...CAR_BRANDS])].filter(Boolean);
  const modelOptions = [...new Set(ALL.map(modelKey))].filter(Boolean).sort();
  const yearOptions = [...new Set(ALL.map((c) => c.year))].filter(Boolean).sort((a, b) => b - a);

  $("#fBrand").innerHTML = `<option value="">All brands</option>` + brandOptions.map((b) => `<option value="${esc(b)}">${esc(b)}</option>`).join("");
  $("#fModel").innerHTML = `<option value="">All models</option>` + modelOptions.map((m) => `<option value="${esc(m)}">${esc(m)}</option>`).join("");
  $("#fFuel").innerHTML = `<option value="">Any fuel</option>` + FUEL_TYPES.map((f) => `<option value="${esc(f)}">${esc(f)}</option>`).join("");
  $("#fYear").innerHTML = `<option value="">Any year</option>` + yearOptions.map((y) => `<option value="${y}">${y}</option>`).join("");
  $("#fBudget").innerHTML = BUDGETS.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
  $("#fKm").innerHTML = KMS.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
}

// ── Events ──────────────────────────────────────────────────────
function bindEvents() {
  $("#fSearch").addEventListener("input", (e) => { filters.search = e.target.value; render(); });
  [["#fBrand", "brand"], ["#fModel", "model"], ["#fFuel", "fuel"], ["#fYear", "year"], ["#fBudget", "budget"], ["#fKm", "kmr"], ["#fSort", "sort"]]
    .forEach(([sel, key]) => $(sel).addEventListener("change", (e) => { filters[key] = e.target.value; render(); }));

  $("#resetBtn").addEventListener("click", () => {
    Object.assign(filters, { search: "", brand: "", model: "", fuel: "", year: "", budget: "", kmr: "", sort: "new" });
    $("#fSearch").value = ""; ["#fBrand", "#fModel", "#fFuel", "#fYear", "#fBudget", "#fKm"].forEach((s) => $(s).value = "");
    $("#fSort").value = "new"; render();
  });

  // Menu drawer
  const drawer = $("#drawer"), scrim = $("#scrim"), burger = $("#burger");
  const toggle = (open) => { drawer.classList.toggle("open", open); scrim.classList.toggle("open", open); burger.classList.toggle("open", open); };
  burger.addEventListener("click", () => toggle(!drawer.classList.contains("open")));
  scrim.addEventListener("click", () => toggle(false));
  $("#drawerX").addEventListener("click", () => toggle(false));
  $$(".d-link").forEach((a) => a.addEventListener("click", () => toggle(false)));

  // WhatsApp buttons → chooser
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-wa]");
    if (b) { e.preventDefault(); openWaChooser(WA_MSG); }
  });

  // Sell form → WhatsApp
  $("#sellForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target), g = (k) => fd.get(k) || "";
    const msg = `Hi Sri Annamayya Cars, I want to SELL my car.\n\n` +
      `Name: ${g("name")}\nPhone: ${g("phone")}\nCar: ${g("car")}${g("year") ? ` (${g("year")})` : ""}\n` +
      `KMs driven: ${g("km") || "-"}\nExpected price: ${g("price") ? `₹${g("price")}` : "Please suggest"}` +
      `${g("notes") ? `\nNotes: ${g("notes")}` : ""}\n\nPlease give me a quote.`;
    openWaChooser(msg);
    showSellSuccess();
  });
}

function showSellSuccess() {
  $("#sellSlot").innerHTML =
    `<div class="sell-success">
      <div class="check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg></div>
      <h3>Request sent!</h3>
      <p>We've opened WhatsApp with your car details — just press <b>send</b> to reach our team. We'll get back to you shortly with a fair quote.</p>
      <button type="button" class="btn btn-line" id="sellAgain">Send another car</button>
    </div>`;
  $("#sellAgain").addEventListener("click", () => location.reload());
}

// ── Filtering + rendering the grid ──────────────────────────────
const inRange = (v, range) => { if (!range) return true; const [mn, mx] = range.split("-").map(Number); return v >= mn && v <= mx; };

function getFiltered() {
  let list = ALL.filter((c) => {
    const q = filters.search.trim().toLowerCase();
    if (q && !`${c.name} ${c.brand} ${c.model || ""} ${c.year} ${c.fuel} ${c.colour} ${c.reg}`.toLowerCase().includes(q)) return false;
    if (filters.brand && c.brand !== filters.brand) return false;
    if (filters.model && modelKey(c) !== filters.model) return false;
    if (filters.fuel && c.fuel !== filters.fuel) return false;
    if (filters.year && String(c.year) !== filters.year) return false;
    if (!inRange(c.price, filters.budget)) return false;
    if (!inRange(c.km, filters.kmr)) return false;
    return true;
  });
  return list.sort((a, b) => {
    if (filters.sort === "low") return a.price - b.price;
    if (filters.sort === "high") return b.price - a.price;
    if (filters.sort === "km") return a.km - b.km;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

function render() {
  $("#statCount").textContent = ALL.length || "—";
  const list = getFiltered();
  $("#resultCount").textContent = `${list.length} car${list.length !== 1 ? "s" : ""} available`;
  const grid = $("#grid");

  if (list.length === 0) {
    const empty = ALL.length === 0;
    grid.innerHTML =
      `<div class="empty">
        <h3>${empty ? "New stock arriving soon" : "Nothing matches those filters"}</h3>
        <p>${empty ? "We're updating our listings. Message us and we'll share what's available today." : "Try widening your search or clearing the filters."}</p>
        <button class="btn btn-wa" data-wa>${WA_SVG} Ask on WhatsApp</button>
      </div>`;
    return;
  }

  grid.innerHTML = list.map((c) => `
    <article class="card" data-id="${c._id}">
      <div class="shot">
        ${c.badge ? `<span class="badge ${c.badge === "FEATURED" ? "b-feat" : "b-good"}">${esc(c.badge)}</span>` : ""}
        ${c.images && c.images.length > 1 ? `<span class="img-count">${imgCountSvg}${c.images.length}</span>` : ""}
        ${c.reg ? `<span class="reg">${esc(c.reg)}</span>` : ""}
        ${c.status === "sold" ? `<div class="sold-veil"><b>SOLD</b></div>` : ""}
        ${c.images && c.images[0] ? `<img src="${esc(c.images[0])}" alt="${esc(c.name)}" loading="lazy" />` : `<div class="noimg">No photo</div>`}
      </div>
      <div class="card-b">
        <span class="card-brand">${esc(c.brand)}</span>
        <h3>${esc(c.name)}</h3>
        <div class="pills">
          <span class="pill">${c.year}</span>
          <span class="pill">${Number(c.km).toLocaleString("en-IN")} km</span>
          <span class="pill">${esc(c.fuel)}</span>
          <span class="pill">${esc(c.transmission)}</span>
        </div>
        <div class="card-foot">
          <span class="price">${rupee(c.price)}</span>
          <span class="btn btn-line" style="padding:8px 14px">View</span>
        </div>
      </div>
    </article>`).join("");

  $$(".card", grid).forEach((el) => el.addEventListener("click", () => openCarModal(el.dataset.id)));
}

// ── Car modal (gallery + lightbox) ──────────────────────────────
function openCarModal(id) {
  const car = ALL.find((c) => c._id === id);
  if (!car) return;
  const imgs = car.images || [];
  let active = 0, lb = null;
  const root = $("#modalRoot");
  document.body.style.overflow = "hidden";
  window.history.pushState({ sacCar: 1 }, "");

  const msg = `Hi Sri Annamayya Cars, I'm interested in the ${car.name} (${car.year}) listed at ${rupee(car.price)}. Is it still available?`;
  const specs = [["Model Year", car.year], ["KM Driven", `${Number(car.km).toLocaleString("en-IN")} km`], ["Fuel", car.fuel], ["Transmission", car.transmission], ["Ownership", car.owner], ["Registration", car.reg || "—"], ["Colour", car.colour || "—"], ["Seating", car.seats]];

  function draw() {
    root.innerHTML = `
      <div class="ov" id="carov">
        <div class="modal">
          <button class="mx" data-close aria-label="Close">✕</button>
          <div class="m-stage">
            ${imgs.length ? `
              <img src="${esc(imgs[active])}" alt="${esc(car.name)}" style="cursor:zoom-in" data-zoom />
              ${imgs.length > 1 ? `
                <button class="m-arrow m-prev" data-prev>${chevL}</button>
                <button class="m-arrow m-next" data-next>${chevR}</button>
                <span class="m-counter">${active + 1} / ${imgs.length} · tap to zoom</span>` : ""}
            ` : `<div class="noimg" style="display:grid;place-items:center;height:100%;color:#8b7d64">No photo</div>`}
          </div>
          ${imgs.length > 1 ? `<div class="thumbs">${imgs.map((s, i) => `<button class="${i === active ? "on" : ""}" data-thumb="${i}"><img src="${esc(s)}" alt=""/></button>`).join("")}</div>` : ""}
          <div class="m-body">
            <div class="m-top">
              <div>
                <div class="eyebrow" style="margin-bottom:10px">${esc(car.brand)} · ${car.status === "sold" ? "Sold" : "Available"}</div>
                <h2>${esc(car.name)}</h2>
              </div>
              <div class="m-price">${rupee(car.price)}<div class="mono" style="font-size:10px;color:var(--mute);letter-spacing:.16em;margin-top:6px">≈ ${lakh(car.price)}</div></div>
            </div>
            <dl class="m-specs">${specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
            ${car.desc ? `<p class="m-desc">${esc(car.desc)}</p>` : ""}
            <div class="m-acts">
              <a class="btn btn-brass" href="tel:+${PHONE}">Call Now</a>
              <a class="btn btn-wa" href="${waLink(msg)}" target="_blank" rel="noopener">WhatsApp Enquiry</a>
              <button class="btn btn-ghost" data-close>Back to cars</button>
            </div>
          </div>
        </div>
      </div>
      ${lb !== null && imgs.length ? `
      <div class="lightbox" data-lbclose>
        <button class="lb-close" data-lbx aria-label="Close photo">✕</button>
        ${imgs.length > 1 ? `<button class="lb-arrow lb-prev" data-lbprev>${chevL}</button>` : ""}
        <img class="lb-img" src="${esc(imgs[lb])}" alt="${esc(car.name)}" />
        ${imgs.length > 1 ? `<button class="lb-arrow lb-next" data-lbnext>${chevR}</button>` : ""}
        <span class="lb-counter">${lb + 1} / ${imgs.length}</span>
      </div>` : ""}
    `;
    wire();
  }

  function close() { window.history.back(); }
  function reallyClose() { root.innerHTML = ""; document.body.style.overflow = ""; window.removeEventListener("popstate", onPop); document.removeEventListener("keydown", onKey); }
  const onPop = () => reallyClose();
  const onKey = (e) => {
    if (e.key === "Escape") { lb !== null ? (lb = null, draw()) : close(); }
    else if (e.key === "ArrowRight") { lb !== null ? (lb = (lb + 1) % imgs.length) : (active = (active + 1) % imgs.length); draw(); }
    else if (e.key === "ArrowLeft") { lb !== null ? (lb = (lb - 1 + imgs.length) % imgs.length) : (active = (active - 1 + imgs.length) % imgs.length); draw(); }
  };
  window.addEventListener("popstate", onPop);
  document.addEventListener("keydown", onKey);

  function wire() {
    $$("[data-close]", root).forEach((el) => el.addEventListener("click", close));
    const ov = $("#carov", root); if (ov) ov.addEventListener("click", (e) => { if (e.target === ov) close(); });
    const prev = $("[data-prev]", root), next = $("[data-next]", root);
    if (prev) prev.addEventListener("click", () => { active = (active - 1 + imgs.length) % imgs.length; draw(); });
    if (next) next.addEventListener("click", () => { active = (active + 1) % imgs.length; draw(); });
    $$("[data-thumb]", root).forEach((b) => b.addEventListener("click", () => { active = +b.dataset.thumb; draw(); }));
    const zoom = $("[data-zoom]", root); if (zoom) zoom.addEventListener("click", () => { lb = active; draw(); });
    const lbx = $("[data-lbx]", root); if (lbx) lbx.addEventListener("click", () => { lb = null; draw(); });
    const lbov = $("[data-lbclose]", root); if (lbov) lbov.addEventListener("click", (e) => { if (e.target === lbov) { lb = null; draw(); } });
    const lp = $("[data-lbprev]", root); if (lp) lp.addEventListener("click", () => { lb = (lb - 1 + imgs.length) % imgs.length; draw(); });
    const ln = $("[data-lbnext]", root); if (ln) ln.addEventListener("click", () => { lb = (lb + 1) % imgs.length; draw(); });
  }
  draw();
}

// ── WhatsApp chooser modal ──────────────────────────────────────
function openWaChooser(message) {
  const root = $("#modalRoot");
  document.body.style.overflow = "hidden";
  root.innerHTML = `
    <div class="ov" id="waov">
      <div class="wa-modal">
        <button class="mx" id="wax" aria-label="Close">✕</button>
        <div class="wa-head">
          <div class="wa-badge">${WA_SVG}</div>
          <h3>Chat with us on WhatsApp</h3>
          <p>Choose who you'd like to message</p>
        </div>
        <div class="wa-list">
          ${CONTACTS.map((c, i) => `
            <a class="wa-person" href="${waTo(c.num, message)}" target="_blank" rel="noopener" style="animation-delay:${0.06 + i * 0.07}s">
              <span class="wa-av">${esc(c.name[0])}</span>
              <span class="wa-who"><b>${esc(c.name)}</b><span>${esc(c.show)}</span></span>
              <span class="wa-go">${WA_SVG}</span>
            </a>`).join("")}
        </div>
      </div>
    </div>`;
  const close = () => { root.innerHTML = ""; document.body.style.overflow = ""; };
  $("#wax").addEventListener("click", close);
  $("#waov").addEventListener("click", (e) => { if (e.target.id === "waov") close(); });
  $$(".wa-person", root).forEach((a) => a.addEventListener("click", close));
}
