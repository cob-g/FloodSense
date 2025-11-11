import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../../contexts/SocketContext';

export default function SensorWidget({ admin = false }) {
  const { connected, socket } = useContext(SocketContext) || {};
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    if (!socket) return;
    const onUpdate = (data) => setLatest(data);
    socket.on('update', onUpdate);
    return () => socket.off('update', onUpdate);
  }, [socket]);

  const status = getPassabilityStatus(latest?.distance);

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold">Live Sensor</h3>
          <div className="text-white/60 text-xs">Socket: {connected ? 'connected' : 'disconnected'}</div>
        </div>
      </div>
      {latest ? (
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <Metric label="Distance (cm)" value={latest.distance} highlight />
          <Metric label="Sensor ID" value={latest.sensorId || 'N/A'} />
          <Metric label="Location" value={latest?.locationName || 'N/A'} />
          <div className="sm:col-span-3 flex items-center justify-between mt-1">
            <div className="text-white/60 text-xs">Last updated: {latest?.timestamp ? new Date(latest.timestamp).toLocaleString() : '—'}</div>
            <span className={`text-xs px-2 py-1 rounded-lg border ${status.badge}`}>{status.text}</span>
          </div>
        </div>
      ) : (
        <div className="text-white/60 text-sm">Waiting for sensor reading…</div>
      )}
    </div>
  );
}

function Metric({ label, value, highlight = false }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
      <div className="text-[11px] text-white/60 mb-0.5">{label}</div>
      <div className={`${highlight ? 'text-xl' : 'text-base'} font-semibold text-white`}>{value}</div>
    </div>
  );
}

function getPassabilityStatus(distance) {
  if (distance == null || Number.isNaN(distance)) {
    return { text: 'Passable', badge: 'text-white/70 border-white/20 bg-white/5' };
  }
  // Thresholds: tweak as needed
  if (distance < 10) return { text: 'Not Passable', badge: 'text-red-300 border-red-400/40 bg-red-400/10' };
  if (distance < 20) return { text: 'Heavy Vehicles Only', badge: 'text-amber-300 border-amber-400/40 bg-amber-400/10' };
  return { text: 'Passable', badge: 'text-green-300 border-green-400/40 bg-green-400/10' };
}
