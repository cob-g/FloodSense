import { useState } from 'react';
import { useListSensorsWithStatus, useCreateSensor, useUpdateSensor, useDeleteSensor } from '../../hooks/useSensorRegistry';
import { useToast } from '../../contexts/ToastContext';
import ReportDeleteConfirmModal from '../../components/admin/ReportDeleteConfirmModal';

export default function AdminSensors() {
  const { data, isLoading, error } = useListSensorsWithStatus();
  const createMut = useCreateSensor();
  const updateMut = useUpdateSensor();
  const deleteMut = useDeleteSensor();
  const sensors = data?.data || [];
  const toast = useToast();
  const [sensorToDelete, setSensorToDelete] = useState(null);
  const isDeleting = deleteMut.isLoading;

  const [form, setForm] = useState({
    sensorId: '',
    locationName: '',
    latitude: '',
    longitude: '',
    mountHeight: '',
    notes: '',
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.sensorId.trim()) { toast.warning('Sensor ID is required'); return; }
    if (!form.locationName.trim()) { toast.warning('Location Name is required'); return; }
    try {
      await createMut.mutateAsync({
        sensorId: form.sensorId.trim(),
        locationName: form.locationName.trim(),
        latitude: form.latitude !== '' ? Number(form.latitude) : undefined,
        longitude: form.longitude !== '' ? Number(form.longitude) : undefined,
        mountHeight: form.mountHeight !== '' ? Number(form.mountHeight) : undefined,
        notes: form.notes?.trim() || undefined,
      });
      setForm({ sensorId: '', locationName: '', latitude: '', longitude: '', mountHeight: '', notes: '' });
      toast.success('Sensor created');
    } catch (err) {
      toast.error(err?.error || err?.message || 'Failed to create sensor');
    }
  };

  const copyConfig = async (s) => {
    const snippet = `// FloodSense device config\nconst char* SENSOR_ID = "${s.sensorId}";\nconst float LATITUDE = ${s.latitude ?? 0};\nconst float LONGITUDE = ${s.longitude ?? 0};\n// Paste into your sketch and rebuild.`;
    try { await navigator.clipboard.writeText(snippet); toast.success('Config copied to clipboard'); } catch (_) { toast.error('Copy failed'); }
  };

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ locationName: '', latitude: '', longitude: '', mountHeight: '', notes: '' });
  const beginEdit = (s) => {
    setEditingId(s._id);
    setEditForm({
      locationName: s.locationName || '',
      latitude: s.latitude ?? '',
      longitude: s.longitude ?? '',
      mountHeight: s.mountHeight ?? '',
      notes: s.notes || '',
    });
  };
  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  };
  const saveEdit = async (s) => {
    try {
      await updateMut.mutateAsync({ id: s._id, payload: {
        locationName: editForm.locationName,
        latitude: editForm.latitude !== '' ? Number(editForm.latitude) : null,
        longitude: editForm.longitude !== '' ? Number(editForm.longitude) : null,
        mountHeight: editForm.mountHeight !== '' ? Number(editForm.mountHeight) : null,
        notes: editForm.notes || null,
      }});
      toast.success('Sensor updated');
      setEditingId(null);
    } catch (err) {
      toast.error(err?.error || err?.message || 'Failed to update sensor');
    }
  };
  const cancelEdit = () => setEditingId(null);
  const openDeleteModal = (sensor) => {
    setSensorToDelete(sensor);
  };
  const closeDeleteModal = () => {
    if (isDeleting) return;
    setSensorToDelete(null);
  };
  const confirmDelete = async () => {
    if (!sensorToDelete?._id) return;
    try {
      await deleteMut.mutateAsync(sensorToDelete._id);
      toast.success('Sensor deleted');
      setSensorToDelete(null);
    } catch (err) {
      toast.error(err?.error || err?.message || 'Failed to delete sensor');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Sensors</h1>
          <p className="text-white/60">Manage registry: IDs, locations, and metadata</p>
        </div>
      </div>

      {/* Create form */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
        <h2 className="text-white font-semibold mb-4">Add Sensor</h2>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-white/60 mb-1">Sensor ID</label>
            <input name="sensorId" value={form.sensorId} onChange={onChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="FS-012" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-white/60 mb-1">Location Name</label>
            <input name="locationName" value={form.locationName} onChange={onChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" placeholder="Barangay 175" />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">Latitude</label>
            <input name="latitude" value={form.latitude} onChange={onChange} type="number" step="any" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">Longitude</label>
            <input name="longitude" value={form.longitude} onChange={onChange} type="number" step="any" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">Mount Height (cm)</label>
            <input name="mountHeight" value={form.mountHeight} onChange={onChange} type="number" step="1" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs text-white/60 mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={onChange} rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button type="submit" disabled={createMut.isLoading} className="px-4 py-2 rounded-lg bg-accent-orange text-space-black font-semibold disabled:opacity-60">{createMut.isLoading ? 'Saving…' : 'Add Sensor'}</button>
          </div>
        </form>
      </div>

      {/* Registry list */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Registered Sensors</h2>
          <div className="text-white/60 text-sm">{isLoading ? 'Loading…' : `${sensors.length} item(s)`}</div>
        </div>
        {error ? (
          <div className="text-red-400">Failed to load sensors.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm text-white/70">Sensor ID</th>
                  <th className="px-4 py-3 text-left text-sm text-white/70">Status</th>
                  <th className="px-4 py-3 text-left text-sm text-white/70">Location</th>
                  <th className="px-4 py-3 text-left text-sm text-white/70">Lat / Lng</th>
                  <th className="px-4 py-3 text-left text-sm text-white/70">Mount Height</th>
                  <th className="px-4 py-3 text-left text-sm text-white/70">Notes</th>
                  <th className="px-4 py-3 text-left text-sm text-white/70">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {sensors.length === 0 && (
                  <tr><td className="px-4 py-6 text-white/70" colSpan={6}>No sensors yet. Add one above.</td></tr>
                )}
                {sensors.map((s) => {
                  const online = !!s.online;
                  const dot = online ? 'bg-green-500' : 'bg-gray-500';
                  const rowEditing = editingId === s._id;
                  return (
                    <tr key={s._id} className="hover:bg-white/5 align-top">
                      <td className="px-4 py-3 font-medium text-white">{s.sensorId}</td>
                      <td className="px-4 py-3 text-white/80">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full ${dot}`}></span>
                          <span className="text-sm">{online ? 'Online' : 'Offline'}</span>
                        </div>
                        <div className="text-[11px] text-white/50 mt-1">{s.lastSeen ? `Last seen ${new Date(s.lastSeen).toLocaleString()}` : 'No data yet'}</div>
                      </td>
                      <td className="px-4 py-3 text-white/80">
                        {rowEditing ? (
                          <input name="locationName" value={editForm.locationName} onChange={onEditChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-sm" />
                        ) : (
                          s.locationName
                        )}
                      </td>
                      <td className="px-4 py-3 text-white/80">
                        {rowEditing ? (
                          <div className="flex gap-2">
                            <input name="latitude" value={editForm.latitude} onChange={onEditChange} type="number" step="any" className="w-28 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-sm" />
                            <input name="longitude" value={editForm.longitude} onChange={onEditChange} type="number" step="any" className="w-28 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-sm" />
                          </div>
                        ) : (
                          <span>{s.latitude ?? '—'}{(s.latitude!=null || s.longitude!=null) ? ', ' : ''}{s.longitude ?? ''}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white/80">
                        {rowEditing ? (
                          <input name="mountHeight" value={editForm.mountHeight} onChange={onEditChange} type="number" step="1" className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-sm" />
                        ) : (
                          s.mountHeight ?? '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-white/60">
                        {rowEditing ? (
                          <input name="notes" value={editForm.notes} onChange={onEditChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-sm" />
                        ) : (
                          s.notes ?? '—'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {rowEditing ? (
                            <>
                              <button onClick={() => saveEdit(s)} title="Save" className="p-1.5 rounded-lg bg-white/10 border border-white/10 text-white hover:bg-white/15">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                              </button>
                              <button onClick={cancelEdit} title="Cancel" className="p-1.5 rounded-lg bg-white/10 border border-white/10 text-white hover:bg-white/15">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => copyConfig(s)} title="Copy Config" className="p-1.5 rounded-lg bg-white/10 border border-white/10 text-white hover:bg-white/15">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2M8 16h8a2 2 0 002-2v-4M8 16v2a2 2 0 002 2h4"/></svg>
                              </button>
                              <button onClick={() => beginEdit(s)} title="Edit" className="p-1.5 rounded-lg bg-white/10 border border-white/10 text-white hover:bg-white/15">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h2m-1 14v-4m0 0l7-7a2 2 0 10-2.828-2.828l-7 7V19z"/></svg>
                              </button>
                              <button onClick={() => openDeleteModal(s)} title="Delete" disabled={isDeleting} className="p-1.5 rounded-lg bg-white/10 border border-white/10 text-white hover:bg-white/15 disabled:opacity-50">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7h12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m2 0v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7z"/></svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ReportDeleteConfirmModal
        open={!!sensorToDelete}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        isPending={isDeleting}
        title="Delete Sensor"
        description="This will remove the sensor from the registry and status list."
        itemLabel="Sensor"
        itemValue={sensorToDelete ? `${sensorToDelete.sensorId}${sensorToDelete.locationName ? ` - ${sensorToDelete.locationName}` : ''}` : undefined}
        confirmText="Delete Sensor"
      />
    </div>
  );
}
