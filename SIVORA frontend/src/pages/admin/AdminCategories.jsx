import { useState, useEffect } from 'react';
import { categoryAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { PageLoader } from '../../components/Spinner';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    categoryAPI.getAll().then((res) => setCategories(res.data?.data || res.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '' }); setModal(true); };
  const openEdit = (c) => { setEditing(c.id); setForm({ name: c.name || '', description: c.description || '' }); setModal(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        const res = await categoryAPI.update(editing, form);
        setCategories(categories.map((c) => c.id === editing ? (res.data?.data || res.data || c) : c));
        toast('Category updated');
      } else {
        const res = await categoryAPI.create(form);
        setCategories([...categories, res.data?.data || res.data]);
        toast('Category created');
      }
      setModal(false);
    } catch (err) { toast(err.response?.data?.message || 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Products in this category may be affected.')) return;
    try {
      await categoryAPI.delete(id);
      setCategories(categories.filter((c) => c.id !== id));
      toast('Category deleted');
    } catch { toast('Failed to delete category', 'error'); }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-normal text-2xl text-charcoal">Categories</h1>
        <button onClick={openCreate} className="bg-charcoal text-cream font-sans text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-espresso transition-colors flex items-center gap-2">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-sans text-sm font-semibold text-charcoal">{cat.name}</h3>
              <span className="font-sans text-[10px] text-stone">ID: {cat.id}</span>
            </div>
            <p className="font-sans text-xs text-stone mb-4 line-clamp-2">{cat.description || 'No description'}</p>
            <div className="flex gap-2">
              <button onClick={() => openEdit(cat)} className="font-sans text-[10px] tracking-widest uppercase border border-gray-200 px-3 py-1.5 hover:border-charcoal transition-colors">Edit</button>
              <button onClick={() => handleDelete(cat.id)} className="font-sans text-[10px] tracking-widest uppercase border border-red-200 text-red-600 px-3 py-1.5 hover:bg-red-50 transition-colors">Delete</button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full text-center py-12 font-sans text-sm text-stone">No categories found</div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-sans text-sm tracking-widest uppercase text-charcoal">{editing ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setModal(false)} className="text-stone hover:text-charcoal"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="font-sans text-[10px] tracking-widest uppercase text-stone block mb-1.5">Category Name</label>
                <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full border border-gray-200 px-3 py-2.5 font-sans text-sm outline-none focus:border-charcoal transition-colors"/>
              </div>
              <div>
                <label className="font-sans text-[10px] tracking-widest uppercase text-stone block mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} className="w-full border border-gray-200 px-3 py-2.5 font-sans text-sm outline-none focus:border-charcoal transition-colors resize-none"/>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-charcoal text-cream font-sans text-xs tracking-widest uppercase py-3 hover:bg-espresso transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
                <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 text-charcoal font-sans text-xs tracking-widest uppercase py-3 hover:border-charcoal transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
