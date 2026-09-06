"use client";
import { useRef, useState } from "react";
import { createCar, updateCar, scanImages } from "@/lib/api";
import { CAR_BRANDS, FUEL_TYPES, TRANSMISSIONS, OWNERSHIPS, SEATING, BADGES } from "@/lib/brands";

const empty = {
  name: "", brand: "", model: "", year: "", price: "", km: "",
  fuel: "Petrol", transmission: "Manual", owner: "1st Owner",
  reg: "", colour: "", seats: "5 Seater", badge: "", desc: "",
};

let uid = 0;
const nextId = () => `it-${Date.now()}-${uid++}`;

function loadImage(src, cross) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (cross) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
// Rotate an image 90° clockwise and return it as a fresh JPEG File
async function rotateToFile(src, cross) {
  const img = await loadImage(src, cross);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalHeight;
  canvas.height = img.naturalWidth;
  const ctx = canvas.getContext("2d");
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.92));
  return new File([blob], `rot-${Date.now()}.jpg`, { type: "image/jpeg" });
}

const rotIcon = (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v6h-6" /></svg>
);

export default function CarForm({ token, car, onClose, onSaved, toast }) {
  const editing = !!car;
  const [f, setF] = useState(editing ? { ...empty, ...car } : empty);
  // unified ordered list — each item is a saved URL or a new/edited File
  const [items, setItems] = useState(() =>
    (car?.images || []).map((url) => ({ id: nextId(), kind: "url", url }))
  );
  const [over, setOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [dragId, setDragId] = useState(null);
  const inputRef = useRef();

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const addFiles = (list) => {
    const imgs = Array.from(list).filter((x) => x.type.startsWith("image/"));
    setItems((p) => [...p, ...imgs.map((file) => ({ id: nextId(), kind: "file", file, url: URL.createObjectURL(file) }))]);
  };
  const onDropZone = (e) => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); };

  const removeItem = (id) => setItems((p) => p.filter((it) => it.id !== id));

  const rotateItem = async (id) => {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    try {
      const file = await rotateToFile(it.url, it.kind === "url");
      const url = URL.createObjectURL(file);
      setItems((p) => p.map((x) => (x.id === id ? { id: x.id, kind: "file", file, url } : x)));
    } catch {
      toast("Couldn't rotate this image", true);
    }
  };

  // drag to reorder
  const dropOn = (id) => {
    if (!dragId || dragId === id) return setDragId(null);
    setItems((p) => {
      const from = p.findIndex((x) => x.id === dragId);
      const to = p.findIndex((x) => x.id === id);
      if (from < 0 || to < 0) return p;
      const arr = [...p];
      const [m] = arr.splice(from, 1);
      arr.splice(to, 0, m);
      return arr;
    });
    setDragId(null);
  };

  const scan = async () => {
    const files = items.filter((it) => it.kind === "file").map((it) => it.file);
    if (!files.length) return toast("Add a photo first, then scan", true);
    setScanning(true);
    try {
      const { fields, matched } = await scanImages(token, files);
      if (!matched) return toast("Couldn't read details from the photo — please fill manually", true);
      setF((prev) => {
        const upd = { ...prev };
        Object.entries(fields).forEach(([k, v]) => { if (v !== undefined && v !== "") upd[k] = String(v); });
        return upd;
      });
      toast(`Auto-filled ${matched} detail${matched > 1 ? "s" : ""} from the photo — please review`);
    } catch (err) {
      toast(err.message, true);
    } finally {
      setScanning(false);
    }
  };

  const kb = (b) => (b > 1024 * 1024 ? (b / 1024 / 1024).toFixed(1) + " MB" : Math.round(b / 1024) + " KB");

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name || !f.brand || !f.year || !f.price) return toast("Name, brand, year and price are required", true);
    setSaving(true);
    try {
      const fd = new FormData();
      ["name","brand","model","year","price","km","fuel","transmission","owner","reg","colour","seats","badge","desc"]
        .forEach((k) => fd.append(k, f[k] ?? ""));

      // Append new files in order + build the final ordering
      const order = [];
      let k = 0;
      for (const it of items) {
        if (it.kind === "file") { fd.append("images", it.file); order.push(`__new__${k}`); k++; }
        else order.push(it.url);
      }
      if (editing) fd.append("imageOrder", JSON.stringify(order));

      if (editing) await updateCar(token, car._id, fd);
      else await createCar(token, fd);

      toast(editing ? "Car updated" : "Car posted to the website");
      onSaved();
    } catch (err) {
      toast(err.message, true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ov" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="mx" onClick={onClose} aria-label="Close">✕</button>
        <form className="m-body" onSubmit={submit}>
          <div className="eyebrow">{editing ? "Edit car" : "Add a new car"}</div>
          <h2 className="serif" style={{ fontSize: 30, marginBottom: 22 }}>
            {editing ? f.name || "Edit car" : "Post a car to the website"}
          </h2>

          <div className="form-grid">
            <div className="field full">
              <label>Car name / title *</label>
              <input className="input" placeholder="e.g. Hyundai Creta SX (O)" value={f.name} onChange={set("name")} />
            </div>
            <div className="field">
              <label>Brand *</label>
              <select className="select" value={f.brand} onChange={set("brand")}>
                <option value="">Select brand</option>
                {CAR_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Model / variant</label>
              <input className="input" placeholder="e.g. Creta 1.5 SX" value={f.model} onChange={set("model")} />
            </div>
            <div className="field">
              <label>Year *</label>
              <input className="input" type="number" placeholder="2019" value={f.year} onChange={set("year")} />
            </div>
            <div className="field">
              <label>Price (₹) *</label>
              <input className="input" type="number" placeholder="975000" value={f.price} onChange={set("price")} />
            </div>
            <div className="field">
              <label>KM driven</label>
              <input className="input" type="number" placeholder="68000" value={f.km} onChange={set("km")} />
            </div>
            <div className="field">
              <label>Fuel</label>
              <select className="select" value={f.fuel} onChange={set("fuel")}>
                {FUEL_TYPES.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Transmission</label>
              <select className="select" value={f.transmission} onChange={set("transmission")}>
                {TRANSMISSIONS.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Ownership</label>
              <select className="select" value={f.owner} onChange={set("owner")}>
                {OWNERSHIPS.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Registration no. plate</label>
              <input className="input" placeholder="AP 04 BX 5553" value={f.reg} onChange={set("reg")} />
            </div>
            <div className="field">
              <label>Colour</label>
              <input className="input" placeholder="White" value={f.colour} onChange={set("colour")} />
            </div>
            <div className="field">
              <label>Seating</label>
              <select className="select" value={f.seats} onChange={set("seats")}>
                {SEATING.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Tag / badge</label>
              <select className="select" value={f.badge} onChange={set("badge")}>
                {BADGES.map((x) => <option key={x} value={x}>{x || "None"}</option>)}
              </select>
            </div>
            <div className="field full">
              <label>Description</label>
              <textarea rows={3} placeholder="Single owner, full service history, tyres good, insurance valid…" value={f.desc} onChange={set("desc")} />
            </div>

            {/* Photos */}
            <div className="field full">
              <label>Photos — drag to reorder · first photo is the cover</label>
              <div
                className={`drop ${over ? "over" : ""}`}
                onClick={() => inputRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setOver(true); }}
                onDragLeave={() => setOver(false)}
                onDrop={onDropZone}
              >
                <h4>Drag photos here, or click to choose</h4>
                <p>Big 5 MB phone photos are fine — compressed to ~300–500 KB automatically, without visible quality loss.</p>
                <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
              </div>

              {items.some((it) => it.kind === "file") && (
                <div className="scan-row">
                  <p>📄 Photo has the car’s details (RC / spec card)? Read them automatically and auto-fill the form.</p>
                  <button type="button" className="btn btn-scan" onClick={scan} disabled={scanning}>
                    {scanning ? <span className="spin" /> : null}
                    {scanning ? "Reading photo…" : "Scan & auto-fill"}
                  </button>
                </div>
              )}

              {items.length > 0 && (
                <>
                  <p className="prev-hint">Drag any photo to change its position · use ⟳ to rotate · ✕ to remove</p>
                  <div className="previews">
                    {items.map((it, idx) => (
                      <div
                        key={it.id}
                        className={`prev ${dragId === it.id ? "dragging" : ""}`}
                        draggable
                        onDragStart={() => setDragId(it.id)}
                        onDragEnd={() => setDragId(null)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => dropOn(it.id)}
                      >
                        <img src={it.url} alt="" />
                        {idx === 0 && <span className="cover-tag">COVER</span>}
                        <button type="button" className="rot" title="Rotate" onClick={() => rotateItem(it.id)}>{rotIcon}</button>
                        <button type="button" className="rm" title="Remove" onClick={() => removeItem(it.id)}>✕</button>
                        {it.kind === "file" && it.file && <span className="sz">{kb(it.file.size)} → auto</span>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="m-acts" style={{ marginTop: 24 }}>
            <button className="btn btn-brass" disabled={saving}>
              {saving ? <span className="spin" /> : null}
              {saving ? "Saving…" : editing ? "Save changes" : "Post car"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
