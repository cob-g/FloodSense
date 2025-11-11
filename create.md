# FloodSense — Full-stack Flood Monitoring & Reporting (MERN)

> **One-line summary:** FloodSense is a community-driven flood monitoring & reporting web app (MERN) with real-time public "Immediate Feed" (UNVERIFIED, yellow) and an admin-validated "Validated Feed" (VERIFIED, green). Mobile-first, responsive, offline-capable (service worker + IndexedDB), map + list views, and Material You (80%) + Nothing OS (20%) inspired UI using Tailwind CSS + React.


## Prerequisites
- Node.js v16+ (LTS) and npm or yarn
- Git
- MongoDB (Atlas recommended) or local MongoDB v4.4+
- Basic knowledge of React, Node.js/Express, Git
- CLI tools: curl, Postman (or REST client)
- Optional/prod: Cloudinary / AWS S3 (image storage), Redis (rate-limit/session caching)
---

## Tech stack & recommended libraries

**Frontend (React + Tailwind)**
- React (v18+)
- Vite (recommended) or Create React App
- Tailwind CSS (with custom theme + CSS variables)
- react-router-dom
- react-leaflet + leaflet (Leaflet v1.7.1)
- react-query (or SWR) for data fetching + caching
- socket.io-client (for real-time updates)
- idb (tiny IndexedDB wrapper) or localForage for offline storage
- i18next/react-i18next for Tagalog labels

**Backend (Node + Express)**
- Node.js + Express
- Mongoose (MongoDB ODM)
- jsonwebtoken (JWT) for auth
- bcryptjs for password hashing
- multer for photo upload (or multer-storage-cloudinary for Cloudinary)
- cors, helmet, morgan, compression
- express-rate-limit (for global rate-limiting) + per-user logic for report rate-limit
- socket.io for real-time push notifications
- node-cron for weekly report generation
- csv-writer / json2csv (for CSV export) or pdfkit / puppeteer for PDF

**Dev/test**
- Jest + Supertest (backend tests)
- Cypress (E2E)

---

## High-level architecture

```
[React Frontend] <----HTTP/WS----> [Node + Express API + Socket.IO]
                                    |
                                    +--> [MongoDB Atlas]
                                    |
                                    +--> [Cloudinary / S3] (images)
                                    |
                                    +--> [Redis] (optional: rate-limiting, sessions)
```

- Real-time: use Socket.IO to broadcast new reports and validated events so clients update feeds instantly.
- Offline: frontend caches app shell + fallback list (admin-curated) via service worker and stores fallback list in IndexedDB.

---

## Repository & folder structure

Single repo (monorepo-style) with `client/` and `server/`:

```
floodsense/
├─ .github/workflows/ (CI)
├─ client/ (React + Tailwind)
│  ├─ public/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ pages/
│  │  ├─ hooks/
│  │  ├─ services/ (api wrappers)
│  │  ├─ stores/ (react-query cache or redux)
│  │  ├─ styles/
│  │  └─ index.jsx
│  └─ tailwind.config.js
├─ server/
│  ├─ src/
│  │  ├─ controllers/
│  │  ├─ middlewares/
│  │  ├─ models/
│  │  ├─ routes/
│  │  ├─ jobs/ (cron jobs)
│  │  └─ index.js
│  └─ package.json
├─ README.md
├─ create.md (this file)
└─ .env.example
```

---

## Quick setup (scaffold)

### 1. Create repository & scaffold
```bash
# root
mkdir floodsense && cd floodsense
git init
# scaffold client
npm create vite@latest client -- --template react
# scaffold server
mkdir server && cd server
npm init -y
```

### 2. Install main deps

Client (inside `/client`):
```bash
npm install react-router-dom react-query axios react-leaflet leaflet socket.io-client idb i18next react-i18next
# dev
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Server (inside `/server`):
```bash
npm install express mongoose bcryptjs jsonwebtoken cors helmet morgan compression multer socket.io node-cron dotenv
# dev
npm install -D nodemon
```

---

## Backend — detailed implementation plan

### 1. Environment & Entry
- `server/src/index.js` — express app, connect to MongoDB, initialize Socket.IO, attach middlewares and routes.

### 2. Models (Mongoose)

#### `User` schema (roles)
```js
// server/src/models/User.js
const UserSchema = new Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  passwordHash: String,
  role: { type: String, enum: ['user','admin','superadmin'], default: 'user' },
  barangay: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});
```

#### `Report` schema
```js
const ReportSchema = new Schema({
  reporter: { type: Schema.Types.ObjectId, ref: 'User' },
  barangay: String, // Lugar / Barangay
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number], // [lng, lat]
  },
  depth: { type: String, enum: ['Ankle','Knee','Waist','Chest'], required: true },
  passability: { type: String, enum: ['Passable','HeavyOnly','NotPassable'], required: true },
  description: { type: String },
  photoUrl: String,
  status: { type: String, enum: ['UNVERIFIED','VALIDATED','REJECTED'], default: 'UNVERIFIED' },
  validationNotes: String,
  validatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
ReportSchema.index({ location: '2dsphere' });
```

#### `FallbackPlace` schema (admin curated list for offline mode)
```js
const FallbackSchema = new Schema({
  name: String,
  barangay: String,
  location: { type: { type: String, default: 'Point' }, coordinates: [Number] },
  priority: Number, // for sorting
  notes: String,
  updatedAt: { type: Date, default: Date.now }
});
```

### 3. Auth (register/login)
- Register: `POST /api/auth/register` — create user, hash password with bcrypt, return JWT cookie (httpOnly).
- Login: `POST /api/auth/login` — verify, return JWT.

**Role creation**: create seeding script to insert superadmin user (first-run). Use role middleware `requireRole('admin')` / `requireRole('superadmin')`.

**Cookie vs bearer**: recommend using httpOnly cookie with `secure` in production to reduce XSS risk. If you prefer mobile clients, use access + refresh tokens.

### 4. API Endpoints (suggested)

```
Auth
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

Reports
GET  /api/reports?status=UNVERIFIED|VALIDATED&limit=...&skip=...
GET  /api/reports/:id
POST /api/reports   <-- create report (rate-limited per user)
PATCH /api/reports/:id/validate   <-- admin validate
PATCH /api/reports/:id/reject     <-- admin reject
PATCH /api/reports/:id/request-info  <-- admin request more info

Fallback
GET /api/fallbacks    <-- returns admin curated fallback list
POST /api/fallbacks    <-- admin add/update fallback place

Admin / Reports Export
GET /api/admin/reports/weekly?format=csv|pdf  <-- node-cron also creates weekly files

Misc
GET /api/ping         <-- for background ping connectivity check
```

### 5. Rate-limiting: one report per 3 minutes (per user)
**Approach A — DB-backed check (simple, safe):**
- On `POST /api/reports` check the latest report created by this user. If `Date.now() - latest.createdAt < 3 minutes` → reject with friendly message.

```js
// pseudo-middleware
async function reportRateLimit(req, res, next) {
  const last = await Report.findOne({ reporter: req.user.id }).sort({ createdAt: -1 });
  if (last && Date.now() - last.createdAt.getTime() < 3*60*1000) {
    return res.status(429).json({ message: 'Limit: once every 3 minutes. Salamat sa pag-unawa.'});
  }
  next();
}
```

**Approach B — Redis**: for multi-instance production, use Redis TTL counters.

### 6. Photo uploads
- Use `multer` for local dev; for production prefer Cloudinary or AWS S3.
- Validate image filetype & size; create thumbnails (sharp) and store URLs in `photoUrl`.

### 7. Real-time updates
- Socket.IO: broadcast `new-report` when a user posts a report (clients show in Immediate Feed). Broadcast `report-validated` when admin validates (clients move to Validated Feed).

### 8. Weekly reports (cron)
- Use node-cron to run `0 6 * * 1` (every Monday 06:00) to generate the previous week's CSV/PDF.
- Aggregate metrics: total reports, validated count, rejected count, top barangays by report, peak days/hours.
- Save reports to `server/reports/weekly-YYYY-WW.csv` and expose via admin UI with print button.

Sample aggregation (mongoose):
```js
const summary = await Report.aggregate([
  { $match: { createdAt: { $gte: weekStart, $lt: weekEnd } } },
  { $group: { _id: '$barangay', total: { $sum: 1 }, validated: { $sum: { $cond: [{ $eq: ['$status','VALIDATED'] }, 1, 0] }}}},
  { $sort: { total: -1 }}
]);
```

### 9. Offline fallback endpoints
- `GET /api/fallbacks` returns the admin-curated list (small, shareable JSON) that the client caches.

---

## Frontend — detailed implementation plan

### 1. Routing / pages
- `/` — Home: immediate feed + map / list toggle
- `/report/new` — Report submission form (map picker or auto-complete barangay)
- `/auth/login`, `/auth/register`
- `/admin` — Admin dashboard (requires admin role)
  - `/admin/reports` — review incoming reports
  - `/admin/fallbacks` — manage fallback list
  - `/admin/reports/weekly` — view & print weekly report
- `/profile` — user profile and submitted reports

### 2. Report submission form (UX & Tagalog labels)
Fields:
- Lugar / Barangay (dropdown or autocomplete) — **Label:** `Lugar / Barangay`
- Lalim ng baha (choose) — **Label:** `Lalim ng baha` — options: `Ankle-deep`, `Knee-deep`, `Waist-deep`, `Chest / high`
- Kalagayan ng daan (choose) — **Label:** `Kalagayan ng daan` — options: `Passable (Safe)`, `Passable – Heavy vehicles only`, `Not passable`
- Dagdag na Paliwanag (opsyonal) — textarea
- Mag-upload ng Larawan / Ebidensya — file input (required)

**On submit**: show localized message: `Salamat sa ulat. Ipe-validate ng Barangay DRRM Officer.`

**Rate-limit handling**: if server returns 429, show friendly Toast: `Nag-submit ka kamakailan. Maaari lamang mag-report kada 3 minuto.`

### 3. Map integration
- Use `react-leaflet` with Leaflet v1.7.1 and OpenStreetMap tiles (tile URL: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
- Primary Display Map (home page): show markers for both unverified (yellow marker icon) and validated (green marker icon). Markers show a small popup with depth, passability, and timestamp.
- Location Picker Map (in form): show a map where user/admin can click to select coordinates (lat,lng) that populate the form.
- Use clustering (leaflet.markercluster) if many markers.

**Note:** Provide lightweight marker icons (SVGs) that match Material You rounded shapes + Nothing OS minimalism.

### 4. Connection-adaptive display
- Use Network Information API (`navigator.connection.effectiveType`) to estimate network type. If it reports `2g` or `slow-2g` or `effectiveType` is slow, default to List Mode.
- Always observe `navigator.onLine` for online/offline.
- Additionally, implement a background ping: periodically call `GET /api/ping` (small JSON) to confirm server reachability.

Example (simplified):
```js
const connectionType = navigator.connection?.effectiveType || '4g';
const preferList = ['slow-2g','2g','3g'].includes(connectionType);
```

### 5. Immediate Feed (UNVERIFIED) vs Validated Feed (VERIFIED)
- Immediate Feed: show at top with yellow card/outline; label `UNVERIFIED` and a small warning icon. It is visible instantly for all clients.
- Validated Feed: show in separate tab or as filter `Validated` with green styling.
- Use react-query subscriptions and socket.io listeners to update lists live.

### 6. Offline support (service worker + IndexedDB)

**Service worker responsibilities:**
- Cache app shell (HTML/CSS/JS) so the app loads even offline.
- Cache `/api/fallbacks` response and store it in IndexedDB.
- Network-first for `/api/reports` (when online) but fallback to cache for app shell + fallback list.
- Prevent submission when offline: disable submit button and show explanation.

**IndexedDB usage (idb):**
- Store `fallbacks` store with the array of fallback places.
- Store `pendingActions` optionally for queued actions (not used here since reporting is disabled offline).

**Offline states handling (frontend):**
- Online → show live data + background update of fallback list.
- Offline (navigator.onLine === false) but wifi enabled → display cached fallback list (if present) and show banner `Offline — showing admin-curated fallback places`.
- No-Network (airplane mode / no network) → show a message to enable internet.
- Reconnection: when network is restored, fetch fresh data and show toast `Updated: new data available`.

### 7. Admin dashboard flows
- Admin route protected by role-check.
- Reports list shows thumbnail, location, full-size photo, fields, and action buttons: `Validate`, `Reject`, `Request more info`.
- `Validate` → prompt for optional notes → call PATCH `/api/reports/:id/validate` → server updates status → broadcast `report-validated` via Socket.IO → clients move item to validated feed.
- `Reject` → record reason and mark `REJECTED`.

### 8. Weekly report print & CSV
- Admin UI `Export` button hits `GET /api/admin/reports/weekly?format=csv` → returns CSV file; front-end triggers download or opens print-friendly HTML and calls `window.print()` for immediate printing.

---

## Design & Tailwind config (Material You 80% + Nothing OS 20%)

**Design language principles**
- Primary: Material You — rounded shapes, dynamic theming, elevation, expressive color accents.
- Accent: Nothing OS — minimal, plenty of whitespace, clean typography, low visual noise.

**Colors**: use CSS variables for dynamic primary color (Material You) and neutral backgrounds (Nothing OS). Example Tailwind extension:

```js
// client/tailwind.config.js
module.exports = {
  content: ['./index.html','./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        surface: 'var(--color-surface, #ffffff)',
        neutral: 'var(--color-neutral, #f5f5f7)'
      },
      borderRadius: { xl: '1rem' }
    }
  }
}
```

**Tailwind + CSS variables**
- Create a `:root` CSS that defines `--color-primary` derived from admin-configurable palette (for Material You dynamic feel).

**Typography**
- Use variable fonts with medium weight and decent line-height for readability. Nothing OS minimal headings, Material You rounded icons.

**Sample UI component styling**
- Feed card: rounded-xl, shadow-sm, padding, accent stripe left: yellow for UNVERIFIED, green for VALIDATED.

---

## Security, validation & best-practices
- Use `helmet()` and `compression()` in Express.
- Validate all incoming data (Joi or celebrate) and sanitize strings.
- Store JWT tokens in httpOnly cookies; protect sensitive endpoints with CSRF mitigations.
- Limit uploaded file size and validate MIME type.
- Use HTTPS in production.
- For rate-limiting across many instances use Redis.

---

## Testing and CI/CD
- Unit tests: Jest + Supertest for API endpoints.
- E2E: Cypress for flows: register, login, create report, admin validate.
- CI: Github Actions pipeline — run tests, build client, run linter, optionally deploy.

---

## Deployment suggestions
- MongoDB Atlas for DB (global). Use a read-replica for scale.
- Images: Cloudinary or AWS S3
- Server: Render / Railway / Heroku / Cloud Run
- Client: Vercel / Netlify
- Socket.IO: host on same server or using a managed alternative (for scale, use Redis adapter for Socket.IO)

---

## Environment variables (.env.example)
```
# server/.env
PORT=4000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/floodsense
JWT_SECRET=very_long_random_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_URL=cloudinary://... (or S3 config)
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

## Milestones / checklist (suggested order)
- [ ] Repo creation + client/server scaffold
- [ ] DB connection + seed superadmin
- [ ] Basic auth (register/login) + role middleware
- [ ] Report model + `POST /api/reports` + photo upload
- [ ] Immediate feed GET + socket broadcast `new-report`
- [ ] Admin validate flow + `PATCH /api/reports/:id/validate`
- [ ] Map integration (primary + picker) + list fallback
- [ ] Rate-limit: per-user 3-minute rule
- [ ] Offline: service worker + IndexedDB + fallback list
- [ ] Weekly report cron + CSV/PDF export + print view
- [ ] Tests + CI + deploy

---

## Example code snippets (key pieces)

### Example: `POST /api/reports` with rate-limit check (simplified)
```js
// server/src/controllers/reportController.js
const createReport = async (req, res) => {
  const userId = req.user._id; // from auth middleware
  const last = await Report.findOne({ reporter: userId }).sort({ createdAt: -1 });
  if (last && Date.now() - last.createdAt.getTime() < 3*60*1000) {
    return res.status(429).json({ message: 'Limit: you can submit once every 3 minutes.' });
  }
  // handle file upload (multer) -> get photoUrl
  const { barangay, depth, passability, description, lat, lng } = req.body;
  const r = await Report.create({
    reporter: userId,
    barangay,
    location: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
    depth, passability, description, photoUrl: req.fileUrl
  });
  // broadcast via socket
  req.app.get('io').emit('new-report', r);
  res.status(201).json(r);
}
```

### Example: Client — register service worker & cache fallbacks (simplified)
```js
// client/src/serviceWorkerRegistration.js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('sw registered'))
      .catch(err => console.log('sw failed', err));
  });
}

// sw.js (very trimmed)
self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open('floodsense-shell-v1').then(c => c.addAll(['/','/index.html','/styles.css'])));
});
self.addEventListener('fetch', (ev) => {
  if (ev.request.url.includes('/api/fallbacks')) {
    // network-first, then cache + write to idb (client side handles idb)
  }
  // default cache-first for shell
});
```

### Example: React + Leaflet map marker display (simplified)
```jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export default function ReportsMap({ reports }){
  return (
    <MapContainer center={[14.7,121]} zoom={12} style={{height: '60vh'}}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {reports.map(r => (
        <Marker key={r._id} position={[r.location.coordinates[1], r.location.coordinates[0]]}>
          <Popup>
            <div>
              <strong>{r.barangay}</strong>
              <div>{r.depth} • {r.passability}</div>
              <img src={r.photoUrl} style={{width: '100px'}} alt="evidence" />
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
```

---

## Extras & optional improvements
- Add SMS or Viber notification integration for critical validated reports.
- Use a map heatmap for repeated reports to highlight hotspots.
- Add anonymized analytics for trending barangays and times.
- Integrate a simple rule-engine for auto-suggesting severity based on depth + passability.

---

## Final notes & copy-ready strings (Tagalog)
- Submission success: `Salamat sa ulat. Ipe-validate ng Barangay DRRM Officer.`
- Rate-limit message: `Nag-submit ka kamakailan. Maaari lamang mag-report kada 3 minuto.`
- Unverified tag: `UNVERIFIED` — show yellow highlight and `Paunawa: Hindi pa nakumpirma.`
- Verified tag: `VERIFIED` — show green highlight and `Opisyal na kinumpirma ng Barangay.`

--


## Milestones / Checklist

### Backend (✅ COMPLETED)
- [x] Basic Express server setup with middleware
- [x] MongoDB + Mongoose connection
- [x] User model with roles (user/admin/superadmin)
- [x] Report model with geospatial data
- [x] FallbackPlace model for offline support
- [x] JWT authentication with httpOnly cookies
- [x] Role-based access control
- [x] Report submission with rate limiting (3 min cooldown)
- [x] Photo uploads with Multer
- [x] Real-time Socket.IO integration
- [x] Admin validation workflow (validate/reject/report)
- [x] Geospatial queries for nearby reports
- [x] Fallback endpoints for offline mode
- [x] Environment configuration
- [x] Comprehensive error handling
- [x] Input validation and sanitization
- [x] Security headers and CORS
- [x] Database seeding utilities

### Frontend (In Progress)
- [x] Phase 1: Foundation & Setup
  - [x] Folder structure setup (components, pages, hooks, services, contexts, utils, lib, styles)
  - [x] API service layer (api.js, auth.service.js, reports.service.js, fallbacks.service.js)
  - [x] React Query setup (queryClient.js)
  - [x] Socket.IO client setup (socket.js with auto-reconnect)
  - [x] Routing configuration (React Router v6)
  - [x] Theme and Tailwind configuration (Material You + Nothing OS inspired)
  - [x] Utility functions (constants.js, helpers.js)
  - [x] Custom hooks (useAuth, useReports, useSocket)
- [x] Phase 2: Authentication & User Management
  - [x] Login page (with Material You design)
  - [x] Register page (with barangay selection)
  - [x] Protected routes (ProtectedRoute component)
  - [x] Auth context/hooks (AuthContext, useAuth)
  - [x] Profile page (basic user info display)
  - [x] Layout component (header, navigation, connection status)
- [x] Phase 3: Core Features - Reports
  - [x] Report submission form with map picker
  - [x] Report list view (Immediate Feed with filters)
  - [x] Report detail view (modal)
  - [x] Report card component (Material You design)
  - [x] Filter functionality (All/Validated/Pending)
- [x] Phase 4: Map Integration
  - [x] Map component with Leaflet (MapView)
  - [x] Custom markers (green=validated, yellow=unverified)
  - [x] Location picker component with click-to-select
  - [x] Geolocation support ("Use My Location" button)
  - [x] Reverse geocoding for addresses
- [x] Phase 5: Real-time Features
  - [x] Socket.IO integration (SocketContext with event handlers)
  - [x] Live feed updates (automatic query invalidation)
  - [x] Toast notifications (ToastContext with success/error/warning/info)
  - [x] Barangay room subscriptions (joinBarangay functionality)
- [x] Phase 6: Admin Dashboard
  - [x] Admin layout (AdminDashboard page with stats)
  - [x] Reports review page with pending reports list (AdminReportsTable)
  - [x] Validation workflow UI (validate/reject buttons with notes modal)
  - [x] Fallback places management
  - [x] Weekly reports view
- [ ] Phase 7: Offline Support
  - [x] Service worker setup
  - [x] IndexedDB integration
  - [x] Offline fallback list
  - [x] Connection status indicator
  - [x] Network-adaptive UI
- [ ] Phase 8: Polish & Optimization
  - [ ] Responsive design refinement
  - [ ] Loading states
  - [ ] Error boundaries
  - [ ] Internationalization (i18n)
  - [ ] Performance optimization
  - [ ] Testing

### Deployment
- [ ] Set up production environment
- [ ] Configure CI/CD pipeline
- [ ] Set up monitoring and logging
- [ ] Performance optimization