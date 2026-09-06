"use client";
import { useEffect, useState, useCallback } from "react";
import Preloader from "@/components/Preloader";
import CarForm from "@/components/admin/CarForm";
import CarView from "@/components/admin/CarView";
import { login, checkToken, getAdminCars, deleteCar, updateCar, rupee } from "@/lib/api";

const KEY = "sac_admin_token";
// Admin lives on the same website now (/admin), so the public site is just "/".
const siteUrl = () => "/";

export default function Admin() {
  const [token, setToken] = useState(null);
  const [booting, setBooting] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);

  const toast = useCallback((msg, err = false) => {
    setToastMsg({ msg, err });
    setTimeout(() => setToastMsg(null), 3200);
  }, []);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    checkToken(saved).then((ok) => {
      if (ok) setToken(saved);
      setBooting(false);
    });
  }, []);

  const onLogin = (t) => { localStorage.setItem(KEY, t); setToken(t); };
  const logout = () => { localStorage.removeItem(KEY); setToken(null); };

  return (
    <>
      <Preloader />
      {!booting && !token && <Login onLogin={onLogin} toast={toast} />}
      {!booting && token && <Dashboard token={token} logout={logout} toast={toast} />}
      {toastMsg && <div className={`toast ${toastMsg.err ? "err" : ""}`}>{toastMsg.msg}</div>}
    </>
  );
}

/* ─── Login ──────────────────────────────────────────── */
function Login({ onLogin, toast }) {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      onLogin(await login(pw));
    } catch (err) {
      toast(err.message, true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="login-card" onSubmit={submit}>
        <img src="/logo.png" alt="Sri Annamayya Cars" />
        <h1>Owner Dashboard</h1>
        <p>Enter your password to manage your cars.</p>
        <div className="field">
          <label>Password</label>
          <input className="input" type="password" placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
        </div>
        <button className="btn btn-brass btn-block" disabled={busy}>
          {busy ? <span className="spin" /> : null}{busy ? "Checking…" : "Enter Dashboard"}
        </button>
        <a href={siteUrl()} style={{ display: "inline-block", marginTop: 18, color: "var(--mute)", fontSize: 12 }}>← Back to website</a>
      </form>
    </div>
  );
}

/* ─── Dashboard ──────────────────────────────────────── */
function Dashboard({ token, logout, toast }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(null); // null | {} (new) | car (edit)
  const [viewing, setViewing] = useState(null); // car being viewed

  const load = useCallback(() => {
    setLoading(true);
    getAdminCars(token)
      .then(setCars)
      .catch((e) => toast(e.message, true))
      .finally(() => setLoading(false));
  }, [token, toast]);

  useEffect(() => { load(); }, [load]);

  const shown = cars.filter((c) => {
    const q = search.trim().toLowerCase();
    return !q || `${c.name} ${c.brand} ${c.model} ${c.reg} ${c.colour}`.toLowerCase().includes(q);
  });

  const available = cars.filter((c) => c.status === "available").length;
  const sold = cars.filter((c) => c.status === "sold").length;

  const remove = async (car) => {
    if (!confirm(`Delete "${car.name}"? This cannot be undone.`)) return;
    try { await deleteCar(token, car._id); toast("Car deleted"); load(); }
    catch (e) { toast(e.message, true); }
  };

  const toggleSold = async (car) => {
    try {
      const fd = new FormData();
      fd.append("status", car.status === "sold" ? "available" : "sold");
      await updateCar(token, car._id, fd);
      toast(car.status === "sold" ? "Marked as available" : "Marked as sold");
      load();
    } catch (e) { toast(e.message, true); }
  };

  return (
    <div className="admin-shell">
      <header className="admin-hd">
        <div className="wrap">
          <img src="/logo.png" alt="Sri Annamayya Cars" />
          <span className="tag">Owner</span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <a className="btn btn-line" href={siteUrl()}>View website</a>
            <button className="btn btn-ghost" onClick={logout}>Log out</button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="wrap">
          <div className="eyebrow">Your inventory</div>
          <h1 className="serif" style={{ fontSize: 38, marginBottom: 20 }}>Manage your cars</h1>

          <div className="stat-row">
            <div className="chip"><b>{cars.length}</b><span>Total cars</span></div>
            <div className="chip"><b>{available}</b><span>Available</span></div>
            <div className="chip"><b>{sold}</b><span>Sold</span></div>
          </div>

          <div className="admin-bar">
            <div className="search">
              <svg viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
              <input className="input" placeholder="Search your cars by name, brand, reg no…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button className="btn btn-brass" onClick={() => setForm({})}>+ Add Car</button>
          </div>

          {loading && <div className="empty"><h3>Loading your cars…</h3></div>}

          {!loading && cars.length === 0 && (
            <div className="empty">
              <h3>No cars yet</h3>
              <p>Your website has no cars listed. Upload your first car to get started — it’ll appear on the website instantly.</p>
              <button className="btn btn-brass" onClick={() => setForm({})}>+ Upload your first car</button>
            </div>
          )}

          {!loading && cars.length > 0 && shown.length === 0 && (
            <div className="empty"><h3>No matches</h3><p>No cars match “{search}”.</p></div>
          )}

          {!loading && shown.length > 0 && (
            <div className="admin-grid">
              {shown.map((c) => (
                <div className="a-card" key={c._id} onClick={() => setViewing(c)} style={{ cursor: "pointer" }}>
                  <div className="a-shot">
                    {c.status === "sold" && <span className="badge b-sold" style={{ position: "absolute", top: 10, left: 10 }}>SOLD</span>}
                    {c.images?.length > 1 && (
                      <span className="img-count" style={{ position: "absolute", top: 10, right: 10 }}>
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 15l5-5 4 4 3-3 6 6" /></svg>
                        {c.images.length}
                      </span>
                    )}
                    {c.images?.[0] ? <img src={c.images[0]} alt={c.name} /> : <div className="noimg">No photo</div>}
                  </div>
                  <div className="a-body">
                    <div className="sub">{c.brand} · {c.year} · {c.reg || "no reg"}</div>
                    <h4>{c.name}</h4>
                    <div className="a-price">{rupee(c.price)}</div>
                    <div className="pills" style={{ marginTop: 10 }}>
                      <span className="pill">{Number(c.km).toLocaleString("en-IN")} km</span>
                      <span className="pill">{c.fuel}</span>
                      <span className="pill">{c.images?.length || 0} photo{c.images?.length === 1 ? "" : "s"}</span>
                    </div>
                    <div className="a-acts" onClick={(e) => e.stopPropagation()}>
                      <button className="btn btn-line" onClick={() => setForm(c)}>Edit</button>
                      <button className="btn btn-line" onClick={() => toggleSold(c)}>{c.status === "sold" ? "Un-sell" : "Sold"}</button>
                      <button className="btn btn-danger" onClick={() => remove(c)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {viewing && (
        <CarView
          car={viewing}
          onClose={() => setViewing(null)}
          onEdit={(c) => setForm(c)}
        />
      )}

      {form !== null && (
        <CarForm
          token={token}
          car={form._id ? form : null}
          onClose={() => setForm(null)}
          onSaved={() => { setForm(null); load(); }}
          toast={toast}
        />
      )}
    </div>
  );
}
