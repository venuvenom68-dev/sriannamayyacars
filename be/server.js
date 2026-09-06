import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db.js";
import Car from "./models/Car.js";
import authRoutes from "./routes/auth.js";
import carRoutes from "./routes/cars.js";
import { UPLOAD_DIR } from "./utils/images.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// CORS — only allow our own website + admin (plus localhost for development).
// Set ALLOWED_ORIGINS in .env to a comma-separated list for production, e.g.
//   ALLOWED_ORIGINS=https://sriannamayyacars.in,https://admin.sriannamayyacars.in
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
// Always allow the frontend URL and local development.
[process.env.FRONTEND_URL, "http://localhost:3000", "http://localhost:4000"]
  .filter(Boolean)
  .forEach((o) => allowedOrigins.includes(o) || allowedOrigins.push(o));

app.use(
  cors({
    origin(origin, cb) {
      // Allow same-origin / server-to-server / curl (no Origin header),
      // and any explicitly allow-listed website.
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`Origin not allowed by CORS: ${origin}`));
    },
  })
);
app.use(express.json({ limit: "2mb" }));

// Serve compressed car photos
app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "7d" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "annamayyacars-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGODB_URI)
  .then(async () => {
    // MongoDB creates collections on first write; this guarantees the schema's
    // indexes (incl. the search text index) exist on a fresh database too.
    await Car.syncIndexes();
    console.log("✅ Car collection + indexes ready");
    app.listen(PORT, () => console.log(`🚗 API running → http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Could not connect to MongoDB:", err.message);
    console.error("   Make sure MongoDB is running, or update MONGODB_URI in be/.env");
    process.exit(1);
  });
