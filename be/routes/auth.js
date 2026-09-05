import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

// POST /api/auth/login  { password }  ->  { token }
router.post("/login", (req, res) => {
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: "Password is required" });

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  const token = jwt.sign({ role: "owner" }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

// GET /api/auth/check — lets the admin app confirm a saved token is still valid
router.get("/check", (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ ok: true });
  } catch {
    res.status(401).json({ ok: false });
  }
});

export default router;
