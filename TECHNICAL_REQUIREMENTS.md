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

The FloodSense system implements a distributed network architecture connecting IoT sensors, client applications, backend servers, and database infrastructure. The topology ensures real-time data flow, scalability, and reliability across multiple network layers.

### System Architecture Diagram:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  Web Browser │  │    Mobile    │  │    Admin     │             │
│  │  (Chrome,    │  │   Devices    │  │  Dashboard   │             │
│  │  Firefox,    │  │  (iOS/       │  │  (Desktop)   │             │
│  │  Safari)     │  │  Android)    │  │              │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
│         │                 │                 │                      │
│         └─────────────────┼─────────────────┘                      │
│                           │                                        │
│                    HTTPS/WebSocket                                 │
│                     (Port 5000/5173)                               │
└───────────────────────────┼────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              NGINX / Load Balancer (Production)              │  │
│  │              [Optional: Port 80/443 → 5000]                  │  │
│  └───────────────────────────┬──────────────────────────────────┘  │
│                              │                                     │
│  ┌───────────────────────────▼──────────────────────────────────┐  │
│  │            React Frontend (Vite Dev Server)                  │  │
│  │            • Port: 5173 (Development)                        │  │
│  │            • Static Files: Served via CDN (Production)       │  │
│  │            • WebSocket Client: Socket.IO                     │  │
│  │            • API Calls: Axios HTTP Client                    │  │
│  └───────────────────────────┬──────────────────────────────────┘  │
│                              │                                     │
│                         API Requests                               │
│                              │                                     │
│  ┌───────────────────────────▼──────────────────────────────────┐  │
│  │            Node.js Backend Server (Express)                  │  │
│  │            • Port: 5000                                      │  │
│  │            • RESTful API Endpoints                           │  │
│  │            • Socket.IO Server (Real-time)                    │  │
│  │            • Authentication: JWT (httpOnly cookies)          │  │
│  │            • File Upload: Multer (/uploads)                  │  │
│  │            • Middleware: CORS, Helmet, Compression, Morgan   │  │
│  └──────┬──────────────────────────────┬────────────────────────┘  │
│         │                              │                           │
│         │                              │                           │
└─────────┼──────────────────────────────┼───────────────────────────┘
          │                              │
          │                      ┌───────▼────────┐
          │                      │   Socket.IO    │
          │                      │  Event Emitter │
          │                      │  (Real-time    │
          │                      │   Updates)     │
          │                      └────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              MongoDB Database (Port 27017)                   │  │
│  │              • Collections: users, reports, sensors,         │  │
│  │                sensordatas, fallbackplaces, contacts         │  │
│  │              • Indexes: Geospatial, Timestamp, SensorID      │  │
│  │              • Management: MongoDB Compass                   │  │
│  │              • Connection: Mongoose ODM                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         IOT SENSOR LAYER                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Sensor 1   │  │   Sensor 2   │  │   Sensor N   │             │
│  │  ┌────────┐  │  │  ┌────────┐  │  │  ┌────────┐  │             │
│  │  │ ESP32  │  │  │  │ ESP32  │  │  │  │ ESP32  │  │             │
│  │  │ + JSN- │  │  │  │ + JSN- │  │  │  │ + JSN- │  │             │
│  │  │ SR04T  │  │  │  │ SR04T  │  │  │  │ SR04T  │  │             │
│  │  └────────┘  │  │  └────────┘  │  │  └────────┘  │             │
│  │              │  │              │  │              │             │
│  │  Location 1  │  │  Location 2  │  │  Location N  │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
│         │                 │                 │                      │
│         └─────────────────┼─────────────────┘                      │
│                           │                                        │
│                      WiFi 2.4GHz                                   │
│                    HTTP POST Request                               │
│                 (Every 10 seconds)                                 │
│                 /api/sensor-data                                   │
│                           │                                        │
│                           ▼                                        │
│                  Backend Server (Port 5000)                        │
└─────────────────────────────────────────────────────────────────────┘
```

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

## D. AVAILABILITY

The FloodSense system is designed for high availability to ensure continuous flood monitoring and timely alerts to communities. System uptime is critical for public safety applications.

### Uptime Requirements:

| Component | Target Availability | Acceptable Downtime |
|-----------|--------------------|--------------------|
| **IoT Sensors** | 99.5% (24/7 monitoring) | <3.6 hours/month (scheduled maintenance during low-flood-risk periods) |
| **Backend API Server** | 99.9% (Three nines) | <43 minutes/month (planned maintenance windows) |
| **Frontend Application** | 99.9% (Three nines) | <43 minutes/month (CDN-served static files) |
| **Database (MongoDB)** | 99.95% | <22 minutes/month (automated backups and replica sets) |
| **Real-time Updates (Socket.IO)** | 99.5% | <3.6 hours/month (graceful degradation to polling) |

### High Availability Strategies:

| Strategy | Implementation |
|----------|----------------|
| **Server Redundancy** | **Production:** Multi-instance deployment with load balancer<br>**Database:** MongoDB replica set (primary + 2 secondaries)<br>**Failover:** Automatic failover to standby server<br>**Recovery Time Objective (RTO):** <5 minutes |
| **Data Backup** | **Frequency:** Automated daily backups at 2:00 AM<br>**Retention:** 30-day rolling backup retention<br>**Storage:** Off-site backup storage (cloud or secondary location)<br>**Recovery Point Objective (RPO):** <24 hours<br>**Testing:** Monthly backup restoration tests |
| **Monitoring & Alerts** | **System Monitoring:** CPU, memory, disk usage, network traffic<br>**Application Monitoring:** API response times, error rates, active users<br>**Sensor Monitoring:** Last reading timestamp, offline detection (>5 minutes)<br>**Alerting:** Email/SMS notifications for critical failures<br>**Tools:** Node.js process managers (PM2), MongoDB monitoring, uptime monitors |
| **Error Handling** | **API:** Graceful error responses with proper HTTP status codes<br>**Frontend:** Error boundaries, offline fallback UI, retry mechanisms<br>**Database:** Connection pooling, automatic reconnection<br>**Sensors:** Exponential backoff for failed transmissions |
| **Scalability** | **Horizontal Scaling:** Multiple backend instances behind load balancer<br>**Database Sharding:** Partition by barangay/region for large deployments<br>**CDN:** Static asset delivery via Content Delivery Network<br>**Caching:** Redis/Memcached for frequently accessed data (optional) |
| **Disaster Recovery** | **Backup Server:** Hot standby or cloud deployment ready for activation<br>**Documentation:** Runbooks for common failure scenarios<br>**Recovery Procedures:** Step-by-step restoration guides<br>**Contact Information:** 24/7 emergency contact for critical incidents |
| **Offline Capabilities** | **PWA Features:** Service workers for offline functionality<br>**Local Storage:** IndexedDB caching of fallback locations and recent reports<br>**Graceful Degradation:** App remains functional with limited features when offline<br>**Sync:** Automatic data synchronization when connection restored |
| **Maintenance Windows** | **Scheduled Maintenance:** Weekly Sundays 2:00 AM - 4:00 AM (low traffic)<br>**Notification:** 72-hour advance notice to users<br>**Zero-Downtime Deployments:** Blue-green deployment strategy<br>**Rollback Plan:** Automated rollback on deployment failure |

### Performance Metrics:

| Metric | Target | Measurement |
|--------|--------|-------------|
| **API Response Time** | <200ms (p95), <500ms (p99) | Average response time for GET requests |
| **Database Query Time** | <100ms (p95) | MongoDB query execution time |
| **Page Load Time** | <3 seconds (first contentful paint) | Lighthouse performance score >90 |
| **WebSocket Latency** | <100ms | Real-time update delivery time |
| **Sensor Data Freshness** | <30 seconds | Time from sensor reading to dashboard display |
| **Concurrent Users** | 1,000+ simultaneous users | Load testing verified capacity |

### Service Level Objectives (SLOs):

- **Critical Alerts:** 99.99% delivery rate within 30 seconds of detection
- **Sensor Data Accuracy:** 98%+ valid readings (outliers filtered)
- **Report Validation:** <2 hours median response time for admin review
- **System Recovery:** <15 minutes for automatic recovery from common failures
- **Data Integrity:** Zero data loss for committed transactions (ACID compliance)

## E. API SPECIFICATION

The FloodSense RESTful API provides programmatic access to flood monitoring data, user management, sensor readings, and administrative functions. All endpoints follow REST conventions with JSON request/response format.

### Base URL:
- **Development:** `http://localhost:5000/api`
- **Production:** `https://your-domain.com/api`

### Authentication:
- **Method:** JWT (JSON Web Token) stored in httpOnly cookies
- **Header:** `Cookie: token=<jwt_token>`
- **Expiration:** 7 days (configurable)
- **Roles:** `user`, `admin`, `super_admin`

### API Endpoints:

#### 1. Health & System

| Method | Endpoint | Description | Auth Required | Response |
|--------|----------|-------------|---------------|----------|
| GET | `/api/ping` | Health check endpoint | No | `{ message, timestamp, status, version }` |
| GET | `/api` | API information and available endpoints | No | `{ name, version, description, endpoints }` |

#### 2. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user account | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/logout` | User logout | Yes |
| GET | `/api/auth/me` | Get current user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |
| PUT | `/api/auth/password` | Change password | Yes |

**Rate Limiting:** 100 requests per 15 minutes per IP

#### 3. Flood Reports Endpoints (`/api/reports`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/reports` | Get all flood reports (with filters) | No |
| GET | `/api/reports/:id` | Get single report by ID | No |
| POST | `/api/reports` | Create new flood report | Yes |
| PUT | `/api/reports/:id` | Update own report | Yes (Owner) |
| DELETE | `/api/reports/:id` | Delete own report | Yes (Owner/Admin) |
| PUT | `/api/reports/:id/validate` | Validate report (admin) | Yes (Admin) |
| PUT | `/api/reports/:id/reject` | Reject report (admin) | Yes (Admin) |
| PUT | `/api/reports/:id/request-info` | Request more info (admin) | Yes (Admin) |
| GET | `/api/reports/nearby` | Find reports near location | No |

**Rate Limiting:** 1 report per 3 minutes per user

#### 4. Sensor Endpoints (`/api/sensors`, `/api/sensor-data`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/sensors` | Get all registered sensors | No |
| GET | `/api/sensors/:id` | Get sensor by ID | No |
| POST | `/api/sensors` | Register new sensor (admin) | Yes (Admin) |
| PUT | `/api/sensors/:id` | Update sensor (admin) | Yes (Admin) |
| DELETE | `/api/sensors/:id` | Delete sensor (admin) | Yes (Admin) |
| POST | `/api/sensor-data` | Submit sensor reading (IoT device) | No |
| GET | `/api/sensor-data` | Get sensor readings | No |
| GET | `/api/sensor-data/latest` | Get latest readings from all sensors | No |

#### 5. Fallback/Emergency Facilities (`/api/fallbacks`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/fallbacks` | Get all emergency facilities | No |
| GET | `/api/fallbacks/:id` | Get facility by ID | No |
| POST | `/api/fallbacks` | Create facility (admin) | Yes (Admin) |
| PUT | `/api/fallbacks/:id` | Update facility (admin) | Yes (Admin) |
| DELETE | `/api/fallbacks/:id` | Delete facility (admin) | Yes (Admin) |
| GET | `/api/fallbacks/nearby` | Find facilities near location | No |

#### 6. Admin Endpoints (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/users` | Get all users | Yes (Admin) |
| GET | `/api/admin/users/:id` | Get user by ID | Yes (Admin) |
| PUT | `/api/admin/users/:id/role` | Update user role | Yes (Super Admin) |
| DELETE | `/api/admin/users/:id` | Delete user | Yes (Super Admin) |
| GET | `/api/admin/analytics/weekly-report` | Generate weekly analytics report | Yes (Admin) |
| GET | `/api/admin/analytics/export` | Export analytics to CSV/PDF | Yes (Admin) |

#### 7. Contact Endpoints (`/api/contact`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/contact` | Submit contact form | No |
| GET | `/api/contact` | Get all contact messages (admin) | Yes (Admin) |
| PUT | `/api/contact/:id/mark-read` | Mark message as read (admin) | Yes (Admin) |

### WebSocket Events (Socket.IO):

**Client → Server:**
- `join-barangay` - Subscribe to barangay-specific updates

**Server → Client:**
- `new-report` - New flood report created
- `report-validated` - Report validated by admin
- `report-rejected` - Report rejected by admin
- `sensor-update` - Real-time sensor data update

### Error Responses:

All API endpoints follow a consistent error format with proper HTTP status codes:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Data Validation Rules:

| Field | Rules |
|-------|-------|
| Email | Valid email format, unique |
| Password | Minimum 6 characters |
| Coordinates | Latitude: -90 to 90, Longitude: -180 to 180 |
| Severity | Enum: `minor`, `moderate`, `severe`, `critical` |
| Water Level | Number, 0-500 cm |
| Photo | Max 5MB, JPEG/PNG/GIF/WebP only |
| Sensor ID | Alphanumeric, unique, 3-20 characters |
| Distance | Number, 25-450 cm (JSN-SR04T range) |

## F. NETWORK REQUIREMENTS

| Component | Requirements |
|-----------|-------------|
| **IoT Sensor Deployment** | **Temperature Range:** -10°C to 50°C (14°F to 122°F)<br>**Humidity:** Up to 95% non-condensing (with proper enclosure)<br>**Water Resistance:** IP65 rated enclosure minimum<br>**Mounting Height:** Fixed position, height recorded in system database<br>**Power:** Continuous 5V DC power supply or battery backup system<br>**Accessibility:** Secure location to prevent tampering |
| **Server Environment** | **Temperature:** 15°C to 25°C (59°F to 77°F) optimal<br>**Humidity:** 20% to 80% non-condensing<br>**Power:** Uninterruptible Power Supply (UPS) recommended<br>**Ventilation:** Adequate cooling for 24/7 operation<br>**Security:** Physical and network security measures |
| **Network Infrastructure** | **Router/Switch:** Gigabit Ethernet support<br>**WiFi Access Points:** WPA2/WPA3 encryption<br>**Backup:** Redundant internet connection recommended for critical deployments<br>**Firewall:** Properly configured for security while allowing required traffic |

## E. MEASUREMENT SPECIFICATIONS

| Parameter | Value |
|-----------|-------|
| **Distance Measurement Range** | 25 cm to 450 cm |
| **Measurement Accuracy** | ±2 mm (JSN-SR04T sensor specification) |
| **Sampling Rate** | Every 10 seconds (configurable in firmware) |
| **Data Smoothing** | 5-point rolling average filter |
| **Timeout** | 30ms pulse timeout |
| **Flood Thresholds** | Passable: > 60 cm clearance<br>Heavy Vehicles Only: 40-60 cm clearance<br>Not Passable: < 40 cm clearance |

## F. MINIMUM USER REQUIREMENTS

| User Type | Requirements |
|-----------|-------------|
| **General Public** | Modern web browser (Chrome, Firefox, Safari, Edge)<br>Internet connection (3 Mbps minimum)<br>Device: Smartphone, tablet, or computer<br>GPS-enabled device for location-based reporting |
| **Report Submitters** | Registered account on FloodSense platform<br>Camera-equipped device for photo uploads<br>Basic understanding of flood severity levels |
| **Barangay Officials/Admins** | Verified admin account with validation privileges<br>Reliable computer or laptop with 1920x1080 display<br>Stable internet connection for real-time monitoring<br>Training on report validation procedures |
| **System Administrators** | Full admin credentials (super admin role)<br>Knowledge of Node.js, MongoDB, and React<br>Server access and management capabilities<br>Understanding of IoT sensor deployment and maintenance |

## G. SCALABILITY CONSIDERATIONS

| Aspect | Specification |
|--------|--------------|
| **Maximum Concurrent Users** | 1,000+ (with recommended server specs)<br>10,000+ (with cloud deployment and load balancing) |
| **Sensor Capacity** | Up to 100 active sensors per deployment<br>Unlimited with proper database indexing and server scaling |
| **Data Retention** | Minimum 1 year of sensor data history<br>Unlimited report history with archival system |
| **Geographic Coverage** | Scalable to multiple cities/regions<br>Barangay-based filtering and organization |
| **API Rate Limiting** | 100 requests per 15 minutes per IP<br>Report submission: 1 report per 3 minutes per user |
