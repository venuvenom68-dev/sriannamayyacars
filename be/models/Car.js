import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Hyundai Creta SX"
    brand: { type: String, required: true, trim: true }, // e.g. "Hyundai"
    model: { type: String, trim: true }, // variant / model line
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    km: { type: Number, default: 0 }, // kilometres driven
    fuel: { type: String, default: "Petrol" }, // Petrol / Diesel / CNG / Electric / Hybrid
    transmission: { type: String, default: "Manual" }, // Manual / Automatic
    owner: { type: String, default: "1st Owner" }, // ownership
    reg: { type: String, trim: true }, // registration number plate
    colour: { type: String, trim: true },
    seats: { type: String, default: "5 Seater" }, // seating
    desc: { type: String, trim: true },
    images: { type: [String], default: [] }, // public image URLs
    badge: { type: String, default: "" }, // FEATURED / GOOD CONDITION / ""
    status: { type: String, enum: ["available", "sold"], default: "available" },
  },
  { timestamps: true }
);

// Text index powers the admin + website search bar
carSchema.index({ name: "text", brand: "text", model: "text", reg: "text", colour: "text" });

export default mongoose.model("Car", carSchema);
