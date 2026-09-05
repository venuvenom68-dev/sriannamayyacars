"use client";
import { useEffect } from "react";

const waGlyph = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 2a10 10 0 0 0-8.7 15L2 22l5.2-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.6 0a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2l.1-.4a.5.5 0 0 0 0-.4L9.4 7c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4 5.3 5.3 0 0 0 3.2.6 2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2z" />
  </svg>
);

export default function WaChooser({ contacts, message, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const waTo = (num) => `https://wa.me/${num}?text=${encodeURIComponent(message)}`;

  return (
    <div className="ov" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="wa-modal">
        <button className="mx" onClick={onClose} aria-label="Close">✕</button>
        <div className="wa-head">
          <div className="wa-badge">{waGlyph}</div>
          <h3>Chat with us on WhatsApp</h3>
          <p>Choose who you’d like to message</p>
        </div>
        <div className="wa-list">
          {contacts.map((c, i) => (
            <a
              className="wa-person"
              key={c.num}
              href={waTo(c.num)}
              target="_blank"
              rel="noopener"
              onClick={onClose}
              style={{ animationDelay: `${0.06 + i * 0.07}s` }}
            >
              <span className="wa-av">{c.name[0]}</span>
              <span className="wa-who"><b>{c.name}</b><span>{c.show}</span></span>
              <span className="wa-go">{waGlyph}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
