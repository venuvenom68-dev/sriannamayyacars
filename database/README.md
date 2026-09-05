# Database — Sri Annamayya Cars

The site uses **MongoDB**. Right now it runs on the **local MongoDB server** installed
on this laptop; moving to MongoDB Atlas later is a one-line change (see bottom).

## Connection
```
mongodb://127.0.0.1:27017/annamayyacars
```
- **Database name:** `annamayyacars`
- **Collection:** `cars`

## How to view your data (MongoDB Compass)
1. Open **MongoDB Compass**.
2. In the connection box paste: `mongodb://127.0.0.1:27017`
3. Click **Connect**.
4. Open the **`annamayyacars`** database → **`cars`** collection.
5. Every car the owner posts from the admin page appears here as a document.

> Note: Compass only shows data when the MongoDB **server** is running.
> The server lives at `C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe`.

## `cars` document shape
| Field | Type | Meaning |
|-------|------|---------|
| `name` | String | Car title, e.g. "Hyundai Creta SX" |
| `brand` | String | e.g. "Hyundai" |
| `model` | String | Variant / model line |
| `year` | Number | Model year |
| `price` | Number | Price in ₹ |
| `km` | Number | Kilometres driven |
| `fuel` | String | Petrol / Diesel / CNG / Electric / Hybrid |
| `transmission` | String | Manual / Automatic / … |
| `owner` | String | 1st Owner / 2nd Owner / … |
| `reg` | String | Registration number plate |
| `colour` | String | Colour |
| `seats` | String | Seating, e.g. "5 Seater" |
| `desc` | String | Description |
| `images` | [String] | URLs of compressed photos (served by the backend) |
| `badge` | String | FEATURED / GOOD CONDITION / "" |
| `status` | String | `available` or `sold` |
| `createdAt` / `updatedAt` | Date | Auto timestamps |

Photos are **not** stored in the database. They’re compressed by the backend and saved as
files in `be/uploads/`, and only their URLs are kept here (keeps the DB small and fast).

## Switching to MongoDB Atlas (when you host online)
1. Create a free cluster at https://cloud.mongodb.com — name the project **annamayyacars**.
2. Create a database user + allow network access, then copy the connection string
   (`mongodb+srv://USER:PASS@cluster.mongodb.net/annamayyacars`).
3. Paste it into `be/.env` as `MONGODB_URI=...` and restart the backend.
4. In Compass, connect using that same Atlas string to view the cloud data.
