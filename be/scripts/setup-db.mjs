/**
 * One-time DB setup for Sri Annamayya Cars.
 *
 * Connects to MONGODB_URI, ensures the `annamayyacars` database and the
 * `cars` collection exist, and builds the exact schema indexes (incl. the
 * search text index) defined in models/Car.js — pin-to-pin with the app.
 *
 * Usage:
 *   MONGODB_URI="mongodb://user:pass@host:port/annamayyacars?directConnection=true" \
 *   node scripts/setup-db.mjs
 *
 * Safe to re-run: it creates only what's missing and never drops data.
 */
import mongoose from "mongoose";
import Car from "../models/Car.js";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("❌ MONGODB_URI is not set.");
  process.exit(1);
}

async function main() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  const { host, port, name } = mongoose.connection;
  console.log(`✅ Connected → ${host}:${port}/${name}`);

  // MongoDB is lazy: collections appear on first write. Create it explicitly so
  // the database + collection show up immediately, even before any car is added.
  const existing = await mongoose.connection.db
    .listCollections({ name: "cars" })
    .toArray();
  if (existing.length === 0) {
    await mongoose.connection.db.createCollection("cars");
    console.log("✅ Created collection: cars");
  } else {
    console.log("• Collection already exists: cars");
  }

  // Build every index declared on the schema (incl. the text search index).
  await Car.syncIndexes();
  console.log("✅ Indexes synced from schema");

  // Report the final state so you can eyeball it.
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("\nCollections in", name + ":");
  collections.forEach((c) => console.log("  -", c.name));

  const indexes = await Car.collection.indexes();
  console.log("\nIndexes on cars:");
  indexes.forEach((i) => console.log("  -", i.name, JSON.stringify(i.key)));

  const count = await Car.estimatedDocumentCount();
  console.log(`\nCurrent car count: ${count}`);

  await mongoose.disconnect();
  console.log("\n✅ Done. Database is ready for deploys.");
}

main().catch((err) => {
  console.error("❌ Setup failed:", err.message);
  process.exit(1);
});
