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
      description: 'Get recent validated flood reports. Can filter by barangay. Returns flood depth, road passability, location, and time.',
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
            type: 'string',
            description: 'Specific sensor ID to check (optional). If not provided, returns all active sensors with latest readings.'
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
  }
];

/**
 * Execute a tool call and return the result.
 * @param {string} toolName - The name of the tool to execute
 * @param {object} args - The arguments from the AI model
 * @returns {string} JSON string of the result
 */
export async function executeTool(toolName, args) {
  try {
    switch (toolName) {
      case 'queryEvacuationCenters':
        return await handleQueryEvacuationCenters(args);
      case 'queryEmergencyFacilities':
        return await handleQueryEmergencyFacilities(args);
      case 'queryRecentReports':
        return await handleQueryRecentReports(args);
      case 'querySensorStatus':
        return await handleQuerySensorStatus(args);
      case 'queryFallbackPlaces':
        return await handleQueryFallbackPlaces(args);
      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    }
  } catch (error) {
    console.error(`[ChatTools] Error executing ${toolName}:`, error);
    return JSON.stringify({
      error: 'Failed to retrieve data. Please try again.',
      details: error.message
    });
  }
}

// ─── Tool Handlers ──────────────────────────────────────────────

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
      capacity: c.capacity || 'Not specified',
      contact: c.contactInfo?.phone || 'Not available',
      email: c.contactInfo?.email || null,
      operatingHours: c.operatingHours || 'Not specified',
      notes: c.notes || null,
      coordinates: c.location?.coordinates
        ? { lat: c.location.coordinates[1], lng: c.location.coordinates[0] }
        : null
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
      contact: f.contactInfo?.phone || 'Not available',
      operatingHours: f.operatingHours || 'Not specified',
      notes: f.notes || null,
      coordinates: f.location?.coordinates
        ? { lat: f.location.coordinates[1], lng: f.location.coordinates[0] }
        : null
    }))
  });
}

async function handleQueryRecentReports({ barangay, limit = 5 }) {
  const safeLimit = Math.min(Math.max(1, limit), 10);

  const query = { status: 'VALIDATED' };
  if (barangay) query.barangay = new RegExp(barangay, 'i');

  const reports = await Report.find(query)
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .populate('reporter', 'name')
    .lean();

  if (reports.length === 0) {
    return JSON.stringify({
      found: 0,
      message: barangay
        ? `No validated flood reports found in ${barangay} recently.`
        : 'No validated flood reports found recently.'
    });
  }

  return JSON.stringify({
    found: reports.length,
    reports: reports.map(r => ({
      barangay: r.barangay,
      depth: r.depth,
      passability: r.passability,
      description: r.description || 'No description',
      address: r.location?.address || 'Not specified',
      reportedBy: r.reporter?.name || 'Community member',
      reportedAt: r.createdAt,
      coordinates: r.location?.coordinates
        ? { lat: r.location.coordinates[1], lng: r.location.coordinates[0] }
        : null
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

  // Get latest reading for each sensor
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
              timestamp: latest.timestamp,
              minutesAgo: Math.round((Date.now() - new Date(latest.timestamp).getTime()) / 60000)
            }
          : { message: 'No readings available' },
        coordinates: sensor.latitude && sensor.longitude
          ? { lat: sensor.latitude, lng: sensor.longitude }
          : null
      };
    })
  );

  return JSON.stringify({
    found: sensorData.length,
    sensors: sensorData
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
      contact: p.contactInfo?.phone || null,
      notes: p.notes || null,
      coordinates: p.location?.coordinates
        ? { lat: p.location.coordinates[1], lng: p.location.coordinates[0] }
        : null
    }))
  });
}
