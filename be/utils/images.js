import multer from "multer";
import Jimp from "jimp";
import { nanoid } from "nanoid";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Keep files in memory so we can compress before anything hits the disk.
// Accept up to 12 images, 15 MB each (phones easily produce 5 MB+ shots).
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024, files: 12 },
  fileFilter: (_req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

/**
 * Compress + resize an in-memory image, keeping it visually similar.
 * A ~5 MB phone photo typically comes out a few hundred KB.
 *  - never enlarges, caps the long edge at 1600px (plenty for web)
 *  - quality 82 JPEG = crisp, small
 *  - Jimp auto-applies EXIF orientation on read, so photos aren't sideways
 * Uses jimp (pure JavaScript) so it installs and runs on small shared hosts.
 * Returns a RELATIVE path (/uploads/..); the frontend builds the full URL.
 */
export async function compressAndSave(buffer) {
  const name = `${Date.now()}-${nanoid(8)}.jpg`;
  const outPath = path.join(UPLOAD_DIR, name);

  const image = await Jimp.read(buffer);
  // Only scale down — scaleToFit would otherwise enlarge small images.
  if (image.bitmap.width > 1600 || image.bitmap.height > 1600) {
    image.scaleToFit(1600, 1600);
  }
  image.quality(82);
  await image.writeAsync(outPath);

  return `/uploads/${name}`;
}

// Remove image files from disk when a car is deleted / photo removed.
export function deleteImageByUrl(url) {
  try {
    const file = url.split("/uploads/")[1];
    if (!file) return;
    const p = path.join(UPLOAD_DIR, path.basename(file));
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch {
    /* ignore */
  }
}
