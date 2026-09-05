"use client";
import { useEffect, useState, useCallback } from "react";
import { rupee, lakh } from "@/lib/api";

export default function CarView({ car, onClose, onEdit }) {
  const imgs = car?.images || [];
  const [lb, setLb] = useState(null); // lightbox index or null

  const nextLb = useCallback(() => setLb((i) => (i + 1) % imgs.length), [imgs.length]);
  const prevLb = useCallback(() => setLb((i) => (i - 1 + imgs.length) % imgs.length), [imgs.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { lb !== null ? setLb(null) : onClose(); }
      if (lb !== null && e.key === "ArrowRight") nextLb();
      if (lb !== null && e.key === "ArrowLeft") prevLb();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [lb, onClose, nextLb, prevLb]);

  if (!car) return null;
  const specs = [
    ["Model Year", car.year],
    ["KM Driven", `${Number(car.km).toLocaleString("en-IN")} km`],
    ["Fuel", car.fuel],
    ["Transmission", car.transmission],
    ["Ownership", car.owner],
    ["Registration", car.reg || "—"],
    ["Colour", car.colour || "—"],
    ["Seating", car.seats],
    ["Status", car.status === "sold" ? "Sold" : "Available"],
    ["Tag", car.badge || "—"],
  ];

  return (
    <div className="ov" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="mx" onClick={onClose} aria-label="Close">✕</button>

        {imgs[0] && (
          <div className="m-stage">
            <img src={imgs[0]} alt={car.name} style={{ cursor: "zoom-in" }} onClick={() => setLb(0)} />
            <span className="m-counter">Tap photo to enlarge</span>
          </div>
        )}

        <div className="m-body">
          <div className="m-top">
            <div>
              <div className="eyebrow" style={{ marginBottom: 10 }}>{car.brand} · {car.model || car.name}</div>
              <h2>{car.name}</h2>
            </div>
            <div className="m-price">{rupee(car.price)}
              <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: ".16em", marginTop: 6 }}>≈ {lakh(car.price)}</div>
            </div>
          </div>

          <dl className="m-specs">
            {specs.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
          </dl>

          {car.desc && <p className="m-desc">{car.desc}</p>}

          {imgs.length > 0 && (
            <>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Photos ({imgs.length}) — tap to enlarge</div>
              <div className="view-grid">
                {imgs.map((src, i) => (
                  <button key={i} type="button" className="view-thumb" onClick={() => setLb(i)}>
                    <img src={src} alt={`${car.name} ${i + 1}`} />
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="m-acts" style={{ marginTop: 22 }}>
            {onEdit && <button className="btn btn-brass" onClick={() => { onClose(); onEdit(car); }}>Edit this car</button>}
            <button className="btn btn-ghost" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>

      {/* Fullscreen photo lightbox */}
      {lb !== null && (
        <div className="lightbox" onClick={(e) => e.target === e.currentTarget && setLb(null)}>
          <button className="lb-close" onClick={() => setLb(null)} aria-label="Close photo">✕</button>
          {imgs.length > 1 && <button className="lb-arrow lb-prev" onClick={prevLb} aria-label="Previous">‹</button>}
          <img className="lb-img" src={imgs[lb]} alt={`${car.name} ${lb + 1}`} />
          {imgs.length > 1 && <button className="lb-arrow lb-next" onClick={nextLb} aria-label="Next">›</button>}
          <span className="lb-counter">{lb + 1} / {imgs.length}</span>
        </div>
      )}
    </div>
  );
}
