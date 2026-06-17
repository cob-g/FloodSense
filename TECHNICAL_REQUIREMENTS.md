# Technical Requirements

## A. HARDWARE REQUIREMENTS

| Device | Description |
|--------|-------------|
| **IoT Flood Sensor** | **Microcontroller:** ESP32 Development Board (ESP32 Dev Module)<br>**Distance Sensor:** JSN-SR04T Waterproof Ultrasonic Sensor<br>**Power Supply:** 5V DC adapter (minimum 500mA capacity)<br>**Additional Components:** Direct connection (JSN-SR04T outputs 3.3V safe signals)<br>**Connectivity:** WiFi 802.11 b/g/n (2.4 GHz)<br>**Enclosure:** IP67 waterproof housing (JSN-SR04T probe is waterproof)<br>**Mounting:** Fixed mount bracket at specified height above ground |
| **Server Computer** | **Processor:** Intel i5 or AMD Ryzen 5 (or higher) quad-core 2.5 GHz minimum<br>**RAM:** 8GB minimum (16GB recommended for production)<br>**Storage:** 512GB SSD minimum<br>**Network:** Ethernet connection or WiFi, minimum 10 Mbps upload speed<br>**Operating System:** Windows Server, Linux (Ubuntu 20.04+, CentOS 8+), or macOS Server<br>**Database:** MongoDB 5.0+ compatible system<br>**Uptime:** 24/7 operation required |
| **Admin Computer** | **Processor:** Any Intel Core i3 or AMD Ryzen 3 (or higher)<br>**RAM:** 4GB minimum (8GB recommended)<br>**Storage:** 256GB SSD or HDD minimum<br>**GPU:** Any GPU applicable (integrated graphics sufficient)<br>**Network:** At least 5 Mbps<br>**Operating System:** Windows 10/11, Mac, Linux<br>**Display:** 1920x1080 resolution minimum for dashboard viewing |
| **User Laptop/Desktop** | **Processor:** Intel Pentium or Intel Cores, AMD A-Series or Ryzen<br>**RAM:** 4GB minimum<br>**Storage:** 128GB SSD or HDD minimum<br>**GPU:** Any GPU applicable<br>**Network:** At least 3 Mbps<br>**Operating System:** Windows, Mac, Linux<br>**Browser:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| **Smartphone, Tablet** | **Processor:** Quad-core 2.0 GHz or higher<br>**RAM:** 3GB minimum (4GB recommended)<br>**Storage:** 32GB minimum<br>**Screen Size:** 5 inches or larger for ease of use<br>**Operating System:** iOS 13+, Android 8.0+<br>**Camera:** Required for flood report photo uploads (8MP minimum)<br>**GPS:** Required for location tagging<br>**Network:** 4G/LTE or WiFi connection |
| **Development Computer** | **Processor:** Intel i5 or AMD Ryzen 5 (or higher)<br>**RAM:** 8GB minimum (16GB recommended)<br>**Storage:** 512GB SSD<br>**Operating System:** Windows 10/11, macOS, or Linux<br>**Software:** Node.js 16+, MongoDB 5.0+, Git, Arduino IDE 2.0+<br>**Network:** Stable internet connection for package downloads |
| **Arduino Programming Device** | **Type:** USB to Serial adapter (typically built into ESP32 dev board)<br>**Connection:** USB Type-A to Micro-USB cable<br>**Software:** Arduino IDE 2.0+ with ESP32 board support<br>**Drivers:** CP210x or CH340 USB to UART driver (depending on ESP32 board)<br>**Operating System:** Windows 7+, macOS 10.10+, Linux |

## B. SOFTWARE REQUIREMENTS

### Programming Languages:

The FloodSense application was built using multiple programming languages and dialects to implement its local web application, hosted API, real-time monitoring interface, and client-side interactivity. These languages were chosen for their specific strengths in web development, server-side processing, database management, and IoT-driven functionality, ensuring a robust and feature-rich system.

| Language | Details |
|----------|--------|
| **Node.js (JavaScript)** | **Usage:** Primary language for server-side logic in the backend application and hosted API.<br><br>**Files:** `index.js` (main server implementation), `socket.js` (Socket.IO operations), `auth.js` (authentication middleware), `rateLimiting.js` (rate limiting), `reports.js` (flood report CRUD operations), `sensors.js` (sensor data operations), `analytics.js` (weekly report generation), `usersAdmin.js` (admin user management), `email.service.js` (email notifications), `seed.js` (database seeding), `socketHandler.js` (real-time event handling), `Contact.js` (contact form model), `FallbackPlace.js` (offline fallback data), `Report.js`, `Sensor.js`, `SensorData.js`, `User.js` (Mongoose models for database access and sync).<br><br>**Rationale:** Node.js is selected for its robust server-side capabilities, seamless MongoDB integration, event-driven architecture, and widespread use in web applications, enabling dynamic content and RESTful API functionality. |
| **React (JavaScript/JSX)** | **Usage:** Drives the web application UI with data processing, visualization, and real-time updates.<br><br>**Files:** `App.jsx` (main application component), `main.jsx` (application entry point), `MapView.jsx` (interactive flood map with Leaflet), `SensorDashboard.jsx` (real-time sensor monitoring), `FeedPage.jsx` (flood feed with reports and sensors), `LandingPage.jsx` (public homepage), `AdminSensors.jsx` (sensor registry management), `AdminReportsTable.jsx` (report validation interface), `ReportCard.jsx` (flood report display), `AuthContext.jsx`, `SocketContext.jsx`, `ThemeContext.jsx` (context providers), `useReports.js`, `useSensors.js`, `useAuth.js` (custom hooks).<br><br>**Rationale:** React's component-based architecture, virtual DOM, extensive ecosystem (TanStack Query for state management, React Router for navigation, Leaflet for maps, Lucide Icons for UI elements), and support for real-time updates make it ideal for building an interactive, data-driven flood monitoring interface with optimal performance. |
| **C/C++ (Arduino)** | **Usage:** Firmware programming language for ESP32 microcontroller in IoT flood sensors.<br><br>**Files:** `esp32_sensor.ino` (main firmware for sensor readings and WiFi transmission), sensor libraries (`WiFi.h`, `HTTPClient.h`).<br><br>**Rationale:** C/C++ provides low-level hardware control, efficient memory management, minimal latency, and real-time sensor data processing capabilities essential for IoT devices operating in critical infrastructure monitoring. |
| **HTML5** | **Usage:** Provides the structural foundation of the web application's user interface.<br><br>**Files:** `index.html` (root HTML template), component JSX files (`RegisterPage.jsx`, `LoginPage.jsx`, `FeedPage.jsx`, `AdminLayout.jsx`, `MapView.jsx`) containing HTML markup within React components for page layouts, forms, tables, and interactive elements.<br><br>**Rationale:** HTML5 provides semantic markup, accessibility features (ARIA labels), form validation, and geolocation APIs essential for the flood reporting and mapping functionality. |
| **CSS3 / Tailwind CSS** | **Usage:** Styles the application's UI for visual appeal, responsiveness, and usability.<br><br>**Files:** `index.css` (global styles), `App.css` (application-specific styles), `tailwind.config.js` (Tailwind configuration with custom theme colors), inline Tailwind utility classes throughout component files for responsive layouts, animations, and dark theme design.<br><br>**Rationale:** Tailwind CSS provides utility-first approach for rapid UI development, built-in responsive design, custom color schemes (orange/red flood theme), dark mode support, and excellent performance through PostCSS optimization, ensuring a modern and accessible user experience across all devices. |
| **MongoDB Query Language** | **Usage:** Database query language for data retrieval, storage, manipulation, and geospatial queries.<br><br>**Files:** Mongoose schema definitions and queries in `User.js` (user authentication and roles), `Report.js` (flood reports with geolocation), `Sensor.js` (sensor registry), `SensorData.js` (time-series sensor readings), `FallbackPlace.js` (emergency facilities), `Contact.js` (contact messages). Queries include aggregation pipelines, geospatial operations, indexing, and time-based filtering.<br><br>**Rationale:** MongoDB's flexible document-based structure supports complex nested data (flood reports with photos, coordinates, validation status), efficient geospatial indexing for location-based queries, time-series optimization for sensor data, horizontal scaling, and native JSON format that integrates seamlessly with Node.js and React applications. |

### Development Tools & Frameworks:

| Tool/Framework | Purpose & Version |
|----------------|------------------|
| **MERN Stack** | **MongoDB:** v5.0+ (NoSQL database)<br>**Express.js:** v4.18.2 (Backend web framework)<br>**React:** v18.2.0 (Frontend library)<br>**Node.js:** v16.0.0+ (JavaScript runtime)<br><br>**Rationale:** Industry-standard full-stack JavaScript solution enabling code reusability, rapid development, and seamless JSON data flow from database to client. |
| **Vite** | **Version:** v4.4.5<br>**Usage:** Frontend build tool and development server with Hot Module Replacement (HMR), optimized production builds, and ESM-first approach.<br><br>**Files:** `vite.config.js`, build pipeline configuration.<br><br>**Rationale:** Significantly faster than traditional bundlers (Webpack), instant server start, lightning-fast HMR for improved developer experience. |
| **Mongoose ODM** | **Version:** v7.5.0<br>**Usage:** Object Data Modeling library for MongoDB providing schema validation, middleware, query building, and type casting.<br><br>**Files:** All model files in `server/src/models/`.<br><br>**Rationale:** Adds structure and validation to MongoDB, prevents data inconsistencies, provides built-in casting, and simplifies complex queries. |
| **Socket.IO** | **Version:** v4.7.2 (server and client)<br>**Usage:** Real-time bidirectional event-based communication for live sensor updates, flood alerts, and report notifications.<br><br>**Files:** `socket.js`, `socketHandler.js`, `SocketContext.jsx`.<br><br>**Rationale:** Enables instant notifications, real-time sensor dashboard updates, live report validation status, and barangay-specific room subscriptions for targeted alerts. |
| **TanStack Query (React Query)** | **Version:** v4.32.6<br>**Usage:** Powerful data synchronization, caching, and state management for server state in React applications.<br><br>**Files:** `queryClient.js`, custom hooks (`useReports.js`, `useSensors.js`, `useAuth.js`).<br><br>**Rationale:** Automatic background refetching, optimistic updates, cache invalidation, and eliminates need for global state management for server data. |
| **React Router DOM** | **Version:** v6.15.0<br>**Usage:** Client-side routing and navigation with protected routes, nested layouts, and dynamic routing.<br><br>**Files:** `App.jsx`, `PrivateRoute.jsx`, `ProtectedRoute.jsx`.<br><br>**Rationale:** Enables SPA (Single Page Application) navigation, role-based route protection (admin routes), and seamless user experience without page reloads. |
| **Leaflet & React Leaflet** | **Version:** Leaflet v1.9.4, React Leaflet v4.2.1<br>**Usage:** Interactive mapping library for displaying flood locations, sensor positions, and emergency facilities with markers, popups, and geolocation.<br><br>**Files:** `MapView.jsx`, `LocationPicker.jsx`.<br><br>**Rationale:** Open-source, lightweight, mobile-friendly maps with extensive plugin ecosystem, custom markers, and no API key requirements (uses OpenStreetMap). |
| **JWT (JSON Web Tokens)** | **Version:** v9.0.2<br>**Usage:** Stateless authentication and authorization with httpOnly cookies for secure session management.<br><br>**Files:** `auth.js` (middleware), authentication routes.<br><br>**Rationale:** Secure, scalable authentication without server-side session storage, role-based access control (user/admin/super admin), and cross-domain compatibility. |
| **bcryptjs** | **Version:** v2.4.3<br>**Usage:** Password hashing and verification with salt rounds for secure credential storage.<br><br>**Files:** `User.js` model (pre-save hooks).<br><br>**Rationale:** Industry-standard password security, protection against rainbow table attacks, and adjustable cost factor for future-proofing. |
| **Multer** | **Version:** v1.4.5-lts.1<br>**Usage:** Middleware for handling multipart/form-data for flood report photo uploads.<br><br>**Files:** `reports.js` route with file size limits (5MB), type validation (images only), and unique filename generation.<br><br>**Rationale:** Efficient file upload handling, security features (file type validation, size limits), and local storage integration. |
| **Helmet** | **Version:** v7.0.0<br>**Usage:** Security middleware setting various HTTP headers to protect against common vulnerabilities (XSS, clickjacking, etc.).<br><br>**Files:** `index.js` server configuration.<br><br>**Rationale:** Essential security hardening for production deployment, implements best practices with minimal configuration. |
| **Morgan** | **Version:** v1.10.0<br>**Usage:** HTTP request logger middleware for debugging and monitoring API access.<br><br>**Files:** `index.js` server configuration (combined format).<br><br>**Rationale:** Detailed request logging for troubleshooting, security auditing, and performance monitoring. |
| **Axios** | **Version:** v1.5.0<br>**Usage:** Promise-based HTTP client for API requests from React frontend.<br><br>**Files:** `api.js`, service files (`reports.service.js`, `sensors.service.js`, `auth.service.js`).<br><br>**Rationale:** Interceptors for auth tokens, automatic JSON transformation, better error handling than fetch API, and request/response interceptors. |
| **Nodemailer** | **Version:** v7.0.10<br>**Usage:** Email service for contact form submissions and potential flood alerts.<br><br>**Files:** `email.service.js`, contact route handlers.<br><br>**Rationale:** Reliable email delivery with support for multiple transport methods, HTML emails, and attachment support. |
| **node-cron** | **Version:** v3.0.2<br>**Usage:** Task scheduler for automated jobs (potential cleanup tasks, scheduled reports).<br><br>**Files:** Server background tasks.<br><br>**Rationale:** Lightweight cron-like job scheduling within Node.js without external dependencies. |
| **Tailwind CSS** | **Version:** v3.3.3<br>**Usage:** Utility-first CSS framework with PostCSS and Autoprefixer for responsive design.<br><br>**Files:** `tailwind.config.js`, `postcss.config.js`, component styling.<br><br>**Rationale:** Rapid UI development, consistent design system, built-in dark mode, responsive utilities, and tree-shaking for minimal CSS bundle size. |
| **Lucide React** | **Version:** v0.553.0<br>**Usage:** Icon library providing 1000+ customizable SVG icons for UI components.<br><br>**Files:** Component imports throughout frontend.<br><br>**Rationale:** Lightweight, tree-shakeable, consistent design language, and active maintenance. |
| **i18next & react-i18next** | **Version:** i18next v23.4.4, react-i18next v13.2.2<br>**Usage:** Internationalization framework for multi-language support (currently English, extensible to Filipino/Tagalog).<br><br>**Files:** Language configuration files.<br><br>**Rationale:** Preparation for localization, community accessibility, and following best practices for public-facing applications. |
| **IndexedDB (idb)** | **Version:** v7.1.1<br>**Usage:** Client-side storage for offline fallback data and PWA capabilities.<br><br>**Files:** `idb.js`, offline service integration.<br><br>**Rationale:** Enables offline functionality, caches emergency facility data, and improves app resilience during network outages. |
| **Arduino IDE** | **Version:** v2.0+<br>**Usage:** Development environment for programming ESP32 microcontrollers with code editor, compiler, and uploader.<br><br>**Board Support:** ESP32 Arduino Core v2.0.0+<br><br>**Rationale:** Official IDE for Arduino-compatible boards, extensive library ecosystem, serial monitor for debugging, and community support. |
| **MongoDB Compass** | **Version:** Latest stable<br>**Usage:** Official GUI tool for MongoDB database management, visualization, query building, and performance monitoring.<br><br>**Features:** Visual schema exploration, query performance analysis, index management, data import/export, aggregation pipeline builder.<br><br>**Rationale:** Intuitive interface for database administration, real-time performance metrics, visual query builder for complex aggregations, and essential for monitoring sensor data patterns and report analytics. |
| **Git** | **Version:** v2.30+<br>**Usage:** Distributed version control system for source code management and collaboration.<br><br>**Rationale:** Industry standard for team collaboration, code history, branching strategies, and deployment workflows. |
| **nodemon** | **Version:** v3.0.1 (dev dependency)<br>**Usage:** Development utility that automatically restarts server on file changes.<br><br>**Rationale:** Improves development workflow, eliminates manual server restarts, and increases productivity. |
| **ESLint** | **Version:** v8.45.0<br>**Usage:** JavaScript linter for code quality and consistency with React-specific rules.<br><br>**Plugins:** eslint-plugin-react, eslint-plugin-react-hooks<br><br>**Rationale:** Enforces code standards, catches common errors, and maintains consistent code style across team. |
| **dotenv** | **Version:** v16.3.1<br>**Usage:** Environment variable management for configuration (database URIs, JWT secrets, API keys).<br><br>**Files:** `.env` files (server and client).<br><br>**Rationale:** Separates configuration from code, enables different settings per environment (dev/prod), and protects sensitive credentials. |
| **CORS** | **Version:** v2.8.5<br>**Usage:** Cross-Origin Resource Sharing middleware for secure API access from frontend.<br><br>**Configuration:** Whitelisted origins, credentials support.<br><br>**Rationale:** Security mechanism preventing unauthorized cross-origin requests while allowing legitimate frontend access. |
| **Compression** | **Version:** v1.7.4<br>**Usage:** Middleware for gzip compression of HTTP responses.<br><br>**Rationale:** Reduces bandwidth usage, faster page loads, and improved performance especially on mobile networks. |
| **cookie-parser** | **Version:** v1.4.6<br>**Usage:** Middleware for parsing cookies, used for JWT token storage in httpOnly cookies.<br><br>**Rationale:** Secure authentication token storage, prevents XSS attacks on tokens, and simplifies cookie handling. |

## C. NETWORK TOPOLOGY

The FloodSense system uses a client–server architecture with real-time updates. Community users access the React web app, which communicates with the Node.js/Express API. Real-time events are delivered via Socket.IO. IoT sensors (ESP32 + ultrasonic) optionally POST readings to the backend over the local network or internet (deployment-dependent). MongoDB persists application and sensor data.

### Topology Overview (Text Format)

**Client Layer**
- Web browsers (desktop/mobile) access the FloodSense frontend.
- The frontend makes REST API calls and maintains a Socket.IO connection for live updates.

**Application Layer**
- **Frontend**: React (Vite dev server in development; static hosting/CDN in production).
- **Backend**: Node.js + Express REST API + Socket.IO (same origin/host as API in typical deployments).
- **Uploads**: Server filesystem for image uploads in development/standard deployments (via Multer).

**Database Layer**
- MongoDB (local or managed/hosted). Accessed only by the backend via Mongoose.

**IoT Sensor Layer (Optional / Deployment-Based)**
- ESP32 device posts JSON readings to `/api/sensor-data` at a fixed interval.
- Device connectivity is typically Wi‑Fi (2.4 GHz), same LAN as server for simplest deployment.

### Ports, Protocols, and Endpoints

| Component | Protocol | Default Port | Notes |
|----------|----------|--------------|------|
| Frontend (Vite dev) | HTTP | 5173 | Development only |
| Backend API | HTTP/HTTPS | 5000 | REST endpoints under `/api/*` |
| Real-time (Socket.IO) | WS/WSS | 5000 | Same server/port as backend |
| MongoDB | MongoDB wire protocol | 27017 | Local default; hosted uses provider URI |

### Network Specifications:

| Component | Specification |
|-----------|--------------|
| **Client-Server Communication** | **Protocol:** HTTPS (Production), HTTP (Development)<br>**Port:** 5000 (Backend API), 5173 (Frontend Dev)<br>**Data Format:** JSON (RESTful API)<br>**Authentication:** JWT tokens in httpOnly cookies<br>**CORS:** Configured whitelist for allowed origins |
| **Real-time Communication** | **Protocol:** WebSocket (Socket.IO)<br>**Port:** Same as backend (5000)<br>**Events:** `new-report`, `report-validated`, `report-rejected`, `sensor-update`, `join-barangay`<br>**Rooms:** Barangay-specific rooms for targeted notifications |
| **IoT Sensor Network** | **Protocol:** HTTP POST<br>**Endpoint:** `/api/sensor-data`<br>**Frequency:** Every 10 seconds<br>**Payload:** JSON `{"sensorId": "string", "distance": number, "timestamp": ISO8601}`<br>**Network:** WiFi 802.11 b/g/n (2.4 GHz)<br>**IP Assignment:** DHCP or Static (recommended) |
| **Database Connection** | **Protocol:** MongoDB Wire Protocol<br>**Port:** 27017 (default)<br>**Connection String:** `mongodb://127.0.0.1:27017/floodsense` (local)<br>**Driver:** Mongoose ODM v7.5.0<br>**Pool Size:** Default (5 connections)<br>**Options:** `useNewUrlParser`, `useUnifiedTopology` |
| **File Upload** | **Protocol:** HTTP POST (multipart/form-data)<br>**Endpoint:** `/api/reports` (with photo)<br>**Max Size:** 5MB per file<br>**Storage:** Local filesystem (`/uploads` directory)<br>**Allowed Types:** JPEG, PNG, GIF, WebP |
| **Load Balancing (Production)** | **Type:** NGINX reverse proxy (recommended)<br>**SSL/TLS:** Let's Encrypt certificates<br>**Ports:** 80 (HTTP) → 443 (HTTPS) → 5000 (Backend)<br>**Features:** SSL termination, static file serving, gzip compression |

### Network Security:

| Security Layer | Implementation |
|----------------|----------------|
| **Transport Security** | TLS 1.2+ for HTTPS (production)<br>Encrypted WebSocket connections (wss://)<br>SSL certificate validation |
| **Application Security** | JWT authentication with httpOnly cookies<br>bcrypt password hashing (10 salt rounds)<br>Helmet.js security headers<br>CORS whitelist enforcement<br>Rate limiting (100 req/15min per IP, 1 report/3min per user) |
| **Data Validation** | Input sanitization on all API endpoints<br>Mongoose schema validation<br>File type and size validation (Multer)<br>SQL injection prevention (NoSQL by design) |
| **Network Filtering** | Firewall rules (ports 5000, 27017, 80, 443)<br>IP whitelisting for admin endpoints (optional)<br>DDoS protection via rate limiting<br>Origin validation for Socket.IO connections |

## III. Data Flow

### Local/Client to Backend (Reports, Auth, Admin)

**Process:**
- User actions in the React app (login/register, submit report, view reports, admin validate) call the backend REST API over HTTP(S).
- Authentication uses JWT stored in **httpOnly cookies** (browser → backend), with CORS configured to allow the frontend origin and credentials.
- Uploaded photos are sent as `multipart/form-data` to the reports endpoint (Multer), then stored under the server upload path.

**Example:**
- A user submits a flood report in the UI → `POST /api/reports` (with photo + metadata) → backend validates/rate-limits → saves the report in MongoDB → emits a Socket.IO event (e.g., `new-report`) to update other clients.

**Rationale:**
- Separates UI concerns from business logic, supports role-based access, and provides a consistent REST surface for both browser and potential mobile clients.

### IoT Sensor to Backend (Water Level Readings)

**Process:**
- ESP32 reads distance/level → sends JSON to `POST /api/sensor-data`.
- Backend validates payload (e.g., range checks, schema checks) → stores reading in MongoDB (time-series style collection) → emits Socket.IO event (e.g., `sensor-update`) for live dashboards.

**Example:**
- Sensor sends `{"sensorId":"NC-001","distance":123.45,"timestamp":"..."}` → backend stores as `SensorData` → clients subscribed to updates render the latest reading.

**Rationale:**
- Enables real-time monitoring while preserving historical readings for analytics and auditing.

### Backend to Client (Real-time Updates)

**Process:**
- Clients establish a Socket.IO connection to the backend.
- Server broadcasts events when key domain actions happen (new report, validation, sensor updates).
- Clients update UI state (and/or invalidate React Query caches) to reflect new data.

**Example:**
- Admin validates a report → `PATCH/PUT /api/reports/:id/validate` → server emits `report-validated` → all connected clients update “Validated Feed”.

**Rationale:**
- Avoids heavy polling and improves responsiveness under active flood situations.

### Offline / Degraded Mode (Client)

**Process:**
- Client uses service worker + cached assets (and optionally IndexedDB) to load the app shell when offline.
- When offline, the UI displays cached fallback/emergency places (admin-curated) and disables actions that require server write operations (e.g., report submission).

**Example:**
- User loses connectivity → app loads from cache → shows offline banner + cached emergency/fallback list.

**Rationale:**
- Maintains usability during disasters where connectivity is unreliable.

## IV. Database Design

### Local Database (Development)
**Description:**
- MongoDB running locally (default `mongodb://localhost:27017/floodsense`).
- Used for developer testing, rapid iteration, and local integration (frontend + backend).

### Hosted Database (Production)
**Description:**
- Managed MongoDB (Atlas or equivalent) accessed via `MONGODB_URI`.
- Backend connects via Mongoose with authentication and TLS handled by the provider.

### Core Collections / Tables (MongoDB)

**users**
- Stores user identity, hashed password, role (`user/admin/superadmin`), and profile metadata (e.g., barangay assignment).

**reports**
- Flood report documents including location (GeoJSON Point), status (`UNVERIFIED/VALIDATED/REJECTED`), evidence photo path/url, timestamps, and validation metadata.

**fallbackplaces**
- Admin-curated emergency locations for offline access and “fallback” information.

**sensors** (if enabled in this repo deployment)
- Registry of deployed sensors (sensorId, label, installation metadata, location).

**sensordatas** (time-series style)
- Sensor readings over time keyed by sensorId + timestamp (distance/water level and derived fields if used).

**contacts** (if enabled)
- Contact form submissions and admin review flags.

### Indexing / Constraints (Recommended)
- `reports.location` → `2dsphere` index (nearby queries / map rendering).
- `reports.createdAt` and `reports.status` → compound index for feed filtering.
- `sensordatas.sensorId` + `sensordatas.timestamp` → compound index for latest/graphs.
- `users.email` → unique index.

**Rationale:**
- MongoDB’s document model fits mixed report + sensor payloads, while geospatial indexing supports map-based queries efficiently.

## V. Network Integration

**Description:**
- REST API communication uses HTTP in development and HTTPS in production.
- Real-time communication uses WebSocket (Socket.IO) on the backend port.
- CORS is configured to allow the frontend origin (via `CLIENT_URL`) and credentials for cookie-based auth.
- Static asset delivery is handled by Vite (dev) or static hosting/CDN (prod), while the API remains on the backend host.

**Rationale:**
- Balances accessibility and security: cookie-based sessions + strict origin controls for browser clients, and a simple POST interface for IoT devices.

## VI. Design Principles

**Modularity:**
- Separate concerns across frontend (React UI), backend (Express API + Socket.IO), and data layer (MongoDB/Mongoose), enabling independent updates and testing.

**Scalability:**
- Stateless API design and event-based real-time updates enable horizontal scaling (with appropriate Socket.IO adapter in multi-instance production).
- Database indexing supports increasing report volume and geospatial queries.

**Security:**
- JWT in httpOnly cookies, CORS origin validation, input validation, and hardened headers (Helmet) reduce common web risks.
- Upload constraints (size/type) limit file-based attacks.

**Usability:**
- Mobile-first responsive UI, clear report status (unverified vs validated), and real-time updates improve situational awareness.
- Offline/degraded mode provides essential info during connectivity loss.

**Rationale:**
- These principles keep FloodSense maintainable, resilient during emergencies, and safe for public-facing deployment.
