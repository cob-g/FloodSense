import React from 'react';

export default function SensorList({ readings = [], loading, error }) {
  if (loading) return <div className="text-white/70">Loading sensors…</div>;
  if (error) return <div className="text-red-400">Failed to load sensors</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-white/5 border-b border-white/10">
          <tr>
            <th className="px-4 py-3 text-left text-sm text-white/70">Sensor ID</th>
            <th className="px-4 py-3 text-left text-sm text-white/70">Location</th>
            <th className="px-4 py-3 text-left text-sm text-white/70">Distance (cm)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {(!readings || readings.length === 0) && (
            <tr>
              <td className="px-4 py-6 text-white/70" colSpan={3}>No sensors yet.</td>
            </tr>
          )}
          {readings.map((r) => (
            <tr key={r._id} className="hover:bg-white/5">
              <td className="px-4 py-3 font-medium text-white">{r.sensorId || 'N/A'}</td>
              <td className="px-4 py-3 text-white/80">{r?.locationName || '—'}</td>
              <td className="px-4 py-3 text-white/80">{r.distance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
