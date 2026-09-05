# Sri Annamayya Cars — Production Website + Admin

A premium used-car dealership website with an owner admin panel.

```
annamayyacars/
├── fe/         Next.js public website (customers)      → port 3000
├── admin/      Next.js owner panel (SEPARATE app)       → port 4000
├── be/         Node/Express API — cars, auth, images    → port 5000
└── database/   MongoDB notes + how to view data in Compass
```

## URLs
| Page | URL | Who |
|------|-----|-----|
| **Website** | http://localhost:3000 | Customers |
| **Admin / Owner panel** | http://localhost:4000 | Business owner (separate app) |
| API (backend) | http://localhost:5000 | internal |

The admin is a **separate app**, not linked anywhere from the public website.

**Admin password:** set privately in `be/.env` (`ADMIN_PASSWORD`) — never write it here.

## Where to see the database
Open **MongoDB Compass** → connect to `mongodb://127.0.0.1:27017` →
database **`annamayyacars`** → collection **`cars`**. See `database/README.md`.

---

## How to run (3 services)

### Easiest: double-click `START-HERE.bat`
It launches MongoDB, the backend, and the website, each in its own window.

### Or manually, in 3 terminals:

**1. MongoDB (database server)**
```
"C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "C:\data\db"
```

**2. Backend API** (from `be/`)
```
cd be
npm install      # first time only
npm start        # → http://localhost:5000
```

**3. Frontend website** (from `fe/`)
```
cd fe
npm install      # first time only
npm run dev      # → http://localhost:3000
```

**4. Admin app** (from `admin/`)
```
cd admin
npm install      # first time only
npm run dev      # → http://localhost:4000
```

Open **http://localhost:3000** for the website, **http://localhost:4000** to manage cars.

---

## What the owner can do in /admin
- Log in with the password.
- See all cars; if there are none, it prompts to **upload the first car**.
- **Add a car** with: name, brand (all brands), model, year, price, KM driven,
  fuel, transmission, ownership, registration plate, colour, seating, description.
- **Upload photos** — big 5 MB phone photos are **auto-compressed** to ~300–500 KB
  on the server (no visible quality loss).
- **Search** cars, **edit**, mark **sold/available**, or **delete**.
- Anything posted appears on the public website instantly.

## Going live (hosting online) — later
- Frontend → deploy `fe/` to **Vercel**.
- Backend → deploy `be/` to **Render/Railway** (or a VPS).
- Database → switch `be/.env` `MONGODB_URI` to a **MongoDB Atlas** string.
- Set `PUBLIC_URL`, `FRONTEND_URL`, `NEXT_PUBLIC_API_URL` to the live URLs.
- **Change `ADMIN_PASSWORD` and `JWT_SECRET`.**
