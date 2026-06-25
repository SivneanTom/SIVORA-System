import { useState, useEffect } from 'react';
import { productAPI, categoryAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { PageLoader } from '../../components/Spinner';

// Matches the actual `products` table columns:
// name, description, category, price, discount_price, image, status
const EMPTY = {
  name: '',
  description: '',
  category: '',       // category_id (FK), stored in the `category` column
  price: '',
  discount_price: '',
  status: 'active',   // adjust to 'in_stock' / 'out_of_stock' / 1 / 0 if your backend expects that
  image: null,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    Promise.all([productAPI.getAll(), categoryAPI.getAll()])
      .then(([pr, cr]) => {
        setProducts(pr.data?.data || pr.data || []);
        setCategories(cr.data?.data || cr.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setErrors({}); setModal(true); };
  const openEdit = (p) => {
    setEditing(p.id);
    setForm({
      name: p.name || '',
      description: p.description || '',
      category: p.category || p.category_id || '',
      price: p.price ?? '',
      discount_price: p.discount_price ?? '',
      status: p.status || 'active',
      image: null,
    });
    setErrors({});
    setModal(true);
  };

  // Required-field validation — prevents the backend NOT NULL error
  const validate = () => {
    const errs = {};
    if (!form.name?.trim()) errs.name = 'Product name is required';
    if (form.price === '' || form.price === null) errs.price = 'Price is required';
    if (!form.category) errs.category = 'Category is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast('Please fill in all required fields', 'error');
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      // Always send required text fields, even if "empty" strings —
      // only skip `image` when no new file was chosen (so it doesn't overwrite on edit).
      fd.append('name', form.name.trim());
      fd.append('description', form.description || '');
      fd.append('category', form.category);
      fd.append('price', form.price);
      fd.append('discount_price', form.discount_price === '' ? 0 : form.discount_price);
      fd.append('status', form.status);
      if (form.image) fd.append('image', form.image);

      if (editing) {
        const res = await productAPI.update(editing, fd);
        setProducts(products.map((p) => p.id === editing ? (res.data?.data || res.data || p) : p));
        toast('Product updated');
      } else {
        const res = await productAPI.create(fd);
        setProducts([res.data?.data || res.data, ...products]);
        toast('Product created');
      }
      setModal(false);
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        // Surface Laravel validation messages (e.g. "The name field is required.")
        const firstError = Object.values(apiErrors)[0]?.[0];
        toast(firstError || 'Save failed', 'error');
      } else {
        toast(err.response?.data?.message || 'Save failed', 'error');
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productAPI.delete(id);
      setProducts(products.filter((p) => p.id !== id));
      toast('Product deleted');
    } catch { toast('Failed to delete product', 'error'); }
  };

  const filtered = products.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-normal text-2xl text-charcoal">Products</h1>
        <button onClick={openCreate} className="bg-charcoal text-cream font-sans text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-espresso transition-colors flex items-center gap-2">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Product
        </button>
      </div>

      <div className="mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="border border-gray-200 px-4 py-2.5 font-sans text-sm outline-none focus:border-charcoal transition-colors w-72 bg-white"/>
      </div>

      <div className="bg-white border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Product','Category','Price','Discount','Status','Actions'].map((h) => (
                <th key={h} className="text-left font-sans text-[10px] tracking-widest uppercase text-stone px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => {
              const imgUrl = product.image ? (product.image.startsWith('http') ? product.image : `http://127.0.0.1:8000/storage/${product.image}`) : 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=80&auto=format&fit=crop';
              const categoryName = categories.find((c) => String(c.id) === String(product.category || product.category_id))?.name || product.category || '—';
              return (
                <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <img src={imgUrl} alt={product.name} className="w-10 h-12 object-cover bg-sand flex-shrink-0" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=80'; }}/>
                    <div>
                      <p className="font-sans text-sm font-semibold text-charcoal">{product.name}</p>
                      <p className="font-sans text-[10px] text-stone">ID: {product.id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-sans text-xs text-stone">{categoryName}</td>
                  <td className="px-4 py-3 font-sans text-sm font-semibold text-charcoal">${parseFloat(product.price || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 font-sans text-xs text-stone">{product.discount_price ? `$${parseFloat(product.discount_price).toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`font-sans text-[10px] tracking-widest uppercase px-2 py-1 ${product.status === 'active' || product.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{product.status ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(product)} className="font-sans text-[10px] tracking-widest uppercase border border-gray-200 px-3 py-1.5 hover:border-charcoal transition-colors">Edit</button>
                      <button onClick={() => handleDelete(product.id)} className="font-sans text-[10px] tracking-widest uppercase border border-red-200 text-red-600 px-3 py-1.5 hover:bg-red-50 transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="py-12 text-center font-sans text-sm text-stone">No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-sans text-sm tracking-widest uppercase text-charcoal">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setModal(false)} className="text-stone hover:text-charcoal"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="font-sans text-[10px] tracking-widest uppercase text-stone block mb-1.5">Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className={`w-full border px-3 py-2.5 font-sans text-sm outline-none focus:border-charcoal transition-colors ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.name && <p className="font-sans text-[10px] text-red-600 mt-1">{errors.name}</p>}
              </div>

              {/* Price + Discount Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-sans text-[10px] tracking-widest uppercase text-stone block mb-1.5">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({...form, price: e.target.value})}
                    className={`w-full border px-3 py-2.5 font-sans text-sm outline-none focus:border-charcoal transition-colors ${errors.price ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.price && <p className="font-sans text-[10px] text-red-600 mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className="font-sans text-[10px] tracking-widest uppercase text-stone block mb-1.5">Discount Price</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.discount_price}
                    onChange={(e) => setForm({...form, discount_price: e.target.value})}
                    placeholder="Optional"
                    className="w-full border border-gray-200 px-3 py-2.5 font-sans text-sm outline-none focus:border-charcoal transition-colors"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="font-sans text-[10px] tracking-widest uppercase text-stone block mb-1.5">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
                  className={`w-full border px-3 py-2.5 font-sans text-sm outline-none focus:border-charcoal bg-white ${errors.category ? 'border-red-400' : 'border-gray-200'}`}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.category && <p className="font-sans text-[10px] text-red-600 mt-1">{errors.category}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="font-sans text-[10px] tracking-widest uppercase text-stone block mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({...form, status: e.target.value})}
                  className="w-full border border-gray-200 px-3 py-2.5 font-sans text-sm outline-none focus:border-charcoal bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="font-sans text-[10px] tracking-widest uppercase text-stone block mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} className="w-full border border-gray-200 px-3 py-2.5 font-sans text-sm outline-none focus:border-charcoal transition-colors resize-none"/>
              </div>

              {/* Image */}
              <div>
                <label className="font-sans text-[10px] tracking-widest uppercase text-stone block mb-1.5">Image{editing ? ' (leave empty to keep current)' : ''}</label>
                <input type="file" accept="image/*" onChange={(e) => setForm({...form, image: e.target.files[0]})} className="w-full font-sans text-sm text-stone"/>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-charcoal text-cream font-sans text-xs tracking-widest uppercase py-3 hover:bg-espresso transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Product'}
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
