"use client";
import { useRef, useState } from "react";
import { createCar, updateCar, scanImages } from "@/lib/api";
import { CAR_BRANDS, FUEL_TYPES, TRANSMISSIONS, OWNERSHIPS, SEATING, BADGES } from "@/lib/brands";

const empty = {
  name: "", brand: "", model: "", year: "", price: "", km: "",
  fuel: "Petrol", transmission: "Manual", owner: "1st Owner",
  reg: "", colour: "", seats: "5 Seater", badge: "", desc: "",
};

export default function CarForm({ token, car, onClose, onSaved, toast }) {
  const editing = !!car;
  const [f, setF] = useState(editing ? { ...empty, ...car } : empty);
  const [newFiles, setNewFiles] = useState([]); // {file, url}
  const [existing, setExisting] = useState(car?.images || []); // urls kept
  const [removed, setRemoved] = useState([]); // urls removed
  const [over, setOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef();

  const scan = async () => {
    if (!newFiles.length) return toast("Add a photo first, then scan", true);
    setScanning(true);
    try {
      const { fields, matched } = await scanImages(token, newFiles.map((n) => n.file));
      if (!matched) return toast("Couldn't read details from the photo — please fill manually", true);
      // Only fill fields the OCR found, leave the rest as-is
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

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const addFiles = (list) => {
    const imgs = Array.from(list).filter((x) => x.type.startsWith("image/"));
    setNewFiles((p) => [...p, ...imgs.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
  };
  const onDrop = (e) => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); };

  const kb = (b) => (b > 1024 * 1024 ? (b / 1024 / 1024).toFixed(1) + " MB" : Math.round(b / 1024) + " KB");

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name || !f.brand || !f.year || !f.price) return toast("Name, brand, year and price are required", true);
    setSaving(true);
    try {
      const fd = new FormData();
      ["name","brand","model","year","price","km","fuel","transmission","owner","reg","colour","seats","badge","desc"]
        .forEach((k) => fd.append(k, f[k] ?? ""));
      newFiles.forEach(({ file }) => fd.append("images", file));
      if (editing && removed.length) fd.append("removeImages", JSON.stringify(removed));

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
              <label>Photos — auto-compressed on upload (quality kept)</label>
              <div
                className={`drop ${over ? "over" : ""}`}
                onClick={() => inputRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setOver(true); }}
                onDragLeave={() => setOver(false)}
                onDrop={onDrop}
              >
                <h4>Drag photos here, or click to choose</h4>
                <p>Big 5 MB phone photos are fine — they’re compressed to ~300–500 KB automatically, without visible quality loss.</p>
                <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => addFiles(e.target.files)} />
              </div>

              {newFiles.length > 0 && (
                <div className="scan-row">
                  <p>📄 Photo has the car’s details (RC / spec card)? Read them automatically and auto-fill the form.</p>
                  <button type="button" className="btn btn-scan" onClick={scan} disabled={scanning}>
                    {scanning ? <span className="spin" /> : null}
                    {scanning ? "Reading photo…" : "Scan & auto-fill"}
                  </button>
                </div>
              )}

              {(existing.length > 0 || newFiles.length > 0) && (
                <div className="previews">
                  {existing.map((url) => (
                    <div className="prev" key={url}>
                      <img src={url} alt="" />
                      <button type="button" title="Remove" onClick={() => { setExisting(existing.filter((u) => u !== url)); setRemoved([...removed, url]); }}>✕</button>
                    </div>
                  ))}
                  {newFiles.map((nf, i) => (
                    <div className="prev" key={i}>
                      <img src={nf.url} alt="" />
                      <button type="button" title="Remove" onClick={() => setNewFiles(newFiles.filter((_, j) => j !== i))}>✕</button>
                      <span className="sz">{kb(nf.file.size)} → auto</span>
                    </div>
                  ))}
                </div>
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
