import { useMemo } from 'react';
import { useReports } from '../../hooks/useReports';

const daysArray = (n = 7) => {
  const arr = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    d.setHours(0, 0, 0, 0);
    arr.push(new Date(d));
  }
  return arr;
};

const formatDay = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export const AdminWeekly = () => {
  const { data, isLoading, error } = useReports({ limit: 500 });
  const reports = useMemo(() => data?.data?.reports || [], [data]);

  const series = useMemo(() => {
    const days = daysArray(7);
    const buckets = days.map((d) => ({
      key: d.getTime(),
      label: formatDay(d),
      VALIDATED: 0,
      UNVERIFIED: 0,
      REJECTED: 0,
      TOTAL: 0,
    }));
    const idx = (dt) => {
      const dd = new Date(dt);
      dd.setHours(0, 0, 0, 0);
      const t = dd.getTime();
      return buckets.findIndex((b) => b.key === t);
    };
    for (const r of reports) {
      const i = idx(r.createdAt);
      if (i !== -1) {
        buckets[i][r.status] = (buckets[i][r.status] || 0) + 1;
        buckets[i].TOTAL += 1;
      }
    }
    const max = Math.max(1, ...buckets.map((b) => b.TOTAL));
    return { buckets, max };
  }, [reports]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Weekly Reports</h1>
        <p className="text-white/60">Last 7 days by status</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h2 className="text-white/90 font-semibold mb-4">Trends</h2>
          {isLoading && <div className="text-white/70">Loading...</div>}
          {error && <div className="text-red-400">Failed to load</div>}
          {!isLoading && !error && (
            <div className="space-y-3">
              {series.buckets.map((b) => (
                <div key={b.key} className="grid grid-cols-12 items-center gap-3">
                  <div className="col-span-3 text-sm text-white/80">{b.label}</div>
                  <div className="col-span-9">
                    <div className="h-6 w-full bg-white/5 rounded-lg overflow-hidden border border-white/10">
                      <div className="h-full flex">
                        <div className="bg-green-500/60" style={{ width: `${(b.VALIDATED / (series.max || 1)) * 100}%` }} />
                        <div className="bg-amber-500/60" style={{ width: `${(b.UNVERIFIED / (series.max || 1)) * 100}%` }} />
                        <div className="bg-red-500/60" style={{ width: `${(b.REJECTED / (series.max || 1)) * 100}%` }} />
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-white/70">
                      <span className="mr-3">Total: {b.TOTAL}</span>
                      <span className="mr-3">Validated: {b.VALIDATED}</span>
                      <span className="mr-3">Pending: {b.UNVERIFIED}</span>
                      <span>Rejected: {b.REJECTED}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h2 className="text-white/90 font-semibold mb-4">Summary</h2>
          {!isLoading && !error && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <div className="text-sm text-green-300 mb-1">Validated</div>
                <div className="text-3xl font-black text-white">{series.buckets.reduce((a,b)=>a+b.VALIDATED,0)}</div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <div className="text-sm text-amber-300 mb-1">Pending</div>
                <div className="text-3xl font-black text-white">{series.buckets.reduce((a,b)=>a+b.UNVERIFIED,0)}</div>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="text-sm text-red-300 mb-1">Rejected</div>
                <div className="text-3xl font-black text-white">{series.buckets.reduce((a,b)=>a+b.REJECTED,0)}</div>
              </div>
            </div>
          )}
          {isLoading && <div className="text-white/70">Loading...</div>}
          {error && <div className="text-red-400">Failed to load</div>}
        </div>
      </div>

      <div className="mt-6 text-xs text-white/50">Note: Computed client-side from fetched reports (last 7 days).</div>
    </div>
  );
};

export default AdminWeekly;
