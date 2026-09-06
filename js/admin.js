/* ══════════════════════════════════════════════════════════════
   Sri Annamayya Cars — owner dashboard (vanilla JS, standalone)
   Data is saved in this browser (localStorage). No backend.
   Default password: annamayya2024  (change ADMIN_PASSWORD in data.js)
   ══════════════════════════════════════════════════════════════ */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const imgCountSvg = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 15l5-5 4 4 3-3 6 6"/></svg>';
const rotIcon = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>';

// ── Toast ───────────────────────────────────────────────────────
function toast(msg, err = false) {
  const t = document.createElement("div");
  t.className = `toast ${err ? "err" : ""}`;
  t.textContent = msg;
  $("#toastRoot").appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// ── Boot ────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const pre = $("#pre");
  setTimeout(() => pre.classList.add("done"), 1200);
  if (localStorage.getItem(ADMIN_KEY) === "1") renderDashboard();
  else renderLogin();
});

// ── Login ───────────────────────────────────────────────────────
function renderLogin() {
  $("#app").innerHTML = `
    <div class="admin-login">
      <form class="login-card" id="loginForm">
        <img src="assets/logo.png" alt="Sri Annamayya Cars" />
        <h1>Owner Dashboard</h1>
        <p>Enter your password to manage your cars.</p>
        <div class="field" style="text-align:left;margin-bottom:16px">
          <label>Password</label>
          <input class="input" type="password" id="pw" placeholder="••••••••" autofocus />
        </div>
        <button class="btn btn-brass btn-block" type="submit">Enter Dashboard</button>
        <a href="index.html" style="display:inline-block;margin-top:18px;color:var(--mute);font-size:12px">Open website ↗</a>
        <p style="margin-top:16px;font-size:11px;color:var(--mute)">Demo password: <b style="color:var(--brass-lt)">annamayya2024</b></p>
      </form>
    </div>`;
  $("#loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if ($("#pw").value === ADMIN_PASSWORD) { localStorage.setItem(ADMIN_KEY, "1"); renderDashboard(); }
    else toast("Incorrect password", true);
  });
}

function logout() { localStorage.removeItem(ADMIN_KEY); renderLogin(); }

// ── Dashboard ───────────────────────────────────────────────────
function renderDashboard() {
  const cars = Store.getAllCars();
  const available = cars.filter((c) => c.status === "available").length;
  const sold = cars.filter((c) => c.status === "sold").length;

  $("#app").innerHTML = `
    <div class="admin-shell">
      <header class="admin-hd">
        <div class="wrap">
          <img src="assets/logo.png" alt="Sri Annamayya Cars" />
          <span class="tag">Owner</span>
          <div style="margin-left:auto;display:flex;gap:10px">
            <a class="btn btn-line" href="index.html" target="_blank" rel="noopener">View website</a>
            <button class="btn btn-ghost" id="logoutBtn">Log out</button>
          </div>
        </div>
      </header>
      <main class="admin-main">
        <div class="wrap">
          <div class="eyebrow">Your inventory</div>
          <h1 class="serif" style="font-size:38px;margin-bottom:20px">Manage your cars</h1>
          <div class="stat-row">
            <div class="chip"><b>${cars.length}</b><span>Total cars</span></div>
            <div class="chip"><b>${available}</b><span>Available</span></div>
            <div class="chip"><b>${sold}</b><span>Sold</span></div>
          </div>
          <div class="admin-bar">
            <div class="search">
              <svg viewBox="0 0 24 24" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <input class="input" id="adSearch" placeholder="Search your cars by name, brand, reg no…" />
            </div>
            <button class="btn btn-brass" id="addBtn">+ Add Car</button>
          </div>
          <div id="adGrid"></div>
        </div>
      </main>
    </div>`;

  $("#logoutBtn").addEventListener("click", logout);
  $("#addBtn").addEventListener("click", () => openForm(null));
  $("#adSearch").addEventListener("input", (e) => drawGrid(e.target.value));
  drawGrid("");
}

function drawGrid(search) {
  const cars = Store.getAllCars();
  const q = (search || "").trim().toLowerCase();
  const shown = cars.filter((c) => !q || `${c.name} ${c.brand} ${c.model || ""} ${c.reg || ""} ${c.colour || ""}`.toLowerCase().includes(q));
  const grid = $("#adGrid");

  if (cars.length === 0) {
    grid.innerHTML = `<div class="empty"><h3>No cars yet</h3><p>Your website has no cars listed. Upload your first car to get started — it'll appear on the website instantly.</p><button class="btn btn-brass" id="firstBtn">+ Upload your first car</button></div>`;
    $("#firstBtn").addEventListener("click", () => openForm(null));
    return;
  }
  if (shown.length === 0) { grid.innerHTML = `<div class="empty"><h3>No matches</h3><p>No cars match "${esc(search)}".</p></div>`; return; }

  grid.innerHTML = `<div class="admin-grid">${shown.map((c) => `
    <div class="a-card" data-view="${c._id}" style="cursor:pointer">
      <div class="a-shot">
        ${c.status === "sold" ? `<span class="badge b-sold" style="position:absolute;top:10px;left:10px">SOLD</span>` : ""}
        ${c.images && c.images.length > 1 ? `<span class="img-count" style="position:absolute;top:10px;right:10px">${imgCountSvg}${c.images.length}</span>` : ""}
        ${c.images && c.images[0] ? `<img src="${esc(c.images[0])}" alt="${esc(c.name)}"/>` : `<div class="noimg">No photo</div>`}
      </div>
      <div class="a-body">
        <div class="sub">${esc(c.brand)} · ${c.year} · ${esc(c.reg || "no reg")}</div>
        <h4>${esc(c.name)}</h4>
        <div class="a-price">${rupee(c.price)}</div>
        <div class="pills" style="margin-top:10px">
          <span class="pill">${Number(c.km).toLocaleString("en-IN")} km</span>
          <span class="pill">${esc(c.fuel)}</span>
          <span class="pill">${(c.images || []).length} photo${(c.images || []).length === 1 ? "" : "s"}</span>
        </div>
        <div class="a-acts" data-acts>
          <button class="btn btn-line" data-edit="${c._id}">Edit</button>
          <button class="btn btn-line" data-sold="${c._id}">${c.status === "sold" ? "Un-sell" : "Sold"}</button>
          <button class="btn btn-danger" data-del="${c._id}">Delete</button>
        </div>
      </div>
    </div>`).join("")}</div>`;

  $$("[data-acts]", grid).forEach((el) => el.addEventListener("click", (e) => e.stopPropagation()));
  $$("[data-view]", grid).forEach((el) => el.addEventListener("click", () => openView(el.dataset.view)));
  $$("[data-edit]", grid).forEach((b) => b.addEventListener("click", () => openForm(Store.getCar(b.dataset.edit))));
  $$("[data-del]", grid).forEach((b) => b.addEventListener("click", () => {
    const car = Store.getCar(b.dataset.del);
    if (confirm(`Delete "${car.name}"? This cannot be undone.`)) { Store.deleteCar(car._id); toast("Car deleted"); renderDashboard(); }
  }));
  $$("[data-sold]", grid).forEach((b) => b.addEventListener("click", () => {
    const car = Store.getCar(b.dataset.sold);
    Store.updateCar(car._id, { status: car.status === "sold" ? "available" : "sold" });
    toast(car.status === "sold" ? "Marked as available" : "Marked as sold");
    renderDashboard();
  }));
}

// ── Image helpers (resize + compress to a small data URL) ───────
function fileToDataURL(file) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); }); }
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }

async function compressToDataURL(fileOrUrl, isFile) {
  const src = isFile ? await fileToDataURL(fileOrUrl) : fileOrUrl;
  const img = await loadImg(src);
  const MAX = 1280;
  let { naturalWidth: w, naturalHeight: h } = img;
  if (w > MAX || h > MAX) { const s = MAX / Math.max(w, h); w = Math.round(w * s); h = Math.round(h * s); }
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.getContext("2d").drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.82);
}
async function rotateDataURL(src) {
  const img = await loadImg(src);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalHeight; canvas.height = img.naturalWidth;
  const ctx = canvas.getContext("2d");
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  return canvas.toDataURL("image/jpeg", 0.9);
}

// ── Add / Edit form ─────────────────────────────────────────────
let uid = 0;
function openForm(car) {
  const editing = !!car;
  const empty = { name: "", brand: "", model: "", year: "", price: "", km: "", fuel: "Petrol", transmission: "Manual", owner: "1st Owner", reg: "", colour: "", seats: "5 Seater", badge: "", desc: "" };
  const f = editing ? { ...empty, ...car } : { ...empty };
  // items: { id, url }  (url is a data URL or bundled asset path)
  let items = (car?.images || []).map((url) => ({ id: `it-${uid++}`, url }));
  let dragId = null;
  const root = $("#modalRoot");
  document.body.style.overflow = "hidden";

  const opt = (arr, sel) => arr.map((x) => `<option value="${esc(x)}" ${x === sel ? "selected" : ""}>${esc(x)}</option>`).join("");

  function draw() {
    root.innerHTML = `
      <div class="ov" id="fov">
        <div class="modal">
          <button class="mx" id="fx" aria-label="Close">✕</button>
          <form class="m-body" id="carForm">
            <div class="eyebrow">${editing ? "Edit car" : "Add a new car"}</div>
            <h2 class="serif" style="font-size:30px;margin-bottom:22px">${editing ? esc(f.name || "Edit car") : "Post a car to the website"}</h2>
            <div class="form-grid">
              <div class="field full"><label>Car name / title *</label><input class="input" name="name" placeholder="e.g. Hyundai Creta SX (O)" value="${esc(f.name)}" /></div>
              <div class="field"><label>Brand *</label><select class="select" name="brand"><option value="">Select brand</option>${opt(CAR_BRANDS, f.brand)}</select></div>
              <div class="field"><label>Model / variant</label><input class="input" name="model" placeholder="e.g. Creta 1.5 SX" value="${esc(f.model)}" /></div>
              <div class="field"><label>Year *</label><input class="input" name="year" type="number" placeholder="2019" value="${esc(f.year)}" /></div>
              <div class="field"><label>Price (₹) *</label><input class="input" name="price" type="number" placeholder="975000" value="${esc(f.price)}" /></div>
              <div class="field"><label>KM driven</label><input class="input" name="km" type="number" placeholder="68000" value="${esc(f.km)}" /></div>
              <div class="field"><label>Fuel</label><select class="select" name="fuel">${opt(FUEL_TYPES, f.fuel)}</select></div>
              <div class="field"><label>Transmission</label><select class="select" name="transmission">${opt(TRANSMISSIONS, f.transmission)}</select></div>
              <div class="field"><label>Ownership</label><select class="select" name="owner">${opt(OWNERSHIPS, f.owner)}</select></div>
              <div class="field"><label>Registration no. plate</label><input class="input" name="reg" placeholder="AP 04 BX 5553" value="${esc(f.reg)}" /></div>
              <div class="field"><label>Colour</label><input class="input" name="colour" placeholder="White" value="${esc(f.colour)}" /></div>
              <div class="field"><label>Seating</label><select class="select" name="seats">${opt(SEATING, f.seats)}</select></div>
              <div class="field"><label>Tag / badge</label><select class="select" name="badge">${BADGES.map((b) => `<option value="${esc(b)}" ${b === f.badge ? "selected" : ""}>${b || "None"}</option>`).join("")}</select></div>
              <div class="field full"><label>Description</label><textarea name="desc" rows="3" placeholder="Single owner, full service history, tyres good, insurance valid…">${esc(f.desc)}</textarea></div>
              <div class="field full">
                <label>Photos — drag to reorder · first photo is the cover</label>
                <div class="drop" id="drop">
                  <h4>Drag photos here, or click to choose</h4>
                  <p>Big phone photos are fine — automatically resized &amp; compressed so they fit in your browser storage.</p>
                  <input id="fileInput" type="file" accept="image/*" multiple hidden />
                </div>
                ${items.length ? `<p class="prev-hint">Drag any photo to change its position · use ⟳ to rotate · ✕ to remove</p>
                <div class="previews" id="previews">${items.map((it, idx) => `
                  <div class="prev ${dragId === it.id ? "dragging" : ""}" draggable="true" data-id="${it.id}">
                    <img src="${esc(it.url)}" alt="" />
                    ${idx === 0 ? `<span class="cover-tag">COVER</span>` : ""}
                    <button type="button" class="rot" title="Rotate" data-rot="${it.id}">${rotIcon}</button>
                    <button type="button" class="rm" title="Remove" data-rm="${it.id}">✕</button>
                  </div>`).join("")}</div>` : ""}
              </div>
            </div>
            <div class="m-acts" style="margin-top:24px">
              <button class="btn btn-brass" type="submit">${editing ? "Save changes" : "Post car"}</button>
              <button type="button" class="btn btn-ghost" id="cancelBtn">Cancel</button>
            </div>
          </form>
        </div>
      </div>`;
    wire();
  }

  function close() { root.innerHTML = ""; document.body.style.overflow = ""; }

  async function addFiles(list) {
    const imgs = [...list].filter((x) => x.type.startsWith("image/"));
    for (const file of imgs) {
      try { const url = await compressToDataURL(file, true); items.push({ id: `it-${uid++}`, url }); }
      catch { toast("Couldn't read one of the images", true); }
    }
    // keep current field values while re-drawing
    syncFields(); draw();
  }
  function syncFields() {
    const form = $("#carForm"); if (!form) return;
    new FormData(form).forEach((v, k) => { if (k in f) f[k] = v; });
  }

  function wire() {
    $("#fx").addEventListener("click", close);
    $("#cancelBtn").addEventListener("click", close);
    $("#fov").addEventListener("click", (e) => { if (e.target.id === "fov") close(); });

    const drop = $("#drop"), input = $("#fileInput");
    drop.addEventListener("click", () => input.click());
    drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("over"); });
    drop.addEventListener("dragleave", () => drop.classList.remove("over"));
    drop.addEventListener("drop", (e) => { e.preventDefault(); drop.classList.remove("over"); addFiles(e.dataTransfer.files); });
    input.addEventListener("change", (e) => addFiles(e.target.files));

    $$("[data-rm]").forEach((b) => b.addEventListener("click", () => { items = items.filter((x) => x.id !== b.dataset.rm); syncFields(); draw(); }));
    $$("[data-rot]").forEach((b) => b.addEventListener("click", async () => {
      const it = items.find((x) => x.id === b.dataset.rot); if (!it) return;
      try { it.url = await rotateDataURL(it.url); syncFields(); draw(); } catch { toast("Couldn't rotate this image", true); }
    }));

    // drag reorder
    $$(".prev").forEach((el) => {
      el.addEventListener("dragstart", () => { dragId = el.dataset.id; });
      el.addEventListener("dragend", () => { dragId = null; });
      el.addEventListener("dragover", (e) => e.preventDefault());
      el.addEventListener("drop", () => {
        const id = el.dataset.id;
        if (!dragId || dragId === id) return;
        const from = items.findIndex((x) => x.id === dragId), to = items.findIndex((x) => x.id === id);
        if (from < 0 || to < 0) return;
        const [m] = items.splice(from, 1); items.splice(to, 0, m);
        dragId = null; syncFields(); draw();
      });
    });

    $("#carForm").addEventListener("submit", (e) => {
      e.preventDefault();
      syncFields();
      if (!f.name || !f.brand || !f.year || !f.price) return toast("Name, brand, year and price are required", true);
      const data = {
        name: f.name, brand: f.brand, model: f.model, year: Number(f.year), price: Number(f.price),
        km: Number(f.km) || 0, fuel: f.fuel, transmission: f.transmission, owner: f.owner,
        reg: f.reg, colour: f.colour, seats: f.seats, badge: f.badge, desc: f.desc,
        images: items.map((it) => it.url), status: car?.status || "available",
      };
      try {
        if (editing) Store.updateCar(car._id, data); else Store.addCar(data);
        toast(editing ? "Car updated" : "Car posted to the website");
        close(); renderDashboard();
      } catch (err) {
        toast("Storage is full — remove some photos or cars. (" + err.message + ")", true);
      }
    });
  }
  draw();
}

// ── View a car (read-only, with lightbox) ───────────────────────
function openView(id) {
  const car = Store.getCar(id); if (!car) return;
  const imgs = car.images || [];
  let lb = null;
  const root = $("#modalRoot");
  document.body.style.overflow = "hidden";
  const specs = [["Model Year", car.year], ["KM Driven", `${Number(car.km).toLocaleString("en-IN")} km`], ["Fuel", car.fuel], ["Transmission", car.transmission], ["Ownership", car.owner], ["Registration", car.reg || "—"], ["Colour", car.colour || "—"], ["Seating", car.seats], ["Status", car.status === "sold" ? "Sold" : "Available"], ["Tag", car.badge || "—"]];

  function draw() {
    root.innerHTML = `
      <div class="ov" id="vov">
        <div class="modal">
          <button class="mx" id="vx" aria-label="Close">✕</button>
          ${imgs[0] ? `<div class="m-stage"><img src="${esc(imgs[0])}" alt="${esc(car.name)}" style="cursor:zoom-in" data-zoom="0"/><span class="m-counter">Tap photo to enlarge</span></div>` : ""}
          <div class="m-body">
            <div class="m-top">
              <div><div class="eyebrow" style="margin-bottom:10px">${esc(car.brand)} · ${esc(car.model || car.name)}</div><h2>${esc(car.name)}</h2></div>
              <div class="m-price">${rupee(car.price)}<div class="mono" style="font-size:10px;color:var(--mute);letter-spacing:.16em;margin-top:6px">≈ ${lakh(car.price)}</div></div>
            </div>
            <dl class="m-specs">${specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
            ${car.desc ? `<p class="m-desc">${esc(car.desc)}</p>` : ""}
            ${imgs.length ? `<div class="eyebrow" style="margin-bottom:10px">Photos (${imgs.length}) — tap to enlarge</div>
              <div class="view-grid">${imgs.map((s, i) => `<button type="button" class="view-thumb" data-zoom="${i}"><img src="${esc(s)}" alt=""/></button>`).join("")}</div>` : ""}
            <div class="m-acts" style="margin-top:22px">
              <button class="btn btn-brass" id="vedit">Edit this car</button>
              <button class="btn btn-ghost" id="vclose">Close</button>
            </div>
          </div>
        </div>
      </div>
      ${lb !== null ? `<div class="lightbox" id="vlb">
        <button class="lb-close" id="vlbx" aria-label="Close photo">✕</button>
        ${imgs.length > 1 ? `<button class="lb-arrow lb-prev" id="vlbp">‹</button>` : ""}
        <img class="lb-img" src="${esc(imgs[lb])}" alt="" />
        ${imgs.length > 1 ? `<button class="lb-arrow lb-next" id="vlbn">›</button>` : ""}
        <span class="lb-counter">${lb + 1} / ${imgs.length}</span>
      </div>` : ""}`;
    wire();
  }
  function close() { root.innerHTML = ""; document.body.style.overflow = ""; document.removeEventListener("keydown", onKey); }
  const onKey = (e) => {
    if (e.key === "Escape") { lb !== null ? (lb = null, draw()) : close(); }
    if (lb !== null && e.key === "ArrowRight") { lb = (lb + 1) % imgs.length; draw(); }
    if (lb !== null && e.key === "ArrowLeft") { lb = (lb - 1 + imgs.length) % imgs.length; draw(); }
  };
  document.addEventListener("keydown", onKey);

  function wire() {
    $("#vx").addEventListener("click", close);
    $("#vclose").addEventListener("click", close);
    $("#vov").addEventListener("click", (e) => { if (e.target.id === "vov") close(); });
    $("#vedit").addEventListener("click", () => { close(); openForm(car); });
    $$("[data-zoom]").forEach((b) => b.addEventListener("click", () => { lb = +b.dataset.zoom; draw(); }));
    const vlb = $("#vlb"); if (vlb) vlb.addEventListener("click", (e) => { if (e.target.id === "vlb") { lb = null; draw(); } });
    const vlbx = $("#vlbx"); if (vlbx) vlbx.addEventListener("click", () => { lb = null; draw(); });
    const vlbp = $("#vlbp"); if (vlbp) vlbp.addEventListener("click", () => { lb = (lb - 1 + imgs.length) % imgs.length; draw(); });
    const vlbn = $("#vlbn"); if (vlbn) vlbn.addEventListener("click", () => { lb = (lb + 1) % imgs.length; draw(); });
  }
  draw();
}
