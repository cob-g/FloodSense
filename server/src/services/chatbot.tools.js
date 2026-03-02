/**
 * Chatbot Tool Functions
 * These are the actual database queries the AI can invoke via function calling.
 * Each function queries existing MongoDB collections using existing Mongoose models.
 * NO new collections or indexes are created.
 */

import FallbackPlace from '../models/FallbackPlace.js';
import Report from '../models/Report.js';
import Sensor from '../models/Sensor.js';
import SensorData from '../models/SensorData.js';

// ─── Tool Result Cache ──────────────────────────────────────────
// Short-lived cache (30s TTL) to avoid redundant DB queries within the same
// conversation turn or rapid repeated questions. Safe because flood data
// doesn't change second-by-second.
const toolCache = new Map();
const TOOL_CACHE_TTL = 30 * 1000; // 30 seconds

function getCacheKey(toolName, args) {
  return `${toolName}:${JSON.stringify(args)}`;
}

function getCached(key) {
  const entry = toolCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > TOOL_CACHE_TTL) {
    toolCache.delete(key);
    return null;
  }
  return entry.value;
}

function setCache(key, value) {
  toolCache.set(key, { value, ts: Date.now() });
}

// Periodic cleanup every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of toolCache) {
    if (now - entry.ts > TOOL_CACHE_TTL) toolCache.delete(key);
  }
}, 2 * 60 * 1000);

/**
 * Tool definitions for Groq function calling.
 * These are sent to the model so it knows what tools are available.
 */
export const toolDefinitions = [
  {
    type: 'function',
    function: {
      name: 'queryEvacuationCenters',
      description: 'Find evacuation centers, optionally filtered by barangay name. Returns name, barangay, capacity, contact info, and coordinates.',
      parameters: {
        type: 'object',
        properties: {
          barangay: {
            type: 'string',
            description: 'The barangay name to filter by (optional). If not provided, returns all evacuation centers.'
          }
        },
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'queryEmergencyFacilities',
      description: 'Find emergency facilities like hospitals, government offices, and evacuation centers, optionally filtered by barangay.',
      parameters: {
        type: 'object',
        properties: {
          barangay: {
            type: 'string',
            description: 'The barangay name to filter by (optional).'
          }
        },
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'queryRecentReports',
      description: 'Get recent validated flood reports from the live map. Can filter by barangay. Returns flood depth, road passability, location, time, riskScore/riskLevel per report, AND two counts: totalValidatedReports (GLOBAL total across ALL barangays on the live map — always use this when user asks how many reports total) and filteredCount (count for the filtered barangay only). When user asks for total/overall count, ALWAYS use totalValidatedReports. For riskiest/safest on the list, use riskScore/riskLevel from this tool output. IMPORTANT: If user says "my area" or "my barangay", use the logged-in user barangay filter only (never global total). If there are zero reports for that barangay, return no-data honestly. When the user refers to "that list", "those N reports", "among the recent validated", "which one on the list" — call this tool with NO barangay argument. Never inject a barangay from conversation history unless the user explicitly types the barangay name in their current message.',
      parameters: {
        type: 'object',
        properties: {
          barangay: {
            type: 'string',
            description: 'The barangay name to filter by (optional).'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of reports to return (default: 5, max: 10).'
          }
        },
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'querySensorStatus',
      description: 'Get the latest water level sensor readings. Returns sensor location, distance reading (water level), and timestamp.',
      parameters: {
        type: 'object',
        properties: {
          sensorId: {
            anyOf: [{ type: 'string' }, { type: 'null' }],
            description: 'Specific sensor ID to check (optional). If not provided or null, returns all active sensors with latest readings.'
          }
        },
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'queryFallbackPlaces',
      description: 'Find places/facilities by category and barangay. Categories include: evacuation_center, hospital, school, government, landmark, bridge, road, other.',
      parameters: {
        type: 'object',
        properties: {
          barangay: {
            type: 'string',
            description: 'The barangay name to filter by (optional).'
          },
          category: {
            type: 'string',
            enum: ['evacuation_center', 'hospital', 'school', 'government', 'landmark', 'bridge', 'road', 'other'],
            description: 'The category of place to search for (optional).'
          }
        },
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'queryUserReports',
      description: 'Get the status of the current logged-in user\'s own flood reports. ALWAYS call this tool when the user asks about their report status, their submissions, or "what happened to my report". Shows submission date, current status (UNVERIFIED/VALIDATED/REJECTED), and admin feedback.',
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Maximum number of reports to return (default: 5, max: 10).'
          }
        },
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'queryAreaRisk',
      description: 'Assess current flood risk level in a barangay based on recent validated reports and sensor readings. Returns risk level (SAFE/LOW/MEDIUM/HIGH/CRITICAL) with explanation.',
      parameters: {
        type: 'object',
        properties: {
          barangay: {
            type: 'string',
            description: 'The barangay name to assess flood risk for.'
          }
        },
        required: ['barangay']
      }
    }
  }
];

/**
 * Execute a tool call and return the result.
 * @param {string} toolName - The name of the tool to execute
 * @param {object} args - The arguments from the AI model
 * @param {object|null} user - The authenticated user object (for user-specific queries)
 * @returns {string} JSON string of the result
 */
export async function executeTool(toolName, args, user = null) {
  try {
    // User-specific queries bypass cache (different results per user)
    const isUserSpecific = toolName === 'queryUserReports';
    const cacheKey = isUserSpecific ? null : getCacheKey(toolName, args);

    if (cacheKey) {
      const cached = getCached(cacheKey);
      if (cached) {
        console.log(`[ChatTools] Cache hit for ${toolName}`);
        return cached;
      }
    }

    let result;
    switch (toolName) {
      case 'queryEvacuationCenters':
        result = await handleQueryEvacuationCenters(args);
        break;
      case 'queryEmergencyFacilities':
        result = await handleQueryEmergencyFacilities(args);
        break;
      case 'queryRecentReports':
        result = await handleQueryRecentReports(args);
        break;
      case 'querySensorStatus':
        result = await handleQuerySensorStatus(args);
        break;
      case 'queryFallbackPlaces':
        result = await handleQueryFallbackPlaces(args);
        break;
      case 'queryUserReports':
        result = await handleQueryUserReports(args, user);
        break;
      case 'queryAreaRisk':
        result = await handleQueryAreaRisk(args);
        break;
      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    }

    if (cacheKey) setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`[ChatTools] Error executing ${toolName}:`, error);
    return JSON.stringify({
      error: 'Failed to retrieve data. Please try again.',
      details: error.message
    });
  }
}

// ─── Tool Handlers ──────────────────────────────────────────────

/**
 * Format a date to Philippine Standard Time (UTC+8) in a human-readable format.
 * e.g. "Feb 22, 2026, 11:11 AM"
 */
function toPST(date) {
  if (!date) return null;
  return new Date(date).toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}


function depthLabel(depth) {
  const labels = {
    Ankle: 'Ankle-deep (CAUTION: slippery, strong currents possible)',
    Knee: 'Knee-deep (DANGEROUS: difficult to walk, avoid if possible)',
    Waist: 'Waist-deep (VERY DANGEROUS: high risk of being swept away)',
    Chest: 'Chest-deep (LIFE-THREATENING: evacuate immediately)'
  };
  return labels[depth] || depth;
}

function passabilityLabel(passability) {
  const labels = {
    Passable: 'Passable - road can be used with caution',
    HeavyOnly: 'Heavy vehicles only - unsuitable for regular vehicles',
    NotPassable: 'NOT PASSABLE - road is too dangerous to cross'
  };
  return labels[passability] || passability;
}

function reportRiskScore(report) {
  const depthScores = {
    Ankle: 1,
    Knee: 2,
    Waist: 3,
    Chest: 4
  };
  const passabilityScores = {
    Passable: 0,
    HeavyOnly: 1,
    NotPassable: 2
  };

  return (depthScores[report.depth] || 0) + (passabilityScores[report.passability] || 0);
}

function reportRiskLevel(score) {
  if (score >= 6) return 'CRITICAL';
  if (score >= 4) return 'HIGH';
  if (score >= 3) return 'MEDIUM';
  return 'LOW';
}

async function handleQueryEvacuationCenters({ barangay }) {
  const query = { category: 'evacuation_center', isActive: true };
  if (barangay) query.barangay = new RegExp(barangay, 'i');

  const centers = await FallbackPlace.find(query)
    .sort({ priority: -1, capacity: -1 })
    .limit(10)
    .lean();

  if (centers.length === 0) {
    return JSON.stringify({
      found: 0,
      message: barangay
        ? `No evacuation centers registered in ${barangay}. Contact your barangay DRRM officer for evacuation information.`
        : 'No evacuation centers have been registered in the system yet.'
    });
  }

  return JSON.stringify({
    found: centers.length,
    evacuationCenters: centers.map(c => ({
      name: c.name,
      barangay: c.barangay,
      capacity: c.capacity || 'N/A',
      contact: c.contactInfo?.phone || 'N/A',
      notes: c.notes || null
    }))
  });
}

async function handleQueryEmergencyFacilities({ barangay }) {
  const query = {
    category: { $in: ['hospital', 'government', 'evacuation_center'] },
    isActive: true
  };
  if (barangay) query.barangay = new RegExp(barangay, 'i');

  const facilities = await FallbackPlace.find(query)
    .sort({ priority: -1, category: 1 })
    .limit(15)
    .lean();

  if (facilities.length === 0) {
    return JSON.stringify({
      found: 0,
      message: barangay
        ? `No emergency facilities registered in ${barangay}.`
        : 'No emergency facilities have been registered yet.'
    });
  }

  return JSON.stringify({
    found: facilities.length,
    facilities: facilities.map(f => ({
      name: f.name,
      category: f.category.replace('_', ' '),
      barangay: f.barangay,
      contact: f.contactInfo?.phone || 'N/A'
    }))
  });
}

async function handleQueryRecentReports({ barangay, limit = 5 }) {
  const safeLimit = Math.min(Math.max(1, limit), 10);

  const query = { status: 'VALIDATED' };
  if (barangay) query.barangay = new RegExp(barangay, 'i');

  // Always fetch global total separately — never filter it by barangay
  const [reports, filteredCount, globalTotal] = await Promise.all([
    Report.find(query).sort({ createdAt: -1 }).limit(safeLimit).lean(),
    Report.countDocuments(query),
    Report.countDocuments({ status: 'VALIDATED' })
  ]);

  if (reports.length === 0) {
    return JSON.stringify({
      found: 0,
      queryScope: barangay ? 'barangay' : 'global',
      scopeBarangay: barangay || null,
      filteredCount: 0,
      totalValidatedReports: globalTotal,
      message: barangay
        ? `No validated flood reports found in ${barangay} recently.`
        : 'No validated flood reports found recently.'
    });
  }

  return JSON.stringify({
    found: reports.length,
    queryScope: barangay ? 'barangay' : 'global',
    scopeBarangay: barangay || null,
    filteredCount,
    totalValidatedReports: globalTotal,
    note: barangay ? `filteredCount is for ${barangay} only. totalValidatedReports is the GLOBAL total across ALL barangays on the live flood map.` : undefined,
    reports: reports.map(r => ({
      riskScore: reportRiskScore(r),
      riskLevel: reportRiskLevel(reportRiskScore(r)),
      barangay: r.barangay,
      address: r.location?.address || null,
      depth: r.depth,
      depthLabel: depthLabel(r.depth),
      passability: r.passability,
      passabilityLabel: passabilityLabel(r.passability),
      description: r.description || '',
      reportedAt: toPST(r.createdAt)
    }))
  });
}

async function handleQuerySensorStatus({ sensorId }) {
  let sensors;

  if (sensorId) {
    sensors = await Sensor.find({ sensorId: new RegExp(sensorId, 'i') }).lean();
  } else {
    sensors = await Sensor.find({}).lean();
  }

  if (sensors.length === 0) {
    return JSON.stringify({
      found: 0,
      message: sensorId
        ? `No sensor found with ID "${sensorId}".`
        : 'No sensors registered in the system.'
    });
  }

  // Get latest reading for each sensor — all in parallel (not sequential)
  const sensorData = await Promise.all(
    sensors.map(async (sensor) => {
      const latest = await SensorData.findOne({ sensorId: sensor.sensorId })
        .sort({ timestamp: -1 })
        .lean();

      return {
        sensorId: sensor.sensorId,
        location: sensor.locationName,
        mountHeight: sensor.mountHeight ? `${sensor.mountHeight} cm` : 'Not set',
        latestReading: latest
          ? {
              distance: `${latest.distance} cm`,
              waterLevel: sensor.mountHeight
                ? `${Math.max(0, sensor.mountHeight - latest.distance)} cm`
                : 'Mount height not configured',
              timestamp: toPST(latest.timestamp),
              minutesAgo: Math.round((Date.now() - new Date(latest.timestamp).getTime()) / 60000)
            }
          : { message: 'No readings available' },
        coordinates: sensor.latitude && sensor.longitude
          ? { lat: sensor.latitude, lng: sensor.longitude }
          : null
      };
    })
  );

  // If every sensor has no readings, return a clear no-data message
  const allNoReadings = sensorData.every(s => !s.latestReading || s.latestReading.message === 'No readings available');
  if (allNoReadings) {
    return JSON.stringify({
      found: 0,
      message: sensorData.length === 1
        ? `Sensor "${sensorData[0].location}" is registered but has no readings yet. No live water level data is available.`
        : `${sensorData.length} sensors are registered but none have any readings yet. No live water level data is available at this time.`
    });
  }

  // Only return sensors that actually have readings
  const sensorsWithReadings = sensorData.filter(s => s.latestReading && s.latestReading.message !== 'No readings available');
  const noReadingCount = sensorData.length - sensorsWithReadings.length;

  return JSON.stringify({
    found: sensorsWithReadings.length,
    sensors: sensorsWithReadings,
    ...(noReadingCount > 0 && { note: `${noReadingCount} sensor(s) have no readings yet.` })
  });
}

async function handleQueryFallbackPlaces({ barangay, category }) {
  const query = { isActive: true };
  if (barangay) query.barangay = new RegExp(barangay, 'i');
  if (category) query.category = category;

  const places = await FallbackPlace.find(query)
    .sort({ priority: -1, name: 1 })
    .limit(15)
    .lean();

  if (places.length === 0) {
    return JSON.stringify({
      found: 0,
      message: 'No places found matching your criteria.'
    });
  }

  return JSON.stringify({
    found: places.length,
    places: places.map(p => ({
      name: p.name,
      category: p.category.replace('_', ' '),
      barangay: p.barangay,
      contact: p.contactInfo?.phone || null
    }))
  });
}

async function handleQueryUserReports({ limit = 5 }, user) {
  if (!user) {
    return JSON.stringify({
      error: 'Authentication required',
      message: 'You need to be logged in to check your report status. Please log in to see your flood reports.'
    });
  }

  const safeLimit = Math.min(Math.max(1, limit), 10);

  const reports = await Report.find({ reporter: user._id })
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();

  if (reports.length === 0) {
    return JSON.stringify({
      found: 0,
      message: 'You haven\'t submitted any flood reports yet. You can submit one from the Feed page!'
    });
  }

  return JSON.stringify({
    found: reports.length,
    reports: reports.map(r => ({
      barangay: r.barangay,
      depth: r.depth,
      depthLabel: depthLabel(r.depth),
      passability: r.passability,
      passabilityLabel: passabilityLabel(r.passability),
      description: r.description || 'No description',
      status: r.status,
      submittedAt: toPST(r.createdAt),
      lastUpdated: toPST(r.updatedAt),
      validationNotes: r.validationNotes || null,
      validatedAt: r.validatedAt ? toPST(r.validatedAt) : null,
      address: r.location?.address || 'Not specified'
    }))
  });
}

async function handleQueryAreaRisk({ barangay }) {
  if (!barangay) {
    return JSON.stringify({
      error: 'Barangay required',
      message: 'Please specify which barangay you want to check.'
    });
  }

  // Get recent validated reports (last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentReports = await Report.find({
    barangay: new RegExp(barangay, 'i'),
    status: 'VALIDATED',
    createdAt: { $gte: oneDayAgo }
  })
  .sort({ createdAt: -1 })
  .limit(20)
  .lean();

  // Get sensor readings in the area (last 30 minutes) — parallelized
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
  const sensors = await Sensor.find({
    locationName: new RegExp(barangay, 'i')
  }).lean();

  let highestWaterLevel = 0;
  let activeSensors = 0;

  // Fetch all sensor readings in parallel instead of sequentially
  const sensorReadings = await Promise.all(
    sensors.map(sensor =>
      SensorData.findOne({
        sensorId: sensor.sensorId,
        timestamp: { $gte: thirtyMinsAgo }
      })
      .sort({ timestamp: -1 })
      .lean()
      .then(reading => ({ sensor, reading }))
    )
  );

  for (const { sensor, reading } of sensorReadings) {
    if (reading && sensor.mountHeight) {
      activeSensors++;
      const waterLevel = Math.max(0, sensor.mountHeight - reading.distance);
      if (waterLevel > highestWaterLevel) {
        highestWaterLevel = waterLevel;
      }
    }
  }

  // Risk assessment logic
  let riskLevel = 'SAFE';
  let explanation = '';
  let recommendations = [];

  // Count reports by severity (depth enum values: 'Chest', 'Waist', 'Knee', 'Ankle')
  const criticalReports = recentReports.filter(r =>
    r.depth === 'Chest' || r.depth === 'Waist'
  ).length;
  const moderateReports = recentReports.filter(r =>
    r.depth === 'Knee'
  ).length;
  const minorReports = recentReports.filter(r =>
    r.depth === 'Ankle'
  ).length;

  // Determine risk level
  if (criticalReports >= 2 || highestWaterLevel >= 80) {
    riskLevel = 'CRITICAL';
    explanation = `${barangay} has CRITICAL flood risk right now. ${criticalReports} severe flood reports in the last 24 hours${highestWaterLevel >= 80 ? ` and water sensors show ${highestWaterLevel}cm (chest-deep)` : ''}.`;
    recommendations = [
      'EVACUATE IMMEDIATELY if you\'re in a flood-prone area',
      'Go to higher ground or upper floors',
      'Call 911 if you need emergency assistance',
      'Bring your emergency kit and important documents'
    ];
  } else if (criticalReports >= 1 || moderateReports >= 3 || highestWaterLevel >= 50) {
    riskLevel = 'HIGH';
    explanation = `${barangay} has HIGH flood risk. ${criticalReports + moderateReports} significant flood reports in the last 24 hours${highestWaterLevel >= 50 ? ` and sensors show ${highestWaterLevel}cm water level` : ''}.`;
    recommendations = [
      'Prepare to evacuate - pack your emergency kit',
      'Monitor updates closely',
      'Avoid going out unless necessary',
      'Stay away from low-lying areas'
    ];
  } else if (moderateReports >= 1 || minorReports >= 3 || highestWaterLevel >= 20) {
    riskLevel = 'MEDIUM';
    explanation = `${barangay} has MEDIUM flood risk. ${recentReports.length} flood reports in the last 24 hours${highestWaterLevel >= 20 ? ` and water levels at ${highestWaterLevel}cm` : ''}.`;
    recommendations = [
      'Stay alert and monitor conditions',
      'Keep your emergency kit ready',
      'Avoid unnecessary travel',
      'Check the Feed page for updates'
    ];
  } else if (minorReports >= 1 || highestWaterLevel >= 10) {
    riskLevel = 'LOW';
    explanation = `${barangay} has LOW flood risk. Minor flooding detected${highestWaterLevel >= 10 ? ` with sensors showing ${highestWaterLevel}cm` : ''}.`;
    recommendations = [
      'Be cautious when traveling',
      'Avoid flood-prone streets',
      'Keep monitoring updates'
    ];
  } else {
    riskLevel = 'SAFE';
    explanation = `${barangay} appears SAFE currently. No recent flood reports in the last 24 hours${activeSensors > 0 ? ` and sensors show normal water levels (${highestWaterLevel}cm)` : ''}.`;
    recommendations = [
      'Stay prepared - always keep an emergency kit ready',
      'Monitor weather forecasts',
      'Report any flooding you see on the Feed page'
    ];
  }

  return JSON.stringify({
    barangay,
    riskLevel,
    explanation,
    recommendations,
    dataPoints: {
      reportsLast24h: recentReports.length,
      criticalReports,
      moderateReports,
      minorReports,
      activeSensors,
      highestWaterLevel: highestWaterLevel > 0 ? `${highestWaterLevel} cm` : 'None',
      lastChecked: toPST(new Date())
    }
  });
}
