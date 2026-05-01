import { useMemo, useState, useEffect } from 'react';
import { useFallbacks, useArchivedFallbacks, useCreateFallback, useUpdateFallback, useDeleteFallback, useRestoreFallback } from '../../hooks/useFallbacks';
import { useToast } from '../../contexts/ToastContext';
import ReportDeleteConfirmModal from '../../components/admin/ReportDeleteConfirmModal';
import { createPortal } from 'react-dom';

const BARANGAYS = [
  'Barangay 165','Barangay 166','Barangay 167','Barangay 168','Barangay 170','Barangay 171','Barangay 172','Barangay 173','Barangay 174','Barangay 175',
  'Barangay 176-A','Barangay 176-B','Barangay 176-C','Barangay 176-D','Barangay 176-E','Barangay 176-F','Barangay 178','Barangay 179','Barangay 180','Barangay 181','Barangay 182','Barangay 183','Barangay 184','Barangay 185','Barangay 186','Barangay 187','Barangay 188'
];

const createEmptyForm = () => ({
  name: '',
  barangay: '',
  priority: 0,
  notes: '',
  lat: '',
  lng: '',
});

const getPriorityClass = (priority) => {
  if (priority >= 70) {
    return 'text-red-300 border-red-400/40 bg-red-400/10';
  }
  if (priority >= 40) {
    return 'text-amber-300 border-amber-400/40 bg-amber-400/10';
  }
  return 'text-emerald-300 border-emerald-400/40 bg-emerald-400/10';
};

const Modal = ({ children, onClose }) =>
  createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[3000] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-space-900/95 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );

export const AdminFallbacks = () => {
  const toast = useToast();
  const [view, setView] = useState('active');
  const activeQuery = useFallbacks({}, { enabled: view === 'active' });
  const archivedQuery = useArchivedFallbacks({}, { enabled: view === 'archived' });
  const { data, isLoading, error } = view === 'archived' ? archivedQuery : activeQuery;
  const createMut = useCreateFallback();
  const updateMut = useUpdateFallback();
  const deleteMut = useDeleteFallback();
  const restoreMut = useRestoreFallback();

  const items = useMemo(() => data?.data?.places || data?.places || data?.data?.fallbacks || data?.fallbacks || [], [data]);

  const [query, setQuery] = useState('');
  const [prioritySort, setPrioritySort] = useState('desc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fallbackToDelete, setFallbackToDelete] = useState(null);
  const [form, setForm] = useState(createEmptyForm);
  const isDeleting = deleteMut.isLoading || deleteMut.isPending;
  const isRestoring = restoreMut.isLoading || restoreMut.isPending;
  const isSaving = createMut.isPending || updateMut.isPending || createMut.isLoading || updateMut.isLoading;
  const isArchivedView = view === 'archived';

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || '',
        barangay: editing.barangay || '',
        priority: editing.priority ?? 0,
        notes: editing.notes || '',
        lat: editing.location?.coordinates?.[1] ?? '',
        lng: editing.location?.coordinates?.[0] ?? '',
      });
    } else {
      setForm(createEmptyForm());
    }
  }, [editing]);

  const filtered = useMemo(() => {
    const next = items.filter((i) => {
      const q = (query || '').toLowerCase();
      const matchQ = !q ||
        i.name?.toLowerCase().includes(q) ||
        i.notes?.toLowerCase().includes(q) ||
        i.barangay?.toLowerCase().includes(q);
      return matchQ;
    });

    next.sort((left, right) => {
      const leftPriority = Number(left.priority ?? 0);
      const rightPriority = Number(right.priority ?? 0);

      if (leftPriority !== rightPriority) {
        return prioritySort === 'asc' ? leftPriority - rightPriority : rightPriority - leftPriority;
      }

      return (left.name || '').localeCompare(right.name || '');
    });

    return next;
  }, [items, query, prioritySort]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setModalOpen(true); };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      const name = (form.name || '').trim();
      const barangay = (form.barangay || '').trim();
      const priority = Number(form.priority);
      const notes = (form.notes || '').trim();
      const lat = parseFloat(form.lat);
      const lng = parseFloat(form.lng);

      if (!name || !barangay) {
        toast.warning('Name and barangay are required');
        return;
      }
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        toast.warning('Latitude and longitude are required');
        return;
      }
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        toast.warning('Latitude must be between -90 and 90; Longitude between -180 and 180');
        return;
      }

      if (!Number.isFinite(priority) || priority < 0 || priority > 100) {
        toast.warning('Priority must be between 0 and 100');
        return;
      }

      const payload = {
        name,
        barangay,
        priority,
        notes,
        latitude: lat,
        longitude: lng,
      };

      if (editing) {
        await updateMut.mutateAsync({ id: editing._id, data: payload });
        toast.success('Historical flood spot updated');
      } else {
        await createMut.mutateAsync(payload);
        toast.success('Historical flood spot created');
      }

      setModalOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    }
  };

  const openDeleteModal = (item) => {
    setFallbackToDelete(item);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setFallbackToDelete(null);
  };

  const confirmDelete = async () => {
    if (!fallbackToDelete?._id) return;
    try {
      await deleteMut.mutateAsync(fallbackToDelete._id);
      toast.success('Historical flood spot archived');
      setFallbackToDelete(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Archive failed');
    }
  };

  const restoreFallback = async (item) => {
    if (!item?._id || isRestoring) return;
    try {
      await restoreMut.mutateAsync(item._id);
      toast.success('Historical flood spot restored');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Restore failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Historical Flood Spots</h1>
          <p className="text-white/60">Manage places that are commonly flooded and visible in offline Feed mode.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 p-1">
            {['active', 'archived'].map((key) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`px-3 py-1.5 text-sm rounded-lg ${view === key ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white'}`}
              >
                {key === 'active' ? 'Active' : 'Archived'}
              </button>
            ))}
          </div>
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search name, notes, barangay" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/50"/>
          <select value={prioritySort} onChange={(e) => setPrioritySort(e.target.value)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white">
            <option value="desc" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Priority: High to Low</option>
            <option value="asc" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Priority: Low to High</option>
          </select>
          {!isArchivedView && (
            <button onClick={openCreate} className="px-4 py-2 duration-300 transition-all rounded-xl shadow-[0_4px_16px_rgba(197,73,20,0.3)] hover:-translate-y-0.5 shrink-0 whitespace-nowrap" style={{ background: 'linear-gradient(135deg, #c54914 0%, #7a2200 100%)' }}>Add Place</button>
          )}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">   
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-sm text-white/70">Name</th>
                <th className="px-4 py-3 text-left text-sm text-white/70">Barangay</th>
                <th className="px-4 py-3 text-left text-sm text-white/70">Priority</th>
                <th className="px-4 py-3 text-left text-sm text-white/70">Notes / Landmark</th>
                <th className="px-4 py-3 text-left text-sm text-white/70">Actions</th>

              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {isLoading && (
                <tr><td className="px-4 py-6 text-white/70" colSpan={5}>Loading...</td></tr>
              )}
              {error && (
                <tr><td className="px-4 py-6 text-red-400" colSpan={5}>Failed to load</td></tr>
              )}
              {!isLoading && !error && filtered.length === 0 && (
                <tr><td className="px-4 py-6 text-white/70" colSpan={5}>{isArchivedView ? 'No archived flood spots found' : 'No historical flood spots found'}</td></tr>
              )}
              {!isLoading && !error && filtered.map((i) => (
                <tr key={i._id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-white">{i.name}</td>
                  <td className="px-4 py-3 text-white/80">{i.barangay}</td>
                  <td className="px-4 py-3 text-white/80">
                    <span className={`text-xs px-2 py-1 rounded-lg border ${getPriorityClass(Number(i.priority ?? 0))}`}>
                      {Number(i.priority ?? 0)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/60">{i.notes || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {isArchivedView ? (
                        <button title="Restore" onClick={() => restoreFallback(i)} disabled={isRestoring} className="w-9 h-9 rounded-lg hover:bg-emerald-500/10 flex items-center justify-center disabled:opacity-50">
                          <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12a9 9 0 101.5-5.5M3 4v4h4"/></svg>
                        </button>
                      ) : (
                        <>
                          <button title="Edit" onClick={()=>openEdit(i)} className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4h2a2 2 0 012 2v2m-1 5l3-3a2.121 2.121 0 10-3-3l-3 3m-1 1l-4 4v2h2l4-4"/></svg>
                          </button>
                          <button title="Archive" onClick={()=>openDeleteModal(i)} disabled={isDeleting} className="w-9 h-9 rounded-lg hover:bg-red-500/10 flex items-center justify-center disabled:opacity-50">
                            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-1-2H10a1 1 0 00-1 1v1h8V6a1 1 0 00-1-1z"/></svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>



      {modalOpen && (
        <Modal onClose={()=>setModalOpen(false)}>
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{editing ? 'Edit' : 'Add'} Historical Flood Spot</h3>
              <button onClick={()=>setModalOpen(false)} className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={submitForm} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm text-white/70 mb-1">Name</label>
                <input value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" required />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Barangay</label>
                <select value={form.barangay} onChange={(e)=>setForm({...form, barangay: e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" required>
                  <option value="" style={{ color: '#111827', backgroundColor: '#ffffff' }}>Select barangay</option>
                  {BARANGAYS.map((b) => (
                    <option key={b} value={b} style={{ color: '#111827', backgroundColor: '#ffffff' }}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Priority (0-100)</label>
                <input type="number" min="0" max="100" value={form.priority} onChange={(e)=>setForm({...form, priority: e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-white/70 mb-1">Notes / Landmark</label>
                <textarea value={form.notes} onChange={(e)=>setForm({...form, notes: e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white min-h-[70px]" placeholder="Describe landmark, nearby street, building, etc." />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Latitude</label>
                <input type="number" step="any" value={form.lat} onChange={(e)=>setForm({...form, lat: e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" required />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Longitude</label>
                <input type="number" step="any" value={form.lng} onChange={(e)=>setForm({...form, lng: e.target.value})} className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white" required />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={()=>setModalOpen(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-accent-orange hover:bg-bright-orange text-space-black font-semibold rounded-lg disabled:opacity-60 disabled:cursor-not-allowed">
                  {editing ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      <ReportDeleteConfirmModal
        open={!!fallbackToDelete}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        isPending={isDeleting}
        title="Archive Historical Flood Spot"
        description="This will move the location to the archived list and hide it from active views."
        itemLabel="Historical Flood Spot"
        itemValue={fallbackToDelete ? `${fallbackToDelete.name}${fallbackToDelete.barangay ? ` - ${fallbackToDelete.barangay}` : ''}` : undefined}
        confirmText="Archive Spot"
        pendingText="Archiving..."
      />
    </div>
  );
};

export default AdminFallbacks;
