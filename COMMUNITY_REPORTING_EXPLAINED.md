# 🌊 Community Reporting - Explained Like You're 12! 

## What is Community Reporting?

Imagine you see water flooding your street. You want to tell everyone in your city about it so they can avoid that area. **Community Reporting** is like a "Flood Alert App" where people can take a photo, mark where the flood is on a map, and share it with everyone!

---

## 🎯 The Big Picture

```
┌─────────────────────────────────────────────────────────────┐
│                    FloodSense App                            │
│                                                              │
│  📱 Users Report Floods  →  💾 Server Saves It  →  🗺️ Everyone Sees It  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📖 The Story: How a Flood Report Works

### Act 1: A User Sees a Flood 🌧️

```
        👤 User
         |
         | Sees water on the street!
         ↓
    📱 Opens App
         |
         | Clicks "Report Flood"
         ↓
   📝 Fills Out Form
```

**What the user does:**
1. Takes 1-3 photos of the flood 📸
2. Picks the location on a map 📍
3. Says how deep the water is: Ankle? Knee? Waist? Chest? 🌊
4. Says if cars can pass: "Safe", "Only Big Trucks", or "No Way!" 🚗❌
5. Writes extra details (optional) 📝
6. Clicks "SUBMIT" ✅

---

### Act 2: The App Checks Everything ✅

```
   📱 User's Phone
         |
         | Sends report over internet
         ↓
   🖥️ Server (Computer that runs the app)
         |
         | ⚠️ CHECKPOINT 1: Is user logged in?
         ↓
         | ⚠️ CHECKPOINT 2: Did they just submit? (Wait 3 minutes!)
         ↓
         | ⚠️ CHECKPOINT 3: Are photos too big? (Max 5MB each)
         ↓
         | ⚠️ CHECKPOINT 4: Did they fill everything?
         ↓
         | ✅ Everything looks good!
         ↓
   💾 Save to Database
```

**The Server's Job (Like a Guard at the Door):**
- **Authentication Check**: "Show me your ID card!" (Are you logged in?)
- **Rate Limit Check**: "You just reported 2 minutes ago! Wait 1 more minute." (Prevents spam)
- **File Check**: "These photos are too big!" (Max 5MB per photo)
- **Data Check**: "You forgot to pick a location!" (Make sure everything is filled)

---

### Act 3: The Report Gets a Score! 🎯

The computer automatically decides how dangerous the flood is:

```
IF water is at CHEST level  OR  cars can't pass
    ↓
   🔴 CRITICAL - Very Dangerous!

ELSE IF water is at WAIST level  OR  only heavy vehicles
    ↓
   🟠 HIGH - Dangerous!

ELSE IF water is at KNEE level
    ↓
   🟡 MEDIUM - Be Careful!

ELSE (water is at ANKLE level)
    ↓
   🟢 LOW - Not too bad, but still flooding
```

---

### Act 4: Tell Everyone! 📢

```
   💾 Database (Saved)
         |
         | Sends signal "NEW REPORT!"
         ↓
   📡 WebSocket (Like a Megaphone)
         |
         ├──→ 📱 User 1's Phone - *Updates!*
         ├──→ 📱 User 2's Phone - *Updates!*
         └──→ 📱 User 3's Phone - *Updates!*
```

**Real-Time Magic**: When someone submits a report, everyone else's app automatically updates without refreshing! It's like magic, but it's actually **WebSocket** technology.

---

### Act 5: Admin Checks It 👮

```
   📝 Report Status: "UNVERIFIED" (Yellow)
         |
         | Admin looks at the photo and info
         ↓
    ┌─────────┴─────────┐
    ↓                   ↓
  ✅ VALIDATED       ❌ REJECTED
  (Green Badge)      (Red Badge)
  "This is real!"    "This is fake!"
```

**Admin's Job:**
- Look at the photo: Is it a real flood?
- Check the location: Does it make sense?
- **Approve** if real → Shows on map for everyone
- **Reject** if fake → Hidden from public

---

## 🗂️ What Information Gets Collected?

Think of it like filling out a form at the doctor's office:

| Field | What It Means | Example |
|-------|---------------|---------|
| **Reporter** | Who sent it? | You! (Your account) |
| **Barangay** | Which neighborhood? | "Barangay San Miguel" |
| **Depth** | How deep? | "Knee" |
| **Passability** | Can cars pass? | "Only Heavy Vehicles" |
| **Location** | Where exactly? | Coordinates: 121.05°, 14.55° |
| **Address** | Street name | "123 Main Street" |
| **Photos** | Pictures | [photo1.jpg, photo2.jpg] |
| **Description** | Extra details | "Water is rising fast!" |
| **Status** | Is it approved? | UNVERIFIED → VALIDATED |
| **Severity** | How dangerous? | HIGH ⚠️ |

---

## 🏗️ The Tech Stack (What Tools Are Used?)

### Frontend (The Part You See) 📱

```
┌──────────────────────────────┐
│   React Components           │
│                              │
│  1. ReportSubmissionForm.jsx │  ← The form to submit floods
│  2. ReportList.jsx           │  ← Shows all reports
│  3. ReportCard.jsx           │  ← Each report looks like a card
│  4. ReportDetailModal.jsx    │  ← Click a card to see details
└──────────────────────────────┘
```

**Think of it like building blocks:**
- **React** = The toy blocks you use to build the app
- **Components** = Each block is a piece (form, list, card)
- **Tailwind CSS** = The paint and decorations to make it pretty

---

### Backend (The Hidden Part) 🖥️

```
┌──────────────────────────────┐
│   Server Files               │
│                              │
│  1. reports.js               │  ← Handles report requests
│  2. Report.js (Model)        │  ← Describes what a report looks like
│  3. auth.js (Middleware)     │  ← Checks if you're logged in
│  4. rateLimiting.js          │  ← Prevents spam
└──────────────────────────────┘
```

**Think of it like a restaurant:**
- **Routes (reports.js)** = The menu (what you can order)
- **Model (Report.js)** = The recipe (how to make a report)
- **Middleware (auth.js)** = The waiter (checks your order)
- **Database (MongoDB)** = The kitchen (where food is cooked/stored)

---

## 🎬 The Complete Journey - Step by Step

### Step 1: User Opens the App
```
User → Clicks "Submit Report" Button → Form appears
```

### Step 2: User Fills the Form
```
User fills:
  - Takes photos (1-3 pictures)
  - Picks location on map
  - Selects depth: "Knee"
  - Selects passability: "Heavy Only"
  - Writes description: "Water rising fast!"
```

### Step 3: User Clicks Submit
```
Form → Creates a package (FormData) → Sends to server
```

**The Package Contains:**
```
┌─────────────────────────────┐
│  FormData Package           │
├─────────────────────────────┤
│  depth: "Knee"              │
│  passability: "HeavyOnly"   │
│  latitude: 14.5547          │
│  longitude: 121.0244        │
│  address: "123 Main St"     │
│  barangay: "San Miguel"     │
│  description: "Rising fast!"│
│  photos: [file1, file2]     │
└─────────────────────────────┘
```

### Step 4: Server Receives the Package
```
Server receives package → Runs checkpoints:

✅ Checkpoint 1: User logged in? YES
✅ Checkpoint 2: Waited 3 minutes? YES
✅ Checkpoint 3: Photos under 5MB? YES
✅ Checkpoint 4: All fields filled? YES

→ All checkpoints passed! Continue...
```

### Step 5: Server Saves Photos
```
Photos → Renamed to unique names → Saved to /uploads/ folder

Example:
  "flood.jpg" → "report-1234567890-abc123.jpg"
```

### Step 6: Server Calculates Severity
```
Computer thinks:
  - Depth is "Knee" = Medium risk
  - Passability is "HeavyOnly" = High risk
  
  Highest risk wins → Severity = HIGH 🟠
```

### Step 7: Server Saves to Database
```
Database (MongoDB) stores:
{
  reporter: "user123",
  barangay: "San Miguel",
  depth: "Knee",
  passability: "HeavyOnly",
  location: { coordinates: [121.0244, 14.5547] },
  photos: ["report-1234567890-abc123.jpg", "report-1234567890-xyz789.jpg"],
  severity: "HIGH",
  status: "UNVERIFIED",
  createdAt: "2026-03-29 12:00:00"
}
```

### Step 8: Server Broadcasts to Everyone
```
Server → Sends signal via WebSocket:
  "NEW REPORT in San Miguel!"

All users' apps → Automatically update:
  📱 User A sees new report
  📱 User B sees new report
  📱 User C sees new report
```

### Step 9: Report Appears on Map & Feed
```
🗺️ Map View → New pin appears at location
📜 Feed View → New card appears at top of list
```

### Step 10: Admin Validates
```
Admin opens report → Reviews photo & info
  → Clicks "VALIDATE"
  → Status changes: UNVERIFIED → VALIDATED ✅
  → Everyone sees it's now verified!
```

---

## 🔄 The Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      USER'S PHONE                            │
│                                                              │
│  [Camera] → Take Photo                                       │
│  [Map] → Pick Location                                       │
│  [Form] → Fill Details                                       │
│  [Button] → Submit                                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP POST /api/reports
                       │ (Sends data over internet)
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                      SERVER                                  │
│                                                              │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐        │
│  │   Auth     │ → │  Rate      │ → │   Upload   │        │
│  │   Check    │    │  Limiter   │    │   Photos   │        │
│  └────────────┘    └────────────┘    └────────────┘        │
│         ↓                                                    │
│  ┌────────────────────────────────────────┐                 │
│  │      Save to Database (MongoDB)        │                 │
│  │  - Location coordinates                │                 │
│  │  - Depth, passability                  │                 │
│  │  - Photos, description                 │                 │
│  │  - Auto-calculate severity             │                 │
│  └────────────────────────────────────────┘                 │
│         ↓                                                    │
│  ┌────────────────────────────────────────┐                 │
│  │      Broadcast via WebSocket           │                 │
│  │  - Notify all connected users          │                 │
│  │  - Update map in real-time             │                 │
│  └────────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
                       │
                       │ WebSocket Event
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                   ALL USERS' PHONES                          │
│                                                              │
│  📱 User A → Auto-refresh → Sees new report                  │
│  📱 User B → Auto-refresh → Sees new report                  │
│  📱 User C → Auto-refresh → Sees new report                  │
│                                                              │
│  🗺️ Map updates with new pin                                 │
│  📜 Feed shows new report card at top                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Files You Need to Learn

### 🎨 Frontend Files (What Users See)

#### 1. **ReportSubmissionForm.jsx** - The Form to Submit Floods
```javascript
Location: client/src/components/reports/ReportSubmissionForm.jsx
What it does: Shows the form where users upload photos and details
Key concepts to learn:
  - React hooks (useState, useEffect)
  - Form handling
  - File uploads
  - FormData API
```

#### 2. **ReportList.jsx** - Shows All Reports
```javascript
Location: client/src/components/reports/ReportList.jsx
What it does: Displays all flood reports in a grid
Key concepts to learn:
  - Mapping arrays to components
  - Pagination (Load More button)
  - Conditional rendering
```

#### 3. **ReportCard.jsx** - Individual Report Display
```javascript
Location: client/src/components/reports/ReportCard.jsx
What it does: Each flood report looks like a card
Key concepts to learn:
  - Component props
  - CSS styling with Tailwind
  - Click handlers
```

#### 4. **ReportDetailModal.jsx** - Popup with Full Details
```javascript
Location: client/src/components/reports/ReportDetailModal.jsx
What it does: When you click a card, shows full details in a popup
Key concepts to learn:
  - Modals/Popups
  - Conditional rendering
  - Image galleries
```

#### 5. **useReports.js** - Data Fetching Hook
```javascript
Location: client/src/hooks/useReports.js
What it does: Fetches reports from server automatically
Key concepts to learn:
  - React Query (data fetching library)
  - Custom hooks
  - API calls
```

---

### 🖥️ Backend Files (The Hidden Magic)

#### 1. **reports.js** - The Route Handler
```javascript
Location: server/src/routes/reports.js
What it does: Receives requests from users and responds
Key concepts to learn:
  - Express.js routes (GET, POST, PATCH, DELETE)
  - Middleware (authentication, rate limiting)
  - Error handling
  - File uploads with Multer
```

**Main Routes:**
```javascript
POST   /api/reports          → Create new report
GET    /api/reports          → Get all reports
GET    /api/reports/:id      → Get specific report
PATCH  /api/reports/:id      → Update report
DELETE /api/reports/:id      → Delete report
PATCH  /api/reports/:id/validate → Admin approves
PATCH  /api/reports/:id/reject   → Admin rejects
```

#### 2. **Report.js** - The Blueprint
```javascript
Location: server/src/models/Report.js
What it does: Defines what a report looks like in the database
Key concepts to learn:
  - MongoDB schemas (Mongoose)
  - Data types (String, Number, Date, etc.)
  - Validation rules
  - Indexes for fast searches
```

**Report Blueprint:**
```javascript
{
  reporter: User ID,
  barangay: String (max 100 chars),
  depth: "Ankle" | "Knee" | "Waist" | "Chest",
  passability: "Passable" | "HeavyOnly" | "NotPassable",
  location: {
    type: "Point",
    coordinates: [longitude, latitude],
    address: String
  },
  photos: [String],
  description: String (max 1000 chars),
  status: "UNVERIFIED" | "VALIDATED" | "REJECTED",
  severity: "Low" | "Medium" | "High" | "Critical"
}
```

#### 3. **auth.js** - The Security Guard
```javascript
Location: server/src/middleware/auth.js
What it does: Checks if users are logged in before allowing actions
Key concepts to learn:
  - JWT (JSON Web Tokens)
  - Middleware functions
  - Authentication vs Authorization
```

#### 4. **rateLimiting.js** - The Spam Blocker
```javascript
Location: server/src/middleware/rateLimiting.js
What it does: Prevents users from submitting too many reports too fast
Key concepts to learn:
  - Rate limiting
  - Time calculations
  - Middleware
```

---

## 🎓 Learning Path - Start Here!

### Level 1: Beginner (Start Here!)
```
1. Learn HTML/CSS/JavaScript basics
   └─ You need to understand the building blocks

2. Learn React basics
   └─ How to create components and display data

3. Study ReportCard.jsx
   └─ It's simple: just displays data in a pretty card
```

### Level 2: Intermediate
```
1. Learn about Forms in React
   └─ Study ReportSubmissionForm.jsx

2. Learn about APIs (GET, POST requests)
   └─ Study reports.service.js

3. Learn Node.js and Express basics
   └─ Study the server structure
```

### Level 3: Advanced
```
1. Learn MongoDB and Mongoose
   └─ Study Report.js model

2. Learn about Authentication (JWT)
   └─ Study auth.js middleware

3. Learn WebSockets for real-time updates
   └─ Study SocketContext.jsx

4. Learn about file uploads
   └─ Study Multer configuration in reports.js
```

---

## 🔑 Key Concepts Explained Simply

### 1. **API (Application Programming Interface)**
Think of it like a restaurant menu:
- Menu shows what you can order (GET reports, POST report, etc.)
- You tell the waiter what you want (send request)
- Kitchen makes it (server processes)
- Waiter brings food (server sends response)

### 2. **Database (MongoDB)**
Think of it like a huge filing cabinet:
- Each drawer = Collection (e.g., "Reports" collection)
- Each folder = Document (one flood report)
- Papers inside = Fields (depth, location, photos, etc.)

### 3. **WebSocket**
Think of it like a walkie-talkie:
- Regular internet = Mailman (you send letter, wait for response)
- WebSocket = Walkie-talkie (instant two-way communication)
- Server can "push" updates to your phone without you asking!

### 4. **Middleware**
Think of it like security checkpoints at an airport:
- Checkpoint 1: Check your ticket (authentication)
- Checkpoint 2: Check your baggage (rate limiting)
- Checkpoint 3: Scan for prohibited items (validation)
- Only then → You board the plane (action is performed)

### 5. **React Components**
Think of it like LEGO blocks:
- Each component = One LEGO piece
- You combine pieces to build the app
- Example: ReportCard + ReportList = Full feed of reports

### 6. **JWT (JSON Web Token)**
Think of it like a wristband at an amusement park:
- You buy a ticket → Get a wristband
- Wristband = JWT token
- Show wristband → Guards let you in (authentication)
- No wristband → Can't enter (access denied)

---

## 🐛 Common Errors & What They Mean

### Error 1: "Authentication Required"
```
❌ Problem: You're not logged in
✅ Solution: Login first, then try again
```

### Error 2: "Rate Limit Exceeded"
```
❌ Problem: You submitted a report less than 3 minutes ago
✅ Solution: Wait 3 minutes, then try again
```

### Error 3: "File Too Large"
```
❌ Problem: Your photo is bigger than 5MB
✅ Solution: Compress the image or use a smaller photo
```

### Error 4: "Location Required"
```
❌ Problem: You forgot to pick a location on the map
✅ Solution: Click on the map to mark where the flood is
```

### Error 5: "Invalid Depth and Passability Combination"
```
❌ Problem: You said water is at "Chest" level but cars can pass
✅ Solution: That doesn't make sense! If water is chest-high, cars can't pass
```

---

## 🎯 Quick Reference

### Severity Calculation Chart
```
┌─────────────┬──────────────────┬──────────────┐
│   Depth     │   Passability    │   Severity   │
├─────────────┼──────────────────┼──────────────┤
│   Chest     │   Any            │   🔴 CRITICAL│
│   Any       │   Not Passable   │   🔴 CRITICAL│
│   Waist     │   Heavy Only     │   🟠 HIGH    │
│   Waist     │   Passable       │   🟠 HIGH    │
│   Knee      │   Any            │   🟡 MEDIUM  │
│   Ankle     │   Passable       │   🟢 LOW     │
└─────────────┴──────────────────┴──────────────┘
```

### Report Status Lifecycle
```
📝 UNVERIFIED (Yellow) - Just submitted, waiting for admin
              ↓
    Admin checks it...
              ↓
    ┌─────────┴─────────┐
    ↓                   ↓
✅ VALIDATED         ❌ REJECTED
  (Green)             (Red)
  Shows on map        Hidden from public
```

---

## 🎮 Try It Yourself!

### Mini-Project 1: Read a Report Card
```
1. Open: client/src/components/reports/ReportCard.jsx
2. Find where it displays the depth (hint: look for "depth")
3. Find where it shows the photo (hint: look for "img" tag)
4. Try to understand how it colors the severity badge
```

### Mini-Project 2: Trace a Report Submission
```
1. Start: User clicks submit in ReportSubmissionForm.jsx
2. Follow: Where does it send the data? (Look for API call)
3. Jump to server: server/src/routes/reports.js (POST route)
4. Follow: Where does it save? (Look for Report.create)
5. End: Report.js model saves to database
```

### Mini-Project 3: Understand Real-Time Updates
```
1. Open: client/src/contexts/SocketContext.jsx
2. Find: Where it listens for 'new-report' event
3. Trace: What happens when a new report arrives?
4. Result: Understand how your app updates without refreshing!
```

---

## 🎉 Congratulations!

You now understand how the Community Reporting system works in FloodSense! 

**Remember:**
- Users submit flood reports with photos and location
- Server checks everything and saves it
- Everyone sees it in real-time
- Admins verify if it's real or fake

**Keep Learning:**
- Start with the simple files (ReportCard.jsx)
- Practice with small changes
- Ask questions when stuck
- Build your own mini-project!

---

## 📖 Glossary (Big Words Explained)

- **API**: A way for your app to talk to the server
- **Authentication**: Proving you're logged in
- **Backend**: The server (computer that stores data)
- **Component**: A reusable piece of the user interface
- **Database**: Where all the reports are stored
- **Frontend**: The part of the app you see and touch
- **Middleware**: Code that runs before the main action (like a checkpoint)
- **Rate Limiting**: Preventing spam by limiting how often you can do something
- **Real-Time**: Updates happen instantly without refreshing
- **Route**: A path in the API (like /api/reports)
- **Schema**: A blueprint of what data looks like
- **WebSocket**: Technology for instant two-way communication
- **Validation**: Checking if data is correct before saving

---

**Made with ❤️ for learning!** 🚀
