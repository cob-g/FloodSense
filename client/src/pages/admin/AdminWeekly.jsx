import { useMemo } from 'react';
import { useWeeklyReport } from '../../hooks/useAnalytics';
import { analyticsService } from '../../services/analytics.service';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';

 

export const AdminWeekly = () => {
  // Server-generated weekly report (aggregated)
  const { data: wr, isLoading: wrLoading, error: wrError } = useWeeklyReport();
  const weekly = wr?.data; // api interceptor: { success, data }

  // Helper: get severity count ignoring key case
  const getSeverityCount = (target) => {
    const by = weekly?.communityReports?.bySeverity || {};
    const key = String(target).trim().toLowerCase();
    let sum = 0;
    for (const [k, v] of Object.entries(by)) {
      if (String(k).trim().toLowerCase() === key) sum += v || 0;
    }
    return sum;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Weekly Report - Server Aggregation */}
      <HeaderWithActions />

      {/* Header Section */}
      <div className="bg-[#1c1410]/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 mb-6">
        {wrLoading && <div className="text-white/70">Loading weekly report…</div>}
        {wrError && <div className="text-red-400">Failed to load weekly report</div>}
        {!wrLoading && !wrError && weekly && (
          <div className="grid lg:grid-cols-3 gap-4 text-sm">
            <div className="col-span-2 grid sm:grid-cols-2 gap-4">
              <BadgeRow
                items={[
                  { label: 'Community', value: weekly.header?.community },
                  { label: 'Range', value: weekly.header?.dateRange },
                ]}
              />
              <BadgeRow
                items={[
                  { label: 'Generated', value: new Date(weekly.header?.generatedOn || Date.now()).toLocaleString() },
                  { label: 'By', value: weekly.header?.generatedBy },
                ]}
              />
            </div>
            <div className="flex lg:justify-end items-start">
              <div className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 text-white/80 text-xs">
                Status: <span className="text-white/90 font-medium">{weekly.header?.systemStatus}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* IoT Water Level Summary */}
      {!wrLoading && !wrError && weekly && (
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <div className="bg-[#1c1410]/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6">
            <h2 className="text-white/90 font-semibold mb-4">IoT Water Level Summary</h2>
            <div className="grid grid-cols-4 gap-3">
              <Metric label="Average (cm)" value={weekly.iotWaterLevel?.overall?.averageCm?.toFixed ? weekly.iotWaterLevel.overall.averageCm.toFixed(1) : (weekly.iotWaterLevel?.overall?.averageCm ?? '—')} />
              <Metric label="Max (cm)" value={weekly.iotWaterLevel?.overall?.maxCm ?? '—'} />
              <Metric label="Min (cm)" value={weekly.iotWaterLevel?.overall?.minCm ?? '—'} />
              <Metric label="Days above threshold" value={weekly.iotWaterLevel?.overall?.daysAboveThreshold ?? 0} />
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-white/80">Daily Max Levels</div>
                <div className="text-xs text-white/50">Last {weekly.iotWaterLevel?.daily?.length || 0} days</div>
              </div>
              <AreaChart
                data={(weekly.iotWaterLevel?.daily || []).map(d => ({ x: new Date(d.date), y: d.max ?? 0 }))}
                height={200}
              />
            </div>
          </div>

          {/* Community Reports Summary */}
          <div className="bg-[#1c1410]/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6">
            <h2 className="text-white/90 font-semibold mb-4">Community Reports Summary</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Metric label="Total Reports" value={weekly.communityReports?.totalReports ?? 0} large />
              <Metric label="Verified vs Unverified" value={`${weekly.communityReports?.verified ?? 0} • ${weekly.communityReports?.unverified ?? 0}`} />
              <Metric label="Rejected" value={weekly.communityReports?.rejected ?? 0} />
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-white/80">Status Distribution</div>
              </div>
              <BarChart
                data={[
                  { label: 'Verified', value: weekly.communityReports?.verified ?? 0, color: '#22c55e' },
                  { label: 'Unverified', value: weekly.communityReports?.unverified ?? 0, color: '#f59e0b' },
                  { label: 'Rejected', value: weekly.communityReports?.rejected ?? 0, color: '#ef4444' },
                ]}
                height={160}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-white/80 mb-2">By Severity</div>
                <ul className="space-y-2 text-sm text-white/80">
                  {[
                    { label: 'Minor Flood', key: 'minor flood' },
                    { label: 'Moderate Flood', key: 'moderate flood' },
                    { label: 'Severe Flood', key: 'severe flood' },
                  ].map(({ label, key }) => (
                    <li key={key} className="flex justify-between">
                      <span>{label}</span>
                      <span className="text-white/70">{getSeverityCount(key)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-sm text-white/80 mb-2">Most Reported Areas</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-white/60">
                        <th className="py-1 pr-2">Area</th>
                        <th className="py-1 pr-2 text-right">Reports</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {(weekly.communityReports?.mostReportedAreas || []).map((a) => (
                        <tr key={a.name}>
                          <td className="py-1 pr-2 text-white/80">{a.name}</td>
                          <td className="py-1 pr-2 text-right text-white/70">{a.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 text-xs text-white/60">
                  Peak Hours: {(weekly.communityReports?.peakHours || []).map((h) => `${h.hour}:00`).join(', ') || '—'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts and Warnings */}
      {!wrLoading && !wrError && weekly && (
        <div className="bg-[#1c1410]/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 mb-6">
          <h2 className="text-white/90 font-semibold mb-4">Alerts and Warnings</h2>
          <div className="space-y-3">
            {(weekly.alerts || []).length === 0 && (
              <div className="text-white/60 text-sm">No alerts recorded for this period.</div>
            )}
            {(weekly.alerts || []).map((a, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="space-y-0.5">
                  <div className="text-sm text-white/90">{new Date(a.timestamp).toLocaleString()}</div>
                  <div className="text-xs text-white/70">{a.message}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-lg border ${a.alertType === 'Critical' ? 'text-red-300 border-red-400/40 bg-red-400/10' : a.alertType === 'Warning' ? 'text-amber-300 border-amber-400/40 bg-amber-400/10' : 'text-white/70 border-white/20 bg-white/5'}`}>{a.alertType}</span>
                  <span className="text-xs px-2 py-1 rounded-lg border text-white/70 border-white/20 bg-white/5">{a.responseStatus || 'Unknown'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offline Data Sync Status */}
      {!wrLoading && !wrError && weekly && (
        <div className="bg-[#1c1410]/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 mb-6">
          <h2 className="text-white/90 font-semibold mb-2">Offline Data Sync Status</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-[#140e0b]/80 rounded-xl p-4 border border-white/5 shadow-inner">
              <div className="text-white/60">Unsynced Records</div>
              <div className="text-white/90 font-semibold">{weekly.offlineSync?.unsyncedRecords ?? 'N/A'}</div>
            </div>
            <div className="bg-[#140e0b]/80 rounded-xl p-4 border border-white/5 shadow-inner">
              <div className="text-white/60">Last Successful Sync</div>
              <div className="text-white/90 font-semibold">{weekly.offlineSync?.lastSuccessfulSync ? new Date(weekly.offlineSync.lastSuccessfulSync).toLocaleString() : 'N/A'}</div>
            </div>
            <div className="bg-[#140e0b]/80 rounded-xl p-4 border border-white/5 shadow-inner">
              <div className="text-white/60">Local Cache (bytes)</div>
              <div className="text-white/90 font-semibold">{weekly.offlineSync?.localCacheBytes ?? 'N/A'}</div>
            </div>
            <div className="bg-[#140e0b]/80 rounded-xl p-4 border border-white/5 shadow-inner">
              <div className="text-white/60">Next Scheduled Sync</div>
              <div className="text-white/90 font-semibold">{weekly.offlineSync?.nextScheduledAttempt ? new Date(weekly.offlineSync.nextScheduledAttempt).toLocaleString() : 'N/A'}</div>
            </div>
          </div>
        </div>
      )}


      {/* Footer */}
      {!wrLoading && !wrError && weekly && (
        <div className="text-xs text-white/50 mb-8 text-center space-y-1">
          <div>{weekly.footer?.copyright}</div>
          <div>{weekly.footer?.developedBy}</div>
          <div>{weekly.footer?.generator}</div>
        </div>
      )}
    </div>
  );
};

export default AdminWeekly;

// Local header with actions to keep file lean
function HeaderWithActions() {
  const navigate = useNavigate();
  const toast = useToast();

  const downloadCSV = async () => {
    try {
      const blob = await analyticsService.exportWeeklyReport('csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weekly-report_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast.error('Failed to export CSV');
    }
  };

  const printPDF = () => {
    navigate('/admin/weekly/print?auto=1');
  };

  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'Goodly, sans-serif' }}>Weekly Report</h1>
        <p className="text-white/50 text-sm mt-1">FloodSense Community Monitoring Dashboard</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={downloadCSV} className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white font-medium hover:bg-white/10 text-sm transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Export CSV
        </button>
        <button onClick={printPDF} className="px-4 py-2.5 rounded-xl text-white font-medium text-sm transition-all duration-300 flex items-center gap-2 shadow-[0_4px_16px_rgba(197,73,20,0.3)] hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #c54914 0%, #7a2200 100%)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          Export PDF / Print
        </button>
      </div>
    </div>
  );
}

function BarChart({ data = [], height = 160 }) {
  const w = 680;
  const h = height;
  const pad = { l: 80, r: 12, t: 8, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;

  const items = useMemo(() => data.map(d => ({ label: d.label, value: Number(d.value) || 0, color: d.color || '#60a5fa' })), [data]);
  const maxV = useMemo(() => Math.max(1, ...items.map(i => i.value)), [items]);
  const barH = innerH / (items.length || 1);

  return (
    <div className="w-full overflow-x-auto">
      <svg width={w} height={h} className="max-w-full">
        <g>
          <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + innerH} stroke="#ffffff22" />
          <line x1={pad.l} y1={pad.t + innerH} x2={pad.l + innerW} y2={pad.t + innerH} stroke="#ffffff22" />
          {items.map((it, idx) => {
            const y = pad.t + idx * barH + barH * 0.15;
            const bh = barH * 0.7;
            const bw = innerW * (it.value / maxV);
            return (
              <g key={idx}>
                <text x={pad.l - 10} y={y + bh / 2} fill="#94a3b8" fontSize="10" textAnchor="end" dominantBaseline="middle">{it.label}</text>
                <rect x={pad.l} y={y} width={bw} height={bh} fill={it.color} opacity="0.9" />
                <text x={pad.l + bw + 6} y={y + bh / 2} fill="#cbd5e1" fontSize="10" dominantBaseline="middle">{it.value}</text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

function BadgeRow({ items = [] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((i, idx) => (
        <div key={idx} className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 text-white/80 text-xs">
          <span className="text-white/60 mr-1">{i.label}:</span>
          <span className="text-white/90 font-medium">{i.value}</span>
        </div>
      ))}
    </div>
  );
}

function Metric({ label, value, large = false }) {
  return (
    <div className="bg-[#140e0b]/80 rounded-xl p-4 border border-white/5 shadow-inner">
      <div className="text-xs text-white/60 mb-1">{label}</div>
      <div className={`${large ? 'text-3xl' : 'text-2xl'} font-black text-white`}>{value}</div>
    </div>
  );
}

function AreaChart({ data = [], height = 180, stroke = '#f97316' }) {
  const w = 680;
  const h = height;
  const pad = { l: 36, r: 12, t: 8, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;

  const points = useMemo(() => data.map((d, i) => ({ x: i, y: Number(d.y) || 0, label: d.x })), [data]);
  const yMax = useMemo(() => Math.max(1, ...points.map(p => p.y)), [points]);
  const xStep = points.length > 1 ? innerW / (points.length - 1) : 0;
  const toX = (i) => pad.l + i * xStep;
  const toY = (v) => pad.t + innerH - (v / yMax) * innerH;

  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.y)}`).join(' ');
  }, [points]);

  const areaD = useMemo(() => {
    if (points.length === 0) return '';
    const top = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.y)}`).join(' ');
    const lastX = toX(points.length - 1);
    const firstX = toX(0);
    return `${top} L ${lastX} ${pad.t + innerH} L ${firstX} ${pad.t + innerH} Z`;
  }, [points]);

  const xLabels = useMemo(() => {
    if (points.length === 0) return [];
    const idxs = [0, Math.floor(points.length / 2), points.length - 1];
    return Array.from(new Set(idxs)).map(i => ({ x: toX(i), label: new Date(points[i].label).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }));
  }, [points]);

  const yTicks = useMemo(() => {
    const ticks = [0, 0.5, 1].map(r => Math.round(r * yMax));
    return ticks.map(v => ({ y: toY(v), label: String(v) }));
  }, [yMax]);

  return (
    <div className="w-full overflow-x-auto">
      <svg width={w} height={h} className="max-w-full">
        <defs>
          <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={w} height={h} fill="none" />
        <g>
          <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + innerH} stroke="#ffffff22" />
          <line x1={pad.l} y1={pad.t + innerH} x2={pad.l + innerW} y2={pad.t + innerH} stroke="#ffffff22" />
          {yTicks.map((t, i) => (
            <g key={i}>
              <line x1={pad.l} y1={t.y} x2={pad.l + innerW} y2={t.y} stroke="#ffffff14" />
              <text x={pad.l - 6} y={t.y} fill="#94a3b8" fontSize="10" textAnchor="end" dominantBaseline="middle">{t.label}</text>
            </g>
          ))}
          {xLabels.map((t, i) => (
            <text key={i} x={t.x} y={pad.t + innerH + 16} fill="#94a3b8" fontSize="10" textAnchor="middle">{t.label}</text>
          ))}
        </g>
        {points.length > 0 && (
          <g>
            <path d={areaD} fill="url(#areaFill)" />
            <path d={pathD} fill="none" stroke={stroke} strokeWidth="2.5" />
          </g>
        )}
      </svg>
    </div>
  );
}
