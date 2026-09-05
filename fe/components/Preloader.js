"use client";
import { useEffect, useState } from "react";

// Same logo + loading animation as the original demo, reused site-wide.
export default function Preloader({ onDone }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const min = 1400;
    const t0 = performance.now();
    const finish = () => { setDone(true); onDone && onDone(); };
    const reveal = () => setTimeout(finish, Math.max(0, min - (performance.now() - t0)));
    if (document.readyState === "complete") reveal();
    else window.addEventListener("load", reveal);
    const safety = setTimeout(finish, 5000);
    return () => clearTimeout(safety);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`pre ${done ? "done" : ""}`} aria-hidden="true">
      <div style={{ textAlign: "center" }}>
        <div className="pre-logo">
          <img src="/logo.png" alt="Sri Annamayya Cars" />
          <span className="sheen" />
        </div>
        <div className="pre-bar">
          <i />
        </div>
      </div>
    </div>
  );
}
