/* ══════════════════════════════════════════════════════════════
   Sri Annamayya Cars — standalone data layer
   No backend / no database. Cars live in the browser (localStorage).
   The admin panel (admin.html) writes here; the website (index.html)
   reads from here. Clearing browser data resets to the demo cars.
   ══════════════════════════════════════════════════════════════ */

// ── Contact / brand constants ───────────────────────────────────
const PHONE = "919441775216";
const PHONE_DISPLAY = "94417 75216";

const CAR_BRANDS = [
  "Maruti Suzuki", "Hyundai", "Tata", "Mahindra", "Toyota", "Honda", "Kia",
  "Renault", "Nissan", "Volkswagen", "Skoda", "Ford", "MG", "Jeep", "Citroen",
  "Datsun", "Fiat", "Chevrolet", "Isuzu", "Force",
  "BMW", "Mercedes-Benz", "Audi", "Volvo", "Jaguar", "Land Rover", "Lexus",
  "Mini", "Porsche", "Bentley", "Rolls-Royce", "Maserati", "Ferrari",
  "Lamborghini", "Aston Martin", "Jaguar Land Rover",
  "BYD", "Tesla", "Ola Electric",
  "Other",
];
const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid", "LPG"];
const TRANSMISSIONS = ["Manual", "Automatic", "AMT", "CVT", "DCT"];
const OWNERSHIPS = ["1st Owner", "2nd Owner", "3rd Owner", "4th Owner+"];
const SEATING = ["2 Seater", "4 Seater", "5 Seater", "6 Seater", "7 Seater", "8 Seater"];
const BADGES = ["", "FEATURED", "GOOD CONDITION", "NEW ARRIVAL", "BEST PRICE"];

// ── Formatting helpers ──────────────────────────────────────────
const rupee = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const lakh = (n) => (Number(n || 0) / 100000).toFixed(2).replace(/\.00$/, "") + " L";
const waLink = (msg) => `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;

// ── Demo cars (shown until the owner adds real ones) ────────────
// Photos reuse the bundled shop/hero images as stand-ins.
const DEMO_IMAGES = ["assets/hero.jpg", "assets/bg.jpg", "assets/shop1.jpg", "assets/shop2.jpg"];
const DEMO_CARS = [
  {
    _id: "demo1", name: "Hyundai Creta SX (O)", brand: "Hyundai", model: "Creta 1.5 SX",
    year: 2021, price: 1275000, km: 38000, fuel: "Diesel", transmission: "Automatic",
    owner: "1st Owner", reg: "AP 04 CX 4412", colour: "Phantom Black", seats: "5 Seater",
    badge: "FEATURED", status: "available",
    desc: "Single owner, full service history, sunroof, all tyres new, insurance valid till 2026.",
    images: ["assets/hero.jpg", "assets/bg.jpg"], createdAt: "2024-09-01T10:00:00Z",
  },
  {
    _id: "demo2", name: "Maruti Suzuki Swift VXi", brand: "Maruti Suzuki", model: "Swift VXi",
    year: 2019, price: 585000, km: 52000, fuel: "Petrol", transmission: "Manual",
    owner: "1st Owner", reg: "AP 03 BB 1180", colour: "Pearl White", seats: "5 Seater",
    badge: "BEST PRICE", status: "available",
    desc: "Well maintained, smooth engine, papers clear. Ideal first car.",
    images: ["assets/bg.jpg"], createdAt: "2024-08-20T10:00:00Z",
  },
  {
    _id: "demo3", name: "Mahindra Scorpio-N Z8L", brand: "Mahindra", model: "Scorpio-N Z8L",
    year: 2022, price: 1895000, km: 29000, fuel: "Diesel", transmission: "Automatic",
    owner: "1st Owner", reg: "AP 39 TC 9007", colour: "Dazzling Silver", seats: "7 Seater",
    badge: "GOOD CONDITION", status: "available",
    desc: "Top variant, 4WD, showroom condition, extended warranty available.",
    images: ["assets/shop1.jpg", "assets/hero.jpg"], createdAt: "2024-08-10T10:00:00Z",
  },
  {
    _id: "demo4", name: "Tata Nexon XZ+ Dark", brand: "Tata", model: "Nexon XZ+",
    year: 2020, price: 895000, km: 44000, fuel: "Petrol", transmission: "Manual",
    owner: "2nd Owner", reg: "AP 07 DD 2231", colour: "Atlas Black", seats: "5 Seater",
    badge: "", status: "available",
    desc: "5-star safety, well kept interiors, new battery, ready to drive home.",
    images: ["assets/shop2.jpg"], createdAt: "2024-07-28T10:00:00Z",
  },
  {
    _id: "demo5", name: "Honda City ZX CVT", brand: "Honda", model: "City ZX",
    year: 2018, price: 785000, km: 61000, fuel: "Petrol", transmission: "CVT",
    owner: "2nd Owner", reg: "AP 02 EF 5540", colour: "Modern Steel", seats: "5 Seater",
    badge: "", status: "sold",
    desc: "Premium sedan, sunroof, leather seats, city-driven only.",
    images: ["assets/hero.jpg"], createdAt: "2024-07-15T10:00:00Z",
  },
  {
    _id: "demo6", name: "Kia Seltos HTX", brand: "Kia", model: "Seltos HTX",
    year: 2021, price: 1345000, km: 34000, fuel: "Diesel", transmission: "Automatic",
    owner: "1st Owner", reg: "AP 04 GH 7789", colour: "Gravity Grey", seats: "5 Seater",
    badge: "NEW ARRIVAL", status: "available",
    desc: "Loaded variant, ventilated seats, Bose sound, immaculate condition.",
    images: ["assets/bg.jpg", "assets/shop1.jpg"], createdAt: "2024-09-05T10:00:00Z",
  },
];

// ── LocalStorage-backed store ───────────────────────────────────
const STORE_KEY = "sac_cars_v1";

function seedIfEmpty() {
  if (!localStorage.getItem(STORE_KEY)) {
    localStorage.setItem(STORE_KEY, JSON.stringify(DEMO_CARS));
  }
}
function readAll() {
  seedIfEmpty();
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
  catch { return []; }
}
function writeAll(cars) { localStorage.setItem(STORE_KEY, JSON.stringify(cars)); }

const Store = {
  // Public: only available cars, newest first
  getPublicCars() {
    return readAll()
      .filter((c) => c.status === "available")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  // Admin: every car
  getAllCars() {
    return readAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  getCar(id) { return readAll().find((c) => c._id === id) || null; },
  addCar(data) {
    const cars = readAll();
    const car = { ...data, _id: "c-" + Date.now(), createdAt: new Date().toISOString() };
    cars.push(car);
    writeAll(cars);
    return car;
  },
  updateCar(id, patch) {
    const cars = readAll();
    const i = cars.findIndex((c) => c._id === id);
    if (i < 0) return null;
    cars[i] = { ...cars[i], ...patch };
    writeAll(cars);
    return cars[i];
  },
  deleteCar(id) { writeAll(readAll().filter((c) => c._id !== id)); },
  resetDemo() { localStorage.removeItem(STORE_KEY); seedIfEmpty(); },
};

// ── Simple admin auth (browser only) ────────────────────────────
// Not real security — everything is client-side in a standalone demo.
const ADMIN_PASSWORD = "annamayya2024";
const ADMIN_KEY = "sac_admin_ok";
