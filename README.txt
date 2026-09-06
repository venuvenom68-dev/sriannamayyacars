Sri Annamayya Cars — standalone HTML / CSS / JavaScript version
================================================================

This is a plain website (no Node, no database, no build step).
Just open the files in a browser.

HOW TO USE
----------
1. Double-click  index.html    → the public car-selling website.
2. Double-click  admin.html    → the owner dashboard (add / edit / delete cars).
      Demo password:  annamayya2024

Cars you add in the admin panel are saved in your browser (localStorage)
and show up on index.html when you open it in the SAME browser.

FOLDER LAYOUT
-------------
  index.html        Public website
  admin.html        Owner dashboard
  css/style.css     All styles (same design as the original app)
  js/data.js        Demo cars + storage + settings (change password here)
  js/app.js         Website logic (filters, gallery, WhatsApp)
  js/admin.js       Dashboard logic (login, add/edit/photos)
  assets/           Logo, photos, brand logos

NOTES
-----
- Data lives per-browser. It is NOT shared between phones/computers and
  clearing browser data resets it to the demo cars.
- Photos are resized/compressed automatically. Browser storage is small
  (~5 MB), so keep to a few photos per car in this standalone version.
- To change the admin password, edit ADMIN_PASSWORD in js/data.js.
- Tip: for full sharing across devices you'd use the original backend
  (FastAPI/Express + database) — this version is for demo / handoff.

- Best opened by double-click. If your browser blocks anything when opened
  via file://, run a tiny local server from this folder instead:
      python -m http.server 8080
  then visit  http://localhost:8080/
