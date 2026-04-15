import express from 'express';
import SensorData from '../models/SensorData.js';
import Report from '../models/Report.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function formatDate(dt) {
  return dt.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}
function formatRange(start, end) {
  return `${formatDate(start)} – ${formatDate(end)}`;
}
function formatAllTimeRange(start, end) {
  if (!start) return `All time – ${formatDate(end)}`;
  return `All time (from ${formatDate(start)}) – ${formatDate(end)}`;
}
function toISODate(d) {
  const x = new Date(d);
  x.setHours(0,0,0,0);
  return x.toISOString().slice(0,10);
}

function computePercentChange(curr, prev) {
  if (!Number.isFinite(prev) || prev === 0) return null;
  return ((curr - prev) / prev) * 100;
}

// Reusable weekly report builder used by API and export endpoints
async function buildWeeklyReport(query, user) {
  const now = new Date();
  let { start, end, barangay, communityScope = 'weekly' } = query;
  const normalizedCommunityScope = String(communityScope).toLowerCase() === 'all-time' ? 'all-time' : 'weekly';
  const hasExplicitStart = typeof start === 'string' && start.trim().length > 0;
  const hasExplicitEnd = typeof end === 'string' && end.trim().length > 0;
  const warnThreshold = Number(query.warnThresholdCm ?? process.env.SENSOR_ALERT_THRESHOLD_CM ?? 50);
  const critThreshold = Number(query.critThresholdCm ?? process.env.SENSOR_CRITICAL_THRESHOLD_CM ?? 90);

  const endDate = hasExplicitEnd ? endOfDay(new Date(end)) : endOfDay(now);
  const requestedStartDate = hasExplicitStart
    ? startOfDay(new Date(start))
    : startOfDay(new Date(endDate.getTime() - 6 * 24 * 60 * 60 * 1000));
  const useAllTimeWindow = normalizedCommunityScope === 'all-time' && !hasExplicitStart;
  const periodScope = useAllTimeWindow ? 'all-time' : 'weekly';
  const periodScopeLabel = useAllTimeWindow ? 'All-time' : 'This week';

  // IoT Water Level Summary
  const sensorMatch = {
    timestamp: useAllTimeWindow
      ? { $lte: endDate }
      : { $gte: requestedStartDate, $lte: endDate },
  };
  const sensorAgg = await SensorData.aggregate([
    { $match: sensorMatch },
    { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        avg: { $avg: '$distance' },
        min: { $min: '$distance' },
        max: { $max: '$distance' },
        count: { $sum: 1 },
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const sensorOverallAgg = await SensorData.aggregate([
    { $match: sensorMatch },
    { $group: {
        _id: null,
        avg: { $avg: '$distance' },
        min: { $min: '$distance' },
        max: { $max: '$distance' },
        count: { $sum: 1 },
      }
    }
  ]);

  const daysAboveThreshold = sensorAgg.filter(d => (d.max ?? 0) > warnThreshold).length;

  // Daily series
  let sensorDaily;
  if (useAllTimeWindow) {
    sensorDaily = sensorAgg.map(day => ({
      date: day._id,
      avg: day.avg ?? null,
      min: day.min ?? null,
      max: day.max ?? null,
      count: day.count ?? 0,
    }));
  } else {
    const dayKeys = [];
    for (let d = new Date(requestedStartDate); d <= endDate; d = new Date(d.getTime() + 24*60*60*1000)) {
      dayKeys.push(toISODate(d));
    }
    sensorDaily = dayKeys.map(key => {
      const found = sensorAgg.find(a => a._id === key);
      return {
        date: key,
        avg: found?.avg ?? null,
        min: found?.min ?? null,
        max: found?.max ?? null,
        count: found?.count ?? 0,
      };
    });
  }

  // Alerts from thresholds and offline gaps
  const alerts = [];
  sensorDaily.forEach(day => {
    if (day.max != null && day.max >= critThreshold) {
      alerts.push({
        timestamp: day.date,
        message: `Water level exceeded ${critThreshold} cm`,
        alertType: 'Critical',
        responseStatus: 'Unknown',
      });
    } else if (day.max != null && day.max >= warnThreshold) {
      alerts.push({
        timestamp: day.date,
        message: `Water level exceeded ${warnThreshold} cm`,
        alertType: 'Warning',
        responseStatus: 'Unknown',
      });
    }
  });

  const OFFLINE_GAP_HOURS = Number(process.env.SENSOR_OFFLINE_GAP_HOURS ?? 6);
  const readingsAsc = await SensorData.find(sensorMatch).sort({ timestamp: 1 }).select('timestamp').lean();
  for (let i = 1; i < readingsAsc.length; i++) {
    const prev = readingsAsc[i-1].timestamp;
    const curr = readingsAsc[i].timestamp;
    const gapH = (new Date(curr) - new Date(prev)) / (1000*60*60);
    if (gapH >= OFFLINE_GAP_HOURS) {
      alerts.push({
        timestamp: new Date(curr).toISOString(),
        message: `No sensor data for ~${gapH.toFixed(1)} hours`,
        alertType: 'Sensor Offline',
        responseStatus: 'Unknown',
      });
    }
  }

  const iotWaterLevel = {
    note: 'Current schema has no sensor ID or location; aggregations are overall for all readings.',
    scope: periodScope,
    scopeLabel: periodScopeLabel,
    thresholdCm: warnThreshold,
    criticalThresholdCm: critThreshold,
    overall: {
      averageCm: sensorOverallAgg[0]?.avg ?? null,
      maxCm: sensorOverallAgg[0]?.max ?? null,
      minCm: sensorOverallAgg[0]?.min ?? null,
      totalReadings: sensorOverallAgg[0]?.count ?? 0,
      daysAboveThreshold,
    },
    daily: sensorDaily,
  };

  // Community Reports Summary
  const weeklyReportMatch = { isActive: true, createdAt: { $gte: requestedStartDate, $lte: endDate } };
  if (barangay) weeklyReportMatch.barangay = new RegExp(barangay, 'i');

  const communityReportMatch =
    useAllTimeWindow
      ? {
          isActive: true,
          createdAt: { $lte: endDate },
          ...(barangay ? { barangay: new RegExp(barangay, 'i') } : {}),
        }
      : weeklyReportMatch;

  const reports = await Report.find(communityReportMatch).select('createdAt status severity barangay').lean();

  const totalReports = reports.length;
  const statusCounts = reports.reduce((acc, r) => { acc[r.status] = (acc[r.status]||0)+1; return acc; }, {});
  const earliestReportDate = reports.reduce((earliest, r) => {
    const createdAt = new Date(r.createdAt);
    if (!earliest || createdAt < earliest) return createdAt;
    return earliest;
  }, null);

  const earliestSensorDate = sensorDaily[0]?.date ? startOfDay(new Date(sensorDaily[0].date)) : null;
  const firstAvailableDate = [earliestSensorDate, earliestReportDate ? startOfDay(earliestReportDate) : null]
    .filter(Boolean)
    .sort((a, b) => a.getTime() - b.getTime())[0] || null;
  const periodStartDate = useAllTimeWindow
    ? (firstAvailableDate || startOfDay(endDate))
    : requestedStartDate;

  // Map severities to buckets
  const severityMap = { Low: 'Minor Flood', Medium: 'Moderate Flood', High: 'Severe Flood', Critical: 'Severe Flood' };
  const requestedSeverity = { 'No Flood': 0, 'Minor Flood': 0, 'Moderate Flood': 0, 'Severe Flood': 0 };
  reports.forEach(r => {
    const key = severityMap[r.severity];
    if (key) requestedSeverity[key] += 1;
  });

  // Top barangays and peak hours
  const barangayCounts = reports.reduce((acc, r) => { const k = r.barangay || 'Unknown'; acc[k] = (acc[k]||0)+1; return acc; }, {});
  const mostReportedAreas = Object.entries(barangayCounts)
    .sort((a,b) => b[1]-a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const hourCounts = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
  reports.forEach(r => { const h = new Date(r.createdAt).getHours(); hourCounts[h].count += 1; });
  const peakHours = [...hourCounts].sort((a,b)=>b.count-a.count).slice(0,3);

  const communityReports = {
    scope: periodScope,
    scopeLabel: periodScopeLabel,
    totalReports,
    verified: statusCounts['VALIDATED'] || 0,
    unverified: statusCounts['UNVERIFIED'] || 0,
    rejected: statusCounts['REJECTED'] || 0,
    bySeverity: requestedSeverity,
    mostReportedAreas,
    peakHours,
  };

  const header = {
    systemName: 'FloodSense Weekly Report',
    community: barangay || 'All',
    dateRange: useAllTimeWindow
      ? formatAllTimeRange(periodStartDate, endDate)
      : formatRange(periodStartDate, endDate),
    reportScope: periodScope,
    reportScopeLabel: periodScopeLabel,
    communityScope: normalizedCommunityScope,
    communityScopeLabel: normalizedCommunityScope === 'all-time' ? 'All-time' : 'This week',
    generatedOn: new Date().toISOString(),
    generatedBy: user?.name || user?.email || 'Admin',
    systemStatus: 'Online',
  };

  // Insights
  const avgCurr = sensorOverallAgg[0]?.avg ?? null;
  const reportsCurr = totalReports;

  function insightsNumberText(pct, label) {
    if (pct == null || !Number.isFinite(pct)) return `${label} data is insufficient for comparison`;
    const abs = Math.abs(pct).toFixed(1);
    if (pct > 0) return `${label} increased by ${abs}% compared to last week`;
    if (pct < 0) return `${label} decreased by ${abs}% compared to last week`;
    return `${label} remained stable compared to last week`;
  }

  const criticalCount = alerts.filter(a => a.alertType === 'Critical').length;
  let insights;
  if (useAllTimeWindow) {
    const averageSummary = Number.isFinite(avgCurr)
      ? `average water level measured ${avgCurr.toFixed(1)} cm`
      : 'average water level data is unavailable';
    const engagementSummary = `${reportsCurr} community report${reportsCurr === 1 ? '' : 's'} logged`;
    insights = {
      scope: periodScope,
      scopeLabel: periodScopeLabel,
      waterLevelChangePct: null,
      engagementChangePct: null,
      summaryText: `Across all-time records, ${averageSummary}, with ${engagementSummary}. ${criticalCount > 0 ? `There ${criticalCount === 1 ? 'was' : 'were'} ${criticalCount} critical alert${criticalCount === 1 ? '' : 's'}.` : 'No critical alerts recorded.'}`,
    };
  } else {
    const prevStart = startOfDay(new Date(periodStartDate.getTime() - 7*24*60*60*1000));
    const prevEnd = endOfDay(new Date(endDate.getTime() - 7*24*60*60*1000));
    const prevSensorAgg = await SensorData.aggregate([
      { $match: { timestamp: { $gte: prevStart, $lte: prevEnd } } },
      { $group: { _id: null, avg: { $avg: '$distance' }, count: { $sum: 1 } } }
    ]);
    const prevReportsCount = await Report.countDocuments({ isActive:true, createdAt: { $gte: prevStart, $lte: prevEnd }, ...(barangay ? { barangay: new RegExp(barangay, 'i') } : {}) });

    const avgPrev = prevSensorAgg[0]?.avg ?? null;
    const reportsPrev = prevReportsCount ?? null;
    const waterLevelChangePct = computePercentChange(avgCurr ?? 0, avgPrev ?? 0);
    const engagementChangePct = computePercentChange(reportsCurr ?? 0, reportsPrev ?? 0);
    insights = {
      scope: periodScope,
      scopeLabel: periodScopeLabel,
      waterLevelChangePct,
      engagementChangePct,
      summaryText: (() => {
        const wl = insightsNumberText(waterLevelChangePct, 'water levels');
        const eg = insightsNumberText(engagementChangePct, 'community engagement');
        return `This week, ${wl}. ${eg}. ${criticalCount > 0 ? `There ${criticalCount === 1 ? 'was' : 'were'} ${criticalCount} critical alert${criticalCount === 1 ? '' : 's'}.` : 'No critical alerts recorded.'}`;
      })()
    };
  }

  const offlineSync = {
    available: false,
    note: 'Client-managed; provide via client-side metrics if needed (unsynced count, last sync time, cache size).',
    unsyncedRecords: null,
    lastSuccessfulSync: null,
    localCacheBytes: null,
    nextScheduledAttempt: null,
  };

  const footer = {
    copyright: `FloodSense Project © ${new Date().getFullYear()}`,
    developedBy: 'Glenn Mark Jacob',
    generator: 'FloodSense IoT Monitoring System',
  };

  return { header, iotWaterLevel, communityReports, alerts, offlineSync, insights, footer, startDate: periodStartDate, endDate };
}

// GET /api/admin/weekly-report
// Query: start=YYYY-MM-DD, end=YYYY-MM-DD, barangay=string,
//        warnThresholdCm, critThresholdCm, communityScope=weekly|all-time
router.get('/weekly-report', authenticate, requireAdmin, async (req, res) => {
  try {
    const data = await buildWeeklyReport(req.query, req.user);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Weekly report generation failed:', err);
    res.status(500).json({ success: false, message: 'Failed to generate weekly report', error: err?.message });
  }
});

// CSV export for weekly report
router.get('/weekly-report/export', authenticate, requireAdmin, async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    const { startDate, endDate, ...data } = await buildWeeklyReport(req.query, req.user);
    const from = toISODate(startDate);
    const to = toISODate(endDate);
    if (format !== 'csv') {
      return res.status(400).json({ success: false, message: 'Only csv format is supported. Use the print page to export PDF.' });
    }
    const rows = [];
    const pushKV = (section, group, key, value, extra) => rows.push({ section, group, key, value, extra });
    const { header, iotWaterLevel, communityReports, alerts, offlineSync, insights, footer } = data;

    Object.entries(header).forEach(([k,v]) => pushKV('header', '', k, v));
    const ov = iotWaterLevel.overall || {};
    Object.entries({ averageCm: ov.averageCm, maxCm: ov.maxCm, minCm: ov.minCm, totalReadings: ov.totalReadings, daysAboveThreshold: ov.daysAboveThreshold, thresholdCm: iotWaterLevel.thresholdCm, criticalThresholdCm: iotWaterLevel.criticalThresholdCm }).forEach(([k,v]) => pushKV('iot_overall', '', k, v));
    (iotWaterLevel.daily || []).forEach(d => {
      Object.entries({ avg: d.avg, min: d.min, max: d.max, count: d.count }).forEach(([k,v]) => pushKV('iot_daily', d.date, k, v));
    });
    Object.entries(communityReports.bySeverity || {}).forEach(([sev, cnt]) => pushKV('reports_severity', sev, 'count', cnt));
    pushKV('reports', '', 'scope', communityReports.scope || 'weekly');
    pushKV('reports', '', 'scopeLabel', communityReports.scopeLabel || 'This week');
    pushKV('reports', '', 'totalReports', communityReports.totalReports);
    pushKV('reports', '', 'verified', communityReports.verified);
    pushKV('reports', '', 'unverified', communityReports.unverified);
    pushKV('reports', '', 'rejected', communityReports.rejected);
    (communityReports.mostReportedAreas || []).forEach(a => pushKV('reports_areas', a.name, 'count', a.count));
    (communityReports.peakHours || []).forEach(h => pushKV('reports_peak_hours', String(h.hour), 'count', h.count));
    (alerts || []).forEach(a => pushKV('alerts', a.alertType, a.message, a.timestamp, a.responseStatus));
    Object.entries(offlineSync || {}).forEach(([k,v]) => pushKV('offline_sync', '', k, v));
    Object.entries(insights || {}).forEach(([k,v]) => pushKV('insights', '', k, v));
    Object.entries(footer || {}).forEach(([k,v]) => pushKV('footer', '', k, v));

    const headers = ['section','group','key','value','extra'];
    const escape = (val) => {
      if (val == null) return '';
      const s = String(val).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => escape(r[h])).join(','))).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=weekly-report_${from}_to_${to}.csv`);
    return res.status(200).send(csv);
  } catch (err) {
    console.error('Weekly report export failed:', err);
    res.status(500).json({ success: false, message: 'Failed to export weekly report', error: err?.message });
  }
});

export default router;
