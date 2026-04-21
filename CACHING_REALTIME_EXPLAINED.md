# 🔄 Caching + Real-Time Updates - How They Work Together

## 🎯 Quick Answer

**Will caching break your 30-second auto-refresh?**
✅ **NO** - If you set the cache TTL (Time To Live) correctly!

The key is matching your cache duration to your refresh intervals.

---

## 📊 Your Current Setup

### What You Have Now:

1. **30-Second Auto-Refresh** (Client-side polling)
   ```javascript
   // LandingPage.jsx & FeedPage.jsx
   useReports({}, {
     refetchInterval: 30000,              // Poll every 30 seconds
     refetchIntervalInBackground: true
   });
   
   useSensors({ withStatus: true }, {
     refetchInterval: 30000,              // Poll every 30 seconds
     refetchIntervalInBackground: true
   });
   ```

2. **WebSocket Real-Time Updates** (Instant)
   ```javascript
   // When new report is created:
   io.emit('new-report', data);          // Instant broadcast
   
   // Client receives and invalidates cache:
   socket.on('new-report', () => {
     queryClient.invalidateQueries(['reports']);  // Triggers immediate refetch
   });
   ```

---

## ⚙️ How to Implement Caching WITHOUT Breaking Real-Time

### Strategy: **Smart Cache TTL Based on Data Type**

```javascript
// ✅ GOOD: Cache duration SHORTER than or EQUAL to refresh interval
// ❌ BAD: Cache duration LONGER than refresh interval
```

---

## 🎯 Recommended Caching Strategy

### 1. **Sensor Data (Real-Time IoT)**

**Cache Duration:** 30 seconds (matches your refresh interval)

```javascript
// server/src/routes/sensors.js

router.get('/with-status', 
  cacheMiddleware(30), // ← Cache for 30 seconds
  async (req, res) => {
    const sensors = await Sensor.find({});
    // ... fetch latest readings ...
    res.json({ success: true, data: sensorsWithStatus });
  }
);
```

**Why 30 seconds?**
- Your frontend polls every 30s
- Sensor is "offline" if no data > 2 minutes
- 30s cache = maximum 3 users hit DB per 30s window
- Still shows sensor updates within 30s (your current behavior)

**Visual:**
```
Time:  0s     30s    60s    90s    120s
       │      │      │      │      │
User A ─┼──────┼──────┼──────┼──────┼─→ Polls every 30s
Cache  ─●──────●──────●──────●──────●─→ Refreshes every 30s
Sensor ─████████████████████████████─→ Sends data continuously

Result: 
- User A @ 0s  → DB query → Cache stores result
- User B @ 5s  → Cache hit (no DB query)
- User C @ 29s → Cache hit (no DB query)
- User A @ 30s → DB query → Cache refreshes
```

**Performance Gain:**
- Before: 100 users × 2 requests/min = 200 DB queries/min
- After: 2 DB queries/min + 198 cache hits
- **100x reduction!**

---

### 2. **Community Reports (User-Generated)**

**Cache Duration:** 15-30 seconds + Invalidation on Create

```javascript
// server/src/routes/reports.js

// GET reports - WITH caching
router.get('/', 
  cacheMiddleware(20), // ← Cache for 20 seconds
  async (req, res) => {
    const reports = await Report.find({ status: 'VALIDATED' })
      .populate('reporter', 'name')
      .limit(100);
    res.json({ success: true, data: reports });
  }
);

// POST new report - INVALIDATE cache
router.post('/', async (req, res) => {
  const report = await Report.create(req.body);
  
  // Invalidate cache so next request gets fresh data
  await redis.del('cache:/api/reports*');
  
  // Also emit WebSocket (for instant updates)
  io.emit('new-report', report);
  
  res.json({ success: true, data: report });
});
```

**Why 20 seconds + invalidation?**
- Cache duration < 30s refresh = always fresh on poll
- When user submits report → cache cleared immediately
- WebSocket listeners get instant update
- Non-WebSocket users get update within 20s (acceptable delay)

---

### 3. **Static Data (Rarely Changes)**

**Cache Duration:** Long (1 hour to 24 hours)

```javascript
// Barangay list (rarely changes)
router.get('/api/barangays', 
  cacheMiddleware(3600), // ← 1 hour
  async (req, res) => {
    const barangays = await Barangay.find({});
    res.json(barangays);
  }
);

// User profiles (changes infrequently)
router.get('/api/users/:id', 
  cacheMiddleware(1800), // ← 30 minutes
  async (req, res) => {
    const user = await User.findById(req.params.id);
    res.json(user);
  }
);
```

---

## 🔥 Best Practice: Layered Caching

### Smart Middleware with Query-Based Keys

```javascript
// server/src/middleware/cache.js
import { createClient } from 'redis';
const redis = createClient({ url: process.env.REDIS_URL });

export const cacheMiddleware = (duration = 60) => {
  return async (req, res, next) => {
    // Create unique key based on URL + query params
    const key = `cache:${req.originalUrl}`;
    
    try {
      // Try to get from cache
      const cached = await redis.get(key);
      
      if (cached) {
        console.log(`✅ Cache HIT: ${key}`);
        return res.json(JSON.parse(cached));
      }
      
      console.log(`❌ Cache MISS: ${key}`);
      
      // Store original res.json
      const originalJson = res.json.bind(res);
      
      // Override res.json to cache response
      res.json = (data) => {
        // Cache the response
        redis.setex(key, duration, JSON.stringify(data))
          .catch(err => console.error('Cache set error:', err));
        
        return originalJson(data);
      };
      
      next();
    } catch (error) {
      console.error('Cache error:', error);
      next(); // Continue without caching on error
    }
  };
};

// Helper to invalidate cache patterns
export const invalidateCache = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🗑️ Invalidated ${keys.length} cache keys`);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
};
```

---

## 🎬 Complete Example: Sensor Endpoint with Caching

```javascript
// server/src/routes/sensors.js
import { cacheMiddleware, invalidateCache } from '../middleware/cache.js';

// GET sensors with status - CACHED
router.get('/with-status', 
  cacheMiddleware(30), // ← 30 seconds cache
  async (req, res) => {
    try {
      const sensors = await Sensor.find({}).lean();
      const now = Date.now();
      
      const sensorsWithStatus = await Promise.all(
        sensors.map(async (sensor) => {
          const last = await SensorData.findOne({ sensorId: sensor.sensorId })
            .sort({ timestamp: -1 })
            .lean();
          
          const online = last?.timestamp 
            ? (now - new Date(last.timestamp).getTime() < 2 * 60 * 1000) 
            : false;
          
          return {
            ...sensor,
            lastReading: last,
            online
          };
        })
      );
      
      res.json({ 
        success: true, 
        count: sensorsWithStatus.length,
        data: sensorsWithStatus 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// POST new sensor reading - INVALIDATE cache
router.post('/sensor-data', async (req, res) => {
  try {
    const newData = await SensorData.create(req.body);
    
    // 1. Invalidate cache (next request will fetch fresh data)
    await invalidateCache('cache:/api/sensors*');
    
    // 2. Emit WebSocket event (instant update for connected clients)
    const io = getIO();
    io.emit('update', { 
      sensorId: newData.sensorId,
      distance: newData.distance,
      timestamp: newData.timestamp 
    });
    
    res.json({ success: true, data: newData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

---

## 📈 Impact Analysis

### Scenario: 100 Users Viewing Map

#### WITHOUT Caching:
```
Every user polls every 30 seconds

Sensors endpoint:
- 100 users × 2 requests/min = 200 DB queries/min
- 200 × 60 = 12,000 queries/hour

Reports endpoint:
- 100 users × 2 requests/min = 200 DB queries/min
- 200 × 60 = 12,000 queries/hour

Total: 24,000 DB queries/hour
Database CPU: High
Response time: 100-300ms
```

#### WITH Caching (30s TTL):
```
Cache refreshes every 30 seconds

Sensors endpoint:
- 2 DB queries/min (cache refresh)
- 198 cache hits/min
- 2 × 60 = 120 queries/hour

Reports endpoint:
- 2 DB queries/min (cache refresh)
- 198 cache hits/min
- 2 × 60 = 120 queries/hour

Total: 240 DB queries/hour (99% reduction!)
Database CPU: Low
Response time: 5-20ms (cache) vs 100-300ms (DB)
```

**Result:**
- ✅ 99% fewer database queries
- ✅ 5-15x faster responses
- ✅ Database can handle 100x more users
- ✅ Still updates every 30 seconds (same as before)
- ✅ WebSocket gives instant updates for new reports

---

## 🔄 How Real-Time + Caching Work Together

### Flow Diagram:

```
┌──────────────────────────────────────────────────────────┐
│          USER SUBMITS NEW FLOOD REPORT                   │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
            POST /api/reports
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
  Save to MongoDB            Invalidate Cache
        │                    (clear /api/reports*)
        │                             │
        ▼                             ▼
   Emit WebSocket             Next GET request
   'new-report'              fetches fresh data
        │                             │
        ▼                             │
┌────────────────────┐               │
│ Connected Clients  │               │
│ (Real-time users)  │               │
└────────┬───────────┘               │
         │                           │
         ▼                           ▼
  Instant update!         Non-WebSocket users get
  (React Query           update on next 30s poll
   invalidates)          (cache is fresh)


Timeline:
─────────────────────────────────────────────────────────→
T=0s   New report submitted
       ├─ WebSocket users: Update in 1s ✅
       └─ Cache: Invalidated immediately
       
T=5s   Non-WebSocket user polls
       ├─ Cache MISS (was invalidated)
       ├─ Fetches from DB → sees new report ✅
       └─ Cache stores for 30s
       
T=10s  Another user polls
       └─ Cache HIT → sees new report ✅
       
T=30s  User polls again
       ├─ Cache expired
       └─ Fresh DB query → sees latest data ✅
```

---

## ⚠️ Common Pitfalls to AVOID

### ❌ BAD: Cache Longer Than Refresh Interval

```javascript
// YOUR FRONTEND polls every 30s
refetchInterval: 30000

// YOUR BACKEND caches for 5 minutes ❌ TOO LONG!
cacheMiddleware(300)

// Result: User sees stale data for up to 5 minutes
// Even though they're polling every 30s!
```

### ❌ BAD: Forget to Invalidate on Create/Update

```javascript
router.post('/api/reports', async (req, res) => {
  await Report.create(req.body);
  // ❌ Forgot to invalidate cache!
  res.json({ success: true });
});

// Result: New report exists in DB but cache still shows old data
```

### ✅ GOOD: Cache <= Refresh Interval + Invalidate

```javascript
// Cache for 30s or less
router.get('/api/reports', cacheMiddleware(30), handler);

// Always invalidate on mutations
router.post('/api/reports', async (req, res) => {
  await Report.create(req.body);
  await invalidateCache('cache:/api/reports*'); // ✅
  io.emit('new-report'); // ✅
  res.json({ success: true });
});
```

---

## 🎯 Recommended Cache Durations

| Data Type | Refresh Rate | Cache TTL | Invalidate On |
|-----------|-------------|-----------|---------------|
| **Sensor readings** | 30s | 30s | New sensor data |
| **Validated reports** | 30s | 20-30s | New/updated report |
| **All reports (admin)** | 30s | 15s | Any report change |
| **User profile** | - | 30min | User update |
| **Barangay list** | - | 1 hour | Barangay CRUD |
| **Static assets** | - | 24 hours | Never (rarely changes) |

---

## 🚀 Implementation Checklist

- [ ] Install Redis: `npm install redis`
- [ ] Create cache middleware with TTL parameter
- [ ] Add cache invalidation helper function
- [ ] Set cache duration ≤ frontend refresh interval
- [ ] Invalidate cache on POST/PATCH/DELETE operations
- [ ] Keep WebSocket events (for instant updates)
- [ ] Keep 30s polling (for reliability)
- [ ] Test: Submit report → Check cache invalidated
- [ ] Test: Multiple users → Verify cache hits
- [ ] Monitor: Check cache hit ratio (aim for >90%)

---

## 💡 Pro Tips

### 1. **Cache Hit Ratio Monitoring**
```javascript
// Log cache performance
let hits = 0, misses = 0;

setInterval(() => {
  const ratio = hits / (hits + misses) * 100;
  console.log(`Cache hit ratio: ${ratio.toFixed(2)}%`);
  hits = 0; misses = 0;
}, 60000);
```

### 2. **Conditional Caching**
```javascript
// Don't cache if user is admin (they need real-time data)
export const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    if (req.user?.role === 'ADMIN') {
      return next(); // Skip cache for admins
    }
    // ... normal caching logic
  };
};
```

### 3. **Stale-While-Revalidate Pattern**
```javascript
// Return cached data immediately, refresh in background
const cached = await redis.get(key);
if (cached) {
  res.json(JSON.parse(cached));
  
  // Refresh cache in background
  fetchFreshData().then(data => {
    redis.setex(key, duration, JSON.stringify(data));
  });
  return;
}
```

---

## 📊 Summary

### Your 30-Second Auto-Refresh + Caching = Perfect Match! ✅

**Before Caching:**
```
User polls → DB query → 200ms response
(12,000 DB hits/hour with 100 users)
```

**After Caching (30s TTL):**
```
User polls → Cache hit → 5ms response
(120 DB hits/hour with 100 users)
```

**Real-Time Still Works:**
- WebSocket gives instant updates to connected users
- Cache invalidation ensures next poll sees fresh data
- 30s cache = same behavior as your current 30s refresh
- Non-WebSocket users see updates within 30s maximum

**Bottom Line:**
✅ Caching makes your app 100x faster  
✅ Real-time updates still instant via WebSocket  
✅ 30-second refresh still works perfectly  
✅ Users won't notice any difference in freshness  
✅ Your database can handle 100x more traffic  

**It's a win-win!** 🎉
