import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { addressAPI } from '../api'
import { useToast } from '../context/ToastContext'
import { PageLoader } from '../components/Spinner'

const BLANK = { name:'', phone:'', address:'', city:'', state:'', zip:'', country:'US' }

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [tab, setTab] = useState('profile')
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(BLANK)

  useEffect(() => {
    addressAPI.getAll()
      .then(r => setAddresses(r.data?.data || r.data || []))
      .finally(() => setLoading(false))
  }, [])

  const startEdit = addr => {
    setEditId(addr.id)
    setForm({ name:addr.name||'', phone:addr.phone||'', address:addr.address||'', city:addr.city||'', state:addr.state||'', zip:addr.zip||'', country:addr.country||'US' })
    setShowForm(true)
  }

  const startNew = () => { setEditId(null); setForm(BLANK); setShowForm(true) }

  const save = async () => {
    if (!form.name || !form.address || !form.city) { toast('Fill required fields', 'error'); return }
    try {
      if (editId) {
        const r = await addressAPI.update(editId, form)
        setAddresses(prev => prev.map(a => a.id===editId ? (r.data?.data||r.data||a) : a))
        toast('Address updated')
      } else {
        const r = await addressAPI.create(form)
        setAddresses(prev => [...prev, r.data?.data||r.data])
        toast('Address added')
      }
      setShowForm(false); setEditId(null); setForm(BLANK)
    } catch { toast('Save failed', 'error') }
  }

  const del = async id => {
    if (!confirm('Delete this address?')) return
    await addressAPI.delete(id)
    setAddresses(prev => prev.filter(a => a.id!==id))
    toast('Address deleted')
  }

  if (loading) return <PageLoader/>

  const TABS = [['profile','Profile'],['addresses','Addresses'],['security','Security']]

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="font-semibold text-2xl text-charcoal mb-8">My Account</h1>

      <div className="flex gap-0 border-b border-sand mb-8">
        {TABS.map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`font-sans text-[11px] tracking-widest uppercase px-6 py-3 border-b-2 transition-colors ${tab===k?'border-charcoal text-charcoal':'border-transparent text-stone hover:text-charcoal'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab==='profile' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-charcoal rounded-full flex items-center justify-center text-cream font-serif text-4xl mb-4">
              {user?.name?.[0]?.toUpperCase()||'U'}
            </div>
            <p className="font-normal text-xl text-charcoal">{user?.name}</p>
            <p className="font-normal text-xs text-stone mt-1">{user?.email}</p>
            <span className={`mt-3 font-normal text-[10px] tracking-widest uppercase px-3 py-1 ${user?.role==='admin'?'bg-purple-100 text-purple-700':'bg-sand text-stone'}`}>{user?.role||'customer'}</span>
          </div>
          <div className="md:col-span-2 bg-white border border-sand p-6">
            <h2 className="font-noemal text-sm tracking-widest uppercase text-charcoal mb-5">Account Details</h2>
            <div className="space-y-4">
              {[['Full Name',user?.name||'—'],['Email Address',user?.email||'—'],['Member Since',user?.created_at?new Date(user.created_at).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}):'N/A'],['Account Type',user?.role||'customer']].map(([l,v])=>(
                <div key={l} className="flex gap-4 py-3 border-b border-sand last:border-0">
                  <span className="font-normal text-[10px] tracking-widest uppercase text-stone w-32 flex-shrink-0">{l}</span>
                  <span className="font-normal text-sm text-charcoal">{v}</span>
                </div>
              ))}
            </div>
            <button onClick={logout} className="mt-6 border border-red-200 text-red-600 font-normal text-[11px] tracking-widest uppercase px-5 py-2.5 hover:bg-red-50 transition-colors flex items-center gap-2">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Addresses Tab */}
      {tab==='addresses' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {addresses.map(addr => (
              <div key={addr.id} className="bg-white border border-sand p-5">
                <p className="font-sans text-sm font-semibold text-charcoal mb-1">{addr.name}</p>
                <p className="font-sans text-xs text-stone mb-0.5">{addr.address}</p>
                <p className="font-sans text-xs text-stone mb-0.5">{addr.city}, {addr.state} {addr.zip}</p>
                <p className="font-sans text-xs text-stone mb-4">{addr.phone}</p>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(addr)} className="font-sans text-[10px] tracking-widest uppercase border border-sand px-3 py-1.5 text-charcoal hover:border-charcoal transition-colors">Edit</button>
                  <button onClick={() => del(addr.id)} className="font-sans text-[10px] tracking-widest uppercase border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50 transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={startNew}
            className="flex items-center gap-2 border border-dashed border-sand px-5 py-3 font-sans text-[11px] tracking-widest uppercase text-charcoal hover:border-charcoal transition-colors mb-5">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add New Address
          </button>

          {showForm && (
            <div className="bg-white border border-sand p-6 max-w-lg">
              <h3 className="font-sans text-sm tracking-widests uppercase text-charcoal mb-4">{editId?'Edit':'New'} Address</h3>
              <div className="grid grid-cols-2 gap-4">
                {[['name','Full Name *'],['phone','Phone'],['address','Street Address *'],['city','City *'],['state','State'],['zip','ZIP Code']].map(([f,l])=>(
                  <div key={f} className={f==='address'?'col-span-2':''}>
                    <label className="font-sans text-[10px] tracking-widest uppercase text-stone block mb-1">{l}</label>
                    <input value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})}
                      className="w-full border border-sand px-3 py-2.5 font-sans text-sm outline-none focus:border-charcoal transition-colors"/>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={save} className="bg-charcoal text-cream font-sans text-[11px] tracking-widest uppercase px-5 py-2.5 hover:bg-espresso transition-colors">Save</button>
                <button onClick={() => { setShowForm(false); setEditId(null) }} className="border border-sand text-charcoal font-sans text-[11px] tracking-widest uppercase px-5 py-2.5 hover:border-charcoal transition-colors">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security Tab */}
      {tab==='security' && (
        <div className="max-w-md">
          <div className="bg-white border border-sand p-6">
            <h2 className="font-sans text-sm tracking-widest uppercase text-charcoal mb-5">Change Password</h2>
            <div className="space-y-4">
              {['Current Password','New Password','Confirm New Password'].map(l=>(
                <div key={l}>
                  <label className="font-sans text-[10px] tracking-widest uppercase text-stone block mb-1">{l}</label>
                  <input type="password" className="w-full border border-sand px-3 py-2.5 font-sans text-sm outline-none focus:border-charcoal transition-colors" placeholder="••••••••"/>
                </div>
              ))}
              <button className="bg-charcoal text-cream font-sans text-[11px] tracking-widest uppercase px-6 py-3 hover:bg-espresso transition-colors">Update Password</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
