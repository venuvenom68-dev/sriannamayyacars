# Deploying Sri Annamayya Cars on Coolify (separate from gosaath)

Everything below lives in its **own Coolify Project**, so it never touches the
gosaath deployment. Database is **MongoDB Atlas** (cloud). Three apps deploy from
this GitHub repo (`venuvenom68-dev/sriannamayyacars`), each from its own folder.

```
Internet ──► sriannamayyacars.in        → fe    (Next.js public site,  :3000)
             admin.sriannamayyacars.in  → admin (Next.js owner panel,  :4000)
             api.sriannamayyacars.in    → be    (Express API,          :5000)  ──► MongoDB Atlas
                                                  └ /uploads volume (car photos)
```

The two Next apps proxy `/api/*` and `/uploads/*` to the backend (see
`next.config.mjs`), so the browser only ever talks to the site's own domain.

---

## 1. MongoDB Atlas (database)

1. Create a free cluster at https://www.mongodb.com/atlas (region close to your VPS).
2. **Database Access** → add a user (username + strong password).
3. **Network Access** → add IP `0.0.0.0/0` (or just your VPS IP).
4. **Connect → Drivers** → copy the connection string, e.g.
   `mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/annamayyacars?retryWrites=true&w=majority`
   Keep the `/annamayyacars` database name in the path. This is your `MONGODB_URI`.

> **Using a self-hosted / Coolify MongoDB instead of Atlas?**
> The connection string looks like
> `mongodb://root:PASSWORD@HOST:PORT/annamayyacars?directConnection=true&authSource=admin`
> — add the `/annamayyacars` **database name** in the path (so data lands in a
> named DB, not `test`) and, when logging in as the `root` user, keep
> `authSource=admin`. The backend auto-creates the `cars` collection and its
> indexes on first boot (`Car.syncIndexes()`), so nothing needs to be created by
> hand. **Set this only in Coolify's env vars — never commit it to git.**

## 2. DNS (at your domain registrar for sriannamayyacars.in)

Point these at your VPS public IP (`YOUR_VPS_IP`):

| Type  | Name  | Value           |
|-------|-------|-----------------|
| A     | `@`   | `YOUR_VPS_IP`   |
| A     | `www` | `YOUR_VPS_IP`   |
| A     | `admin` | `YOUR_VPS_IP` |
| A     | `api` | `YOUR_VPS_IP`   |

(If your DNS provider requires it, `www` can instead be a CNAME → `sriannamayyacars.in`.)
Wait for DNS to propagate before Coolify can issue SSL certificates.

## 3. Coolify — one new Project, three resources

In Coolify: **+ New → Project**, name it `annamayyacars`. Inside it add three
**Applications**, all from the same GitHub repo, each set to **Build Pack:
Dockerfile**. Coolify issues free Let's Encrypt SSL automatically once DNS is live.

### 3a. Backend (`be`)
- **Repository:** this repo · **Branch:** `main`
- **Base Directory:** `/be` · **Dockerfile Location:** `/be/Dockerfile`
- **Port (Ports Exposes):** `5000`
- **Domain:** `https://api.sriannamayyacars.in`
- **Storages → Add persistent volume** → Mount Path `/app/uploads` (keeps car
  photos across redeploys — **do this before the first deploy**).
- **Environment variables:**
  ```
  MONGODB_URI=<your Atlas connection string>
  PORT=5000
  PUBLIC_URL=https://api.sriannamayyacars.in
  FRONTEND_URL=https://sriannamayyacars.in
  ALLOWED_ORIGINS=https://sriannamayyacars.in,https://www.sriannamayyacars.in,https://admin.sriannamayyacars.in
  ADMIN_PASSWORD=<a strong password>
  JWT_SECRET=<64+ random characters>
  ```
- Deploy. Check `https://api.sriannamayyacars.in/api/health` → `{"ok":true,...}`.

### 3b. Public website (`fe`)
- **Base Directory:** `/fe` · **Dockerfile Location:** `/fe/Dockerfile`
- **Port:** `3000` · **Domains:** `https://sriannamayyacars.in` and `https://www.sriannamayyacars.in`
- **Environment variables:**
  ```
  BACKEND_URL=https://api.sriannamayyacars.in
  NEXT_PUBLIC_PHONE=919441775216
  NEXT_PUBLIC_PHONE_DISPLAY=94417 75216
  NEXT_PUBLIC_ADMIN_URL=https://admin.sriannamayyacars.in
  ```
  (`NEXT_PUBLIC_*` are build-time — in Coolify tick "Build Variable" for
  `NEXT_PUBLIC_PHONE`, `NEXT_PUBLIC_PHONE_DISPLAY` and `NEXT_PUBLIC_ADMIN_URL`.
  The last one powers the discreet **Owner Login** link in the site footer.)
- Deploy.

### 3c. Admin panel (`admin`)
- **Base Directory:** `/admin` · **Dockerfile Location:** `/admin/Dockerfile`
- **Port:** `4000` · **Domain:** `https://admin.sriannamayyacars.in`
- **Environment variables:**
  ```
  BACKEND_URL=https://api.sriannamayyacars.in
  NEXT_PUBLIC_SITE_URL=https://sriannamayyacars.in
  ```
  (`NEXT_PUBLIC_SITE_URL` is a build variable.)
- Deploy.

## 4. Go-live checks
- `https://sriannamayyacars.in` loads the site (cars appear once added).
- `https://admin.sriannamayyacars.in` → log in with `ADMIN_PASSWORD`, add a car,
  upload photos → they appear on the public site.
- All three show the padlock (SSL).

## 5. Show up on Google
- Verify `https://sriannamayyacars.in` in **Google Search Console**
  (https://search.google.com/search-console) via DNS TXT or the HTML tag.
- Submit the homepage / request indexing. Indexing takes a few days.
- Keep the admin panel **out** of Google (it's already unlinked; optionally add a
  `noindex` on the admin app).

## Notes
- Enable **auto-deploy on push** in each Coolify resource so a `git push` redeploys.
- To change the admin password later, edit `ADMIN_PASSWORD` on the `be` resource
  and redeploy it — existing login tokens keep working for 7 days.
- Atlas + the `/app/uploads` volume mean your data and photos survive redeploys.
