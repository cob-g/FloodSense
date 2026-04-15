import { useMemo, useState, useEffect } from 'react';
import { useFallbacks, useCreateFallback, useUpdateFallback, useDeleteFallback } from '../../hooks/useFallbacks';
import { useToast } from '../../contexts/ToastContext';
import ReportDeleteConfirmModal from '../../components/admin/ReportDeleteConfirmModal';
import { createPortal } from 'react-dom';

const BARANGAYS = [
  'Barangay 165','Barangay 166','Barangay 167','Barangay 168','Barangay 170','Barangay 171','Barangay 172','Barangay 173','Barangay 174','Barangay 175',
  'Barangay 176-A','Barangay 176-B','Barangay 176-C','Barangay 176-D','Barangay 176-E','Barangay 176-F','Barangay 178','Barangay 179','Barangay 180','Barangay 181','Barangay 182','Barangay 183','Barangay 184','Barangay 185','Barangay 186','Barangay 187','Barangay 188'
];

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
  const { data, isLoading, error } = useFallbacks();
  const createMut = useCreateFallback();
  const updateMut = useUpdateFallback();
  const deleteMut = useDeleteFallback();

  const items = useMemo(() => data?.data?.places || data?.places || data?.data?.fallbacks || data?.fallbacks || [], [data]);

  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [fallbackToDelete, setFallbackToDelete] = useState(null);
  const [form, setForm] = useState({ name: '', barangay: '', notes: '', lat: '', lng: '' });
  const isDeleting = deleteMut.isLoading;

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || '',
        barangay: editing.barangay || '',
        notes: editing.notes || '',
        lat: editing.location?.coordinates?.[1] ?? '',
        lng: editing.location?.coordinates?.[0] ?? '',
      });
    } else {
      setForm({ name: '', barangay: '', notes: '', lat: '', lng: '' });
    }
  }, [editing]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const q = (query || '').toLowerCase();
      const matchQ = !q || i.name?.toLowerCase().includes(q) || i.notes?.toLowerCase().includes(q);
      return matchQ;
    });
  }, [items, query]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setModalOpen(true); };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      const name = (form.name || '').trim();
      const barangay = (form.barangay || '').trim();
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

      const payload = {
        name,
        category: editing?.category || 'other',
        barangay,
        notes,
        latitude: lat,
        longitude: lng,
      };
      if (editing) {
        await updateMut.mutateAsync({ id: editing._id, data: payload });
        toast.success('Fallback place updated');
      } else {
        await createMut.mutateAsync(payload);
        toast.success('Fallback place created');
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
      toast.success('Fallback place deleted');
      setFallbackToDelete(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Fallback Places</h1>
          <p className="text-white/60">Manage verified flood spots used when offline</p>
        </div>
        <div className="flex gap-2">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search name/notes" className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/50"/>
          <button onClick={openCreate} className="px-4 py-2 duration-300 transition-all rounded-xl shadow-[0_4px_16px_rgba(197,73,20,0.3)] hover:-translate-y-0.5 shrink-0 whitespace-nowrap" style={{ background: 'linear-gradient(135deg, #c54914 0%, #7a2200 100%)' }}>Add Place</button>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">   
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-sm text-white/70">Name</th>
                <th className="px-4 py-3 text-left text-sm text-white/70">Barangay</th>
                <th className="px-4 py-3 text-left text-sm text-white/70">Notes / Landmark</th>
                <th className="px-4 py-3 text-left text-sm text-white/70">Actions</th>

              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {isLoading && (
                <tr><td className="px-4 py-6 text-white/70" colSpan={4}>Loading...</td></tr>
              )}
              {error && (
                <tr><td className="px-4 py-6 text-red-400" colSpan={4}>Failed to load</td></tr>
              )}
              {!isLoading && !error && filtered.map((i) => (
                <tr key={i._id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-white">{i.name}</td>
                  <td className="px-4 py-3 text-white/80">{i.barangay}</td>
                  <td className="px-4 py-3 text-white/60">{i.notes || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button title="Edit" onClick={()=>openEdit(i)} className="w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4h2a2 2 0 012 2v2m-1 5l3-3a2.121 2.121 0 10-3-3l-3 3m-1 1l-4 4v2h2l4-4"/></svg>
                      </button>
                      <button title="Delete" onClick={()=>openDeleteModal(i)} disabled={isDeleting} className="w-9 h-9 rounded-lg hover:bg-red-500/10 flex items-center justify-center disabled:opacity-50">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-1-2H10a1 1 0 00-1 1v1h8V6a1 1 0 00-1-1z"/></svg>
                      </button>
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
              <h3 className="text-xl font-bold text-white">{editing ? 'Edit' : 'Add'} Fallback Place</h3>
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
                  <option value="">Select barangay</option>
                  {BARANGAYS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
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
                <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="px-4 py-2 bg-accent-orange hover:bg-bright-orange text-space-black font-semibold rounded-lg">
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
        title="Delete Fallback Place"
        description="This will remove the place from the fallback registry used by the admin panel."
        itemLabel="Fallback Place"
        itemValue={fallbackToDelete ? `${fallbackToDelete.name}${fallbackToDelete.barangay ? ` - ${fallbackToDelete.barangay}` : ''}` : undefined}
        confirmText="Delete Place"
      />
    </div>
  );
};

export default AdminFallbacks;
