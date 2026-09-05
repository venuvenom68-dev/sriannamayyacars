// Empty = same origin (proxied to backend). Works on localhost, phone, or tunnel.
export const API = process.env.NEXT_PUBLIC_API_URL || "";
export const PHONE = process.env.NEXT_PUBLIC_PHONE || "919441775216";
export const PHONE_DISPLAY = process.env.NEXT_PUBLIC_PHONE_DISPLAY || "94417 75216";

export const rupee = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
export const lakh = (n) => (Number(n || 0) / 100000).toFixed(2).replace(/\.00$/, "") + " L";
export const waLink = (msg) => `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;

// ── Public ──────────────────────────────────────────────────────────
export async function getCars(params = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  const res = await fetch(`${API}/api/cars${qs ? "?" + qs : ""}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load cars");
  return res.json();
}

// ── Admin (token required) ──────────────────────────────────────────
const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

export async function login(password) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data.token;
}

export async function checkToken(token) {
  if (!token) return false;
  const res = await fetch(`${API}/api/auth/check`, { headers: authHeader(token) });
  return res.ok;
}

export async function getAdminCars(token, params = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  const res = await fetch(`${API}/api/cars/admin${qs ? "?" + qs : ""}`, {
    headers: authHeader(token),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Could not load cars");
  return res.json();
}

export async function scanImages(token, files) {
  const fd = new FormData();
  files.forEach((f) => fd.append("images", f));
  const res = await fetch(`${API}/api/cars/scan`, {
    method: "POST",
    headers: authHeader(token),
    body: fd,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not scan the photos");
  return data; // { fields, matched }
}

export async function createCar(token, formData) {
  const res = await fetch(`${API}/api/cars`, {
    method: "POST",
    headers: authHeader(token),
    body: formData, // multipart, browser sets the boundary
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not save car");
  return data;
}

export async function updateCar(token, id, formData) {
  const res = await fetch(`${API}/api/cars/${id}`, {
    method: "PATCH",
    headers: authHeader(token),
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not update car");
  return data;
}

export async function deleteCar(token, id) {
  const res = await fetch(`${API}/api/cars/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
  if (!res.ok) throw new Error("Could not delete car");
  return res.json();
}
