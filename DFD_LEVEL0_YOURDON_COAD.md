# FloodSense DFD Level 0 (Yourdon and Coad, Repo-Verified)

Generated: 2026-04-13  
Scope: Level 0 DFD based on implemented server and client code.

## 1. Goal

This model shows data movement between:

1. External entities
2. FloodSense Level 0 processes
3. Persistent data stores (server and browser-side offline stores)

## 2. Context-Level Reference (Image-Style)

This first view mirrors the sample image style: one central system process with request/response flows.

```mermaid
flowchart LR
  E1[Community User]
  E2[Admin or Superadmin]
  E3[ESP32 Sensor Device]
  E4[Groq LLM API]
  E5[Nominatim Reverse Geocode API]
  E6[SMTP Email Provider]

  P0((FloodSense Platform))

  E1 -->|register, login, report, chat, fallback, contact| P0
  P0 -->|auth result, feed data, chat reply, acknowledgements| E1

  E2 -->|admin login, moderation, analytics, governance| P0
  P0 -->|dashboard outcomes, moderation and analytics results| E2

  E3 -->|sensor telemetry payload| P0
  P0 -->|ingestion acknowledgement| E3

  P0 -->|chat completion request| E4
  E4 -->|chat completion response| P0

  P0 -->|reverse geocode lookup| E5
  E5 -->|resolved address payload| P0

  P0 -->|contact notification payload| E6
  E6 -->|delivery status| P0
```

## 3. Level 0 DFD (Process Decomposition)

```mermaid
flowchart LR
  %% External Entities
  E1[E1 Community User]
  E2[E2 Admin or Superadmin]
  E3[E3 ESP32 Sensor Device]
  E4[E4 Groq LLM API]
  E5[E5 Nominatim API]
  E6[E6 SMTP Provider]

  %% Processes
  subgraph FS[FloodSense Platform - Level 0 Processes]
    P1((1.0 Authentication and Session Control))
    P2((2.0 Flood Report Lifecycle and Media Handling))
    P3((3.0 Sensor Ingestion and Registry Management))
    P4((4.0 Realtime Monitoring and Socket Broadcast))
    P5((5.0 Fallback Place Service and Offline Feed))
    P6((6.0 Admin Analytics and User Governance))
    P7((7.0 Chatbot Orchestration and Data Tools))
    P8((8.0 Contact Intake and Email Notification))
    P9((9.0 Reverse Geocode Proxy))
  end

  %% Data Stores
  subgraph DL[Persistent Data Stores]
    D1[(D1 Users Collection)]
    D2[(D2 Reports Collection)]
    D3[(D3 Sensor Registry Collection)]
    D4[(D4 Sensor Readings Collection)]
    D5[(D5 Fallback Places Collection)]
    D6[(D6 Contacts Collection)]
    D7[(D7 Uploaded Media Files)]
    D8[(D8 Browser Offline Cache and IndexedDB)]
  end

  %% P1 Auth
  E1 -->|register, login, profile update| P1
  E2 -->|admin login| P1
  P1 <--> |user profile, role, status| D1
  P1 -->|jwt token or cookie session and profile| E1
  P1 -->|jwt token or cookie session and profile| E2

  %% P2 Reports
  E1 -->|report form, location, depth, passability, photos| P2
  E2 -->|validate, reject, delete, moderate| P2
  P2 <--> |report status lifecycle records| D2
  P2 <--> |photo filenames and media files| D7
  P2 -->|new-report, report-validated, report-rejected, report-update, report-deleted events| P4
  P2 -->|report feed and submission status| E1
  P2 -->|moderation outcomes| E2

  %% P3 Sensors
  E3 -->|distance, sensorId, coordinates| P3
  E2 -->|sensor registry create or update requests| P3
  P3 <--> |sensor metadata| D3
  P3 <--> |sensor readings time series| D4
  P3 -->|live update event| P4

  %% P4 Realtime
  E1 -->|socket connect, join-barangay| P4
  E2 -->|socket connect, join-barangay| P4
  P4 -->|report and sensor realtime events| E1
  P4 -->|report and sensor realtime events| E2

  %% P5 Fallback and Offline
  E1 -->|fallback place queries, online or offline read| P5
  E2 -->|fallback CRUD and priority updates| P5
  P5 <--> |fallback places and facility records| D5
  P5 -->|cacheable fallback payloads| D8
  D8 -->|offline fallback reads| P5
  P5 -->|fallback responses| E1
  P5 -->|fallback responses| E2

  %% P6 Analytics and Governance
  E2 -->|weekly report request, export, user governance actions| P6
  D1 -->|roles, account status, user inventory| P6
  D2 -->|report counts and validation summaries| P6
  D4 -->|sensor aggregates and trends| P6
  P6 -->|analytics output and user governance results| E2
  P6 -->|role and status updates| D1

  %% P7 Chatbot
  E1 -->|chat message and history| P7
  E2 -->|chat message and history| P7
  P7 <--> |llm request and completion| E4
  D1 -->|authenticated user context| P7
  D2 -->|recent validated reports context| P7
  D3 -->|sensor registry context| P7
  D4 -->|latest sensor reading context| P7
  D5 -->|evacuation and facility context| P7
  P7 -->|chat reply or safe blocked reply| E1
  P7 -->|chat reply or safe blocked reply| E2

  %% P8 Contact
  E1 -->|contact form submission| P8
  P8 -->|persist submission first| D6
  P8 -->|notification email payload| E6
  E6 -->|delivery status| P8
  P8 -->|submission acknowledgement| E1

  %% P9 Geocode
  E1 -->|lat and lng lookup request| P9
  E2 -->|lat and lng lookup request| P9
  P9 -->|reverse geocode request| E5
  E5 -->|resolved address payload| P9
  P9 -->|resolved address data| E1
  P9 -->|resolved address data| E2
```

## 4. Process Catalog

1. P1 Authentication and Session Control: manages registration, login, JWT or cookie session validation, and profile/account actions.
2. P2 Flood Report Lifecycle and Media Handling: receives reports, handles moderation lifecycle, and persists uploaded report photos.
3. P3 Sensor Ingestion and Registry Management: ingests ESP32 telemetry and manages sensor registry metadata.
4. P4 Realtime Monitoring and Socket Broadcast: pushes report and sensor events to connected clients and barangay rooms.
5. P5 Fallback Place Service and Offline Feed: serves fallback places and populates browser offline stores.
6. P6 Admin Analytics and User Governance: generates weekly analytics and executes admin user role or status actions.
7. P7 Chatbot Orchestration and Data Tools: applies chat guardrails and optionally queries platform data via tools before replying.
8. P8 Contact Intake and Email Notification: saves contact submissions and sends outbound email notifications.
9. P9 Reverse Geocode Proxy: proxies coordinate-to-address lookups to Nominatim.

## 5. Data Store Catalog

1. D1 Users Collection: name, email, password hash, role, barangay, active status, last login.
2. D2 Reports Collection: reporter, barangay, geo location, depth, passability, status, validation notes, severity.
3. D3 Sensor Registry Collection: sensorId, locationName, coordinates, mountHeight, notes.
4. D4 Sensor Readings Collection: sensorId, location metadata, distance, timestamp.
5. D5 Fallback Places Collection: place name, category, barangay, geo location, priority, capacity, contact info.
6. D6 Contacts Collection: inbound contact form message records and status.
7. D7 Uploaded Media Files: report image files saved under uploads.
8. D8 Browser Offline Cache and IndexedDB: app shell and fallback place cache for offline reads.

## 6. Edge Notes to Annotate in Diagram

1. Chat prompt-injection patterns are blocked before model call, allowing safe fallback replies without contacting the LLM.
2. Contact flow persists to D6 before email dispatch, so submission success can still occur when SMTP is unavailable.
3. Sensor ingestion remains functional even if registry enrichment is missing, because readings are saved independently.
4. Sensor registry CRUD endpoints are currently exposed without explicit auth middleware in the route definitions.
5. Offline behavior is partial: app shell and fallbacks are cached, while live reports, live sensors, and chat still require network.
6. Report image uploads are constrained by file type and limits (max 3 images, max 5 MB each).
