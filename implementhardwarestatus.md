# Implement Hardware Status

This document describes a step-by-step implementation plan to integrate your ESP32 ultrasonic sensor with an existing React + Node.js (Express) backend for FloodSense. It includes Arduino code, backend setup, frontend integration, wiring notes, testing steps, and troubleshooting tips.

---

## Overview

- **Hardware**: ESP32 + HC-SR04 (ultrasonic) using TRIG pin `GPIO5` and ECHO pin `GPIO18`.
- **Firmware**: Arduino sketch running on ESP32 that reads the distance, smooths the values, and POSTs JSON to the backend every 10 seconds.
- **Backend**: Express server that receives `/api/sensor-data`, saves to MongoDB, and emits updates over Socket.IO.
- **Frontend**: React component connects to Socket.IO and displays the latest distance reading in real time.

---

## Files to add / edit

- `esp32_sensor.ino` — Arduino sketch (ESP32)
- `server.js` (or merge into your existing server) — Express + Socket.IO + Mongoose
- `src/components/SensorDashboard.jsx` — React dashboard component
- Optional: `.env` files for backend and frontend configuration

---

## 1) Arduino (ESP32) — flash the device

1. Create a new Arduino sketch file (e.g., `esp32_sensor.ino`) and paste your code.

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_WIFI_NAME";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverURL = "http://YOUR_BACKEND_IP_OR_DOMAIN:5000/api/sensor-data";

#define TRIG_PIN 5
#define ECHO_PIN 18

// Simple smoothing with rolling average
const int NUM_SAMPLES = 5;
float samples[NUM_SAMPLES];
int sampleIndex = 0;

void setup() {
  Serial.begin(115200);
  delay(100);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    delay(500);
    Serial.print(".");
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected");
  } else {
    Serial.println("\nWiFi connection failed");
  }
  // init samples
  for (int i = 0; i < NUM_SAMPLES; i++) samples[i] = 0;
}

float readDistanceCM() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // timeout 30ms
  if (duration == 0) return -1; // timeout or no echo
  float distance = duration * 0.034 / 2.0;
  return distance;
}

float getSmoothedDistance() {
  float d = readDistanceCM();
  if (d < 0) d = samples[(sampleIndex + NUM_SAMPLES - 1) % NUM_SAMPLES]; // reuse last if bad
  samples[sampleIndex] = d;
  sampleIndex = (sampleIndex + 1) % NUM_SAMPLES;
  float sum = 0;
  for (int i = 0; i < NUM_SAMPLES; i++) sum += samples[i];
  return sum / NUM_SAMPLES;
}

void loop() {
  float distance = getSmoothedDistance();
  Serial.print("Distance (cm): ");
  Serial.println(distance);

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"distance\": " + String(distance, 2) + "}";
    int httpCode = http.POST(payload);

    if (httpCode > 0) {
      Serial.print("HTTP POST code: ");
      Serial.println(httpCode);
    } else {
      Serial.println("HTTP POST failed");
    }
    http.end();
  } else {
    Serial.println("Skipping POST — WiFi not connected");
  }

  delay(10000); // 10 seconds between sends
}
```

2. Update the `ssid`, `password`, and `serverURL` with your network and backend IP/domain (include port if not 80).
3. In Arduino IDE: select the correct **Board** (e.g., ESP32 Dev Module) and the correct **Port**.
4. Upload the sketch. Monitor serial logs at `115200` baud to confirm WiFi connection and POST responses.

**Notes / tips**
- If using HC-SR04 with ESP32, ensure ECHO voltage is safe for ESP32 (HC-SR04 echo is 5V). Use a voltage divider or logic level shifter on ECHO pin.
- If `pulseIn` times out often, try increasing the timeout or reducing noise in wiring.

---

## 2) Backend (Express) — receive and save the data

### Install packages

```bash
npm install express mongoose cors socket.io
```

### server.js (example)

```js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// Replace with your MongoDB connection string
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/floodsense', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const SensorSchema = new mongoose.Schema({
  distance: Number,
  timestamp: { type: Date, default: Date.now }
});
const SensorData = mongoose.model('SensorData', SensorSchema);

app.post('/api/sensor-data', async (req, res) => {
  try {
    const { distance } = req.body;
    if (typeof distance !== 'number') return res.status(400).send({ success: false, error: 'Invalid distance' });
    const newData = new SensorData({ distance });
    await newData.save();
    io.emit('update', newData);
    res.status(200).send({ success: true, data: newData });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, error: 'Server error' });
  }
});

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### Run server

1. Set `MONGO_URI` environment variable if using Atlas.
2. `node server.js` or `npx nodemon server.js`.
3. Check console for "MongoDB connected" and "Server running on port 5000".

**Testing the endpoint manually**

Use `curl` from another machine to emulate the ESP32:

```bash
curl -X POST http://YOUR_BACKEND_IP:5000/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{"distance": 12.34}'
```

You should receive a JSON response with `success: true` and a saved document.

---

## 3) Frontend (React) — display live updates

1. In your React project install Socket.IO client:

```bash
npm install socket.io-client
```

2. Create `src/components/SensorDashboard.jsx` with this content:

```jsx
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// change origin to your backend host if not localhost
const socket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000');

function SensorDashboard() {
  const [latest, setLatest] = useState(null);
  useEffect(() => {
    socket.on('update', (data) => {
      setLatest(data);
    });
    return () => socket.off('update');
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Real-time Flood Sensor</h2>
      {latest ? (
        <div>
          <p>Distance: {latest.distance} cm</p>
          <p>Timestamp: {new Date(latest.timestamp).toLocaleString()}</p>
        </div>
      ) : <p>No data yet</p>}
    </div>
  );
}

export default SensorDashboard;
```

3. Add `REACT_APP_BACKEND_URL` to `.env` in React if needed (e.g., `REACT_APP_BACKEND_URL=http://192.168.1.20:5000`).
4. Import and render `<SensorDashboard />` inside your app route or page.

---

## 4) Wiring & hardware notes

- **Power**: Power HC-SR04 with 5V; power the ESP32 with a stable 5V -> 3.3V regulator or USB.
- **ECHO voltage level**: HC-SR04 ECHO is 5V. The ESP32 GPIO is NOT 5V tolerant. **Use a voltage divider** or logic-level shifter on the ECHO pin to protect the ESP32.
  - Example divider: 10kΩ (echo -> resistor R1) then 20kΩ to GND (R2). Tap between R1 and R2 to ESP32 ECHO pin.
- **TRIG pin**: output from ESP32 (3.3V) is OK for HC-SR04 TRIG.
- **Wiring quick**:
  - Vcc -> 5V
  - GND -> common ground
  - TRIG -> GPIO5 (through direct connection)
  - ECHO -> voltage divider -> GPIO18

---

## 5) Environment & network considerations

- If ESP32 and backend are on the same LAN, use the machine's LAN IP for `serverURL` (e.g., `http://192.168.1.20:5000/api/sensor-data`).
- If backend is behind NAT/router and you want remote access, either:
  - Port-forward `5000` and use the public IP (note security risks), or
  - Deploy backend to a cloud provider (Heroku, Render, DigitalOcean) and use HTTPS.
- For production, **use HTTPS** for the backend. ESP32 HTTPClient can do HTTPS but you must handle certificates or fingerprinting.

---

## 6) Troubleshooting checklist

- **ESP32 won't connect to WiFi**: verify SSID/password, check serial logs, try `WiFi.begin(ssid, password);` and extend timeout.
- **No POST or `HTTP POST failed`**: ensure the backend is reachable from the ESP32 network (try `curl` from another LAN device). Check CORS isn't an issue for server-to-server POSTs.
- **Backend rejects payload**: confirm `Content-Type: application/json` and that the payload is valid JSON. Check server logs.
- **Socket.IO not updating React**: confirm the client `io()` URL matches backend and CORS options allow your origin. Open browser console for errors.
- **Weird distance values or timeouts**: increase `pulseIn` timeout, check wiring, and ensure ECHO logic level is safe.

---

## 7) Optional improvements

- Add authentication to the endpoint (a simple shared API key header) to avoid arbitrary POSTs.
- Validate distance ranges on backend (e.g., ignore values < 0 or > 400 cm).
- Store aggregated statistics (min/max/avg per hour) for charting.
- Use HTTPS and deploy the backend to a secure host.
- Add reconnection/backoff logic on the ESP32 if WiFi or server is down.

---

## 8) Quick test plan

1. Start MongoDB and run `node server.js` locally.
2. `curl` a sample POST — confirm DB write and server console messages.
3. Flash ESP32 with correct `serverURL` (use LAN IP).
4. Start React app and open Sensor Dashboard.
5. Observe real-time updates as the ESP32 POSTs and the server emits via Socket.IO.

---

## 9) Change log / notes

- Document created for implementing hardware status feature on FloodSense.
- Keep this file updated with exact IPs, environment variables, and any PCB/wiring changes.

---

If you want, I can:
- Add a simple API-key header to the Arduino sketch and backend for minimal auth.
- Provide a Dockerfile for the backend.
- Add a small UI mockup (chart + history table) for React.

(Edited to be informal and student-friendly.)

