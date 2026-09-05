"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { rupee, lakh, waLink, PHONE } from "@/lib/api";

const chevL = (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
);
const chevR = (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
);

export default function CarModal({ car, onClose }) {
  const imgs = car?.images || [];
  const [active, setActive] = useState(0);
  const [lb, setLb] = useState(null); // fullscreen lightbox index or null
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const next = useCallback(() => setActive((i) => (i + 1) % imgs.length), [imgs.length]);
  const prev = useCallback(() => setActive((i) => (i - 1 + imgs.length) % imgs.length), [imgs.length]);
  const lbNext = useCallback(() => setLb((i) => (i + 1) % imgs.length), [imgs.length]);
  const lbPrev = useCallback(() => setLb((i) => (i - 1 + imgs.length) % imgs.length), [imgs.length]);

  // Phone Back button closes the car view (returns to the listing) instead of
  // leaving the website. We push a history entry and close on popstate.
  useEffect(() => {
    window.history.pushState({ sacCar: 1 }, "");
    const onPop = () => onCloseRef.current();
    window.addEventListener("popstate", onPop);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("popstate", onPop);
      document.body.style.overflow = "";
    };
  }, []);
  const requestClose = () => window.history.back(); // → popstate → onClose

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") { lb !== null ? setLb(null) : requestClose(); }
      else if (e.key === "ArrowRight") { lb !== null ? lbNext() : next(); }
      else if (e.key === "ArrowLeft") { lb !== null ? lbPrev() : prev(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lb, next, prev, lbNext, lbPrev]);

  if (!car) return null;
  const msg = `Hi Sri Annamayya Cars, I'm interested in the ${car.name} (${car.year}) listed at ${rupee(car.price)}. Is it still available?`;
  const specs = [
    ["Model Year", car.year],
    ["KM Driven", `${Number(car.km).toLocaleString("en-IN")} km`],
    ["Fuel", car.fuel],
    ["Transmission", car.transmission],
    ["Ownership", car.owner],
    ["Registration", car.reg || "—"],
    ["Colour", car.colour || "—"],
    ["Seating", car.seats],
  ];

  return (
    <>
      <div className="ov" onClick={(e) => e.target === e.currentTarget && requestClose()}>
        <div className="modal">
          <button className="mx" onClick={requestClose} aria-label="Close">✕</button>

          {/* Big photo stage — tap to zoom */}
          <div className="m-stage">
            {imgs.length ? (
              <>
                <img
                  src={imgs[active]}
                  alt={`${car.name} — photo ${active + 1}`}
                  style={{ cursor: "zoom-in" }}
                  onClick={() => setLb(active)}
                />
                {imgs.length > 1 && (
                  <>
                    <button className="m-arrow m-prev" onClick={prev} aria-label="Previous photo">{chevL}</button>
                    <button className="m-arrow m-next" onClick={next} aria-label="Next photo">{chevR}</button>
                    <span className="m-counter">{active + 1} / {imgs.length} · tap to zoom</span>
                  </>
                )}
              </>
            ) : (
              <div className="noimg" style={{ display: "grid", placeItems: "center", height: "100%", color: "#8b7d64" }}>No photo</div>
            )}
          </div>

          {/* Thumbnail strip — all images */}
          {imgs.length > 1 && (
            <div className="thumbs">
              {imgs.map((src, i) => (
                <button key={i} className={i === active ? "on" : ""} onClick={() => setActive(i)}>
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}

          <div className="m-body">
            <div className="m-top">
              <div>
                <div className="eyebrow" style={{ marginBottom: 10 }}>
                  {car.brand} · {car.status === "sold" ? "Sold" : "Available"}
                </div>
                <h2>{car.name}</h2>
              </div>
              <div className="m-price">
                {rupee(car.price)}
                <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: ".16em", marginTop: 6 }}>
                  ≈ {lakh(car.price)}
                </div>
              </div>
            </div>
            <dl className="m-specs">
              {specs.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            {car.desc && <p className="m-desc">{car.desc}</p>}
            <div className="m-acts">
              <a className="btn btn-brass" href={`tel:+${PHONE}`}>Call Now</a>
              <a className="btn btn-wa" href={waLink(msg)} target="_blank" rel="noopener">WhatsApp Enquiry</a>
              <button className="btn btn-ghost" onClick={requestClose}>Back to cars</button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen zoom lightbox — top-level so it truly centers */}
      {lb !== null && imgs.length > 0 && (
        <div className="lightbox" onClick={(e) => e.target === e.currentTarget && setLb(null)}>
          <button className="lb-close" onClick={() => setLb(null)} aria-label="Close photo">✕</button>
          {imgs.length > 1 && <button className="lb-arrow lb-prev" onClick={lbPrev} aria-label="Previous">{chevL}</button>}
          <img className="lb-img" src={imgs[lb]} alt={`${car.name} ${lb + 1}`} />
          {imgs.length > 1 && <button className="lb-arrow lb-next" onClick={lbNext} aria-label="Next">{chevR}</button>}
          <span className="lb-counter">{lb + 1} / {imgs.length}</span>
        </div>
      )}
    </>
  );
}
