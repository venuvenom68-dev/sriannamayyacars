import { Router } from "express";
import Car from "../models/Car.js";
import { requireAuth } from "../middleware/auth.js";
import { upload, compressAndSave, deleteImageByUrl } from "../utils/images.js";
import { scanImage } from "../utils/scan.js";

const router = Router();

// POST /api/cars/scan — owner uploads photo(s) that contain the car's details;
// OCR reads them and returns suggested field values to auto-fill the form.
router.post("/scan", requireAuth, upload.array("images", 6), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ error: "No image provided" });
    const merged = {};
    for (const f of req.files) {
      const { fields } = await scanImage(f.buffer);
      for (const [k, v] of Object.entries(fields)) if (merged[k] === undefined) merged[k] = v;
    }
    res.json({ fields: merged, matched: Object.keys(merged).length });
  } catch (err) {
    res.status(500).json({ error: "Could not read the photo: " + err.message });
  }
});

const publicBase = () => process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`;

// Build a Mongo filter from query params (shared by public + admin listing)
function buildFilter(q, includeSold) {
  const filter = {};
  if (!includeSold) filter.status = "available";
  if (q.brand) filter.brand = q.brand;
  if (q.fuel) filter.fuel = q.fuel;
  if (q.search) {
    const rx = new RegExp(q.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { brand: rx }, { model: rx }, { reg: rx }, { colour: rx }];
  }
  return filter;
}

// GET /api/cars  — public: available cars only, supports ?search= &brand= &fuel=
router.get("/", async (req, res) => {
  const cars = await Car.find(buildFilter(req.query, false)).sort({ createdAt: -1 });
  res.json(cars);
});

// GET /api/cars/admin — owner: every car (incl. sold). Protected.
router.get("/admin", requireAuth, async (req, res) => {
  const cars = await Car.find(buildFilter(req.query, true)).sort({ createdAt: -1 });
  res.json(cars);
});

// GET /api/cars/brands — distinct brands currently in stock (for filters)
router.get("/brands", async (_req, res) => {
  const brands = await Car.distinct("brand", { status: "available" });
  res.json(brands.sort());
});

// GET /api/cars/:id — single car
router.get("/:id", async (req, res) => {
  const car = await Car.findById(req.params.id).catch(() => null);
  if (!car) return res.status(404).json({ error: "Car not found" });
  res.json(car);
});

// POST /api/cars — owner posts a new car with photos (multipart/form-data)
router.post("/", requireAuth, upload.array("images", 12), async (req, res) => {
  try {
    const b = req.body;
    if (!b.name || !b.brand || !b.year || !b.price) {
      return res.status(400).json({ error: "Name, brand, year and price are required" });
    }
    const images = [];
    for (const f of req.files || []) {
      images.push(await compressAndSave(f.buffer));
    }
    const car = await Car.create({
      name: b.name,
      brand: b.brand,
      model: b.model,
      year: Number(b.year),
      price: Number(b.price),
      km: Number(b.km) || 0,
      fuel: b.fuel,
      transmission: b.transmission,
      owner: b.owner,
      reg: b.reg,
      colour: b.colour,
      seats: b.seats,
      desc: b.desc,
      badge: b.badge || "",
      images,
    });
    res.status(201).json(car);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/cars/:id — owner edits fields, adds photos, toggles status
router.patch("/:id", requireAuth, upload.array("images", 12), async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ error: "Car not found" });

    const b = req.body;
    const fields = ["name","brand","model","fuel","transmission","owner","reg","colour","seats","desc","badge","status"];
    for (const f of fields) if (b[f] !== undefined) car[f] = b[f];
    for (const n of ["year","price","km"]) if (b[n] !== undefined) car[n] = Number(b[n]);

    // Compress any newly uploaded photos (kept in received order)
    const newUrls = [];
    for (const f of req.files || []) {
      newUrls.push(await compressAndSave(f.buffer));
    }

    if (b.imageOrder !== undefined) {
      // Full ordering: array of existing URLs and "__new__<k>" placeholders
      let order = [];
      try { order = JSON.parse(b.imageOrder); } catch { order = []; }
      const oldSet = new Set(car.images);
      const final = [];
      for (const tok of order) {
        if (typeof tok === "string" && tok.startsWith("__new__")) {
          const idx = Number(tok.slice("__new__".length));
          if (newUrls[idx]) final.push(newUrls[idx]);
        } else if (oldSet.has(tok) && !final.includes(tok)) {
          final.push(tok);
        }
      }
      // safety: append any uploaded photo not referenced in the order
      newUrls.forEach((u) => { if (!final.includes(u)) final.push(u); });
      // delete files for old images no longer used
      car.images.filter((u) => !final.includes(u)).forEach(deleteImageByUrl);
      car.images = final;
    } else {
      // Legacy: explicit removals + append new photos
      if (b.removeImages) {
        const remove = JSON.parse(b.removeImages);
        remove.forEach(deleteImageByUrl);
        car.images = car.images.filter((u) => !remove.includes(u));
      }
      car.images.push(...newUrls);
    }
    await car.save();
    res.json(car);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/cars/:id — owner removes a car (and its image files)
router.delete("/:id", requireAuth, async (req, res) => {
  const car = await Car.findById(req.params.id);
  if (!car) return res.status(404).json({ error: "Car not found" });
  car.images.forEach(deleteImageByUrl);
  await car.deleteOne();
  res.json({ ok: true });
});

export default router;
