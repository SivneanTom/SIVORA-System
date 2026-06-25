import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { addressAPI, checkoutAPI } from '../api'
import { PageLoader } from '../components/Spinner'

const PH = 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=80'
const BLANK = { name: '', phone: '', address: '', city: '', state: '', zip: '', country: 'US' }

export default function CheckoutPage() {
  const { cart, cartTotal, fetchCart } = useCart()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState([])
  const [selAddr, setSelAddr] = useState(null)
  const [pageLoad, setPageLoad] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [payment, setPayment] = useState('cash_on_delivery')
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState(BLANK)
  const [step, setStep] = useState(1)

  useEffect(() => {
    addressAPI.getAll()
      .then(r => {
        const adds = r.data?.data || r.data || []
        setAddresses(adds)
        if (adds.length > 0) setSelAddr(adds[0].id)
        else setShowNew(true)
      })
      .finally(() => setPageLoad(false))
  }, [])

  const saveAddr = async () => {
    if (!form.name || !form.address || !form.city) { toast('Fill required fields', 'error'); return }
    try {
      const r = await addressAPI.create(form)
      const saved = r.data?.data || r.data
      setAddresses(prev => [...prev, saved])
      setSelAddr(saved.id); setShowNew(false); setForm(BLANK)
      toast('Address saved')
    } catch { toast('Failed to save address', 'error') }
  }

  const handleCheckout = async () => {
    if (!selAddr) { toast('Select a delivery address', 'error'); return }
    if (cart.length === 0) { toast('Cart is empty', 'error'); return }
    setSubmitting(true)
    try {
      await checkoutAPI.checkout({ address_id: selAddr, payment_method: payment })
      await fetchCart()
      toast('Order placed successfully! 🎉')
      navigate('/orders')
    } catch (err) {
      toast(err.response?.data?.message || 'Checkout failed', 'error')
    } finally { setSubmitting(false) }
  }

  if (pageLoad) return <PageLoader/>

  const shipping = cartTotal >= 99 ? 0 : 9.99
  const total = cartTotal + shipping

  const STEPS = ['Address', 'Payment', 'Review']

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <h1 className="font-medium text-4xl text-charcoal mb-8">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <button onClick={() => i < step && setStep(i+1)}
              className={`flex items-center gap-2 font-sans text-[11px] tracking-widest uppercase transition-colors ${step===i+1?'text-charcoal':'step>i+1?text-stone:text-stone/40'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold border ${step===i+1?'border-charcoal bg-charcoal text-cream':step>i+1?'border-stone bg-stone text-cream':'border-stone/30 text-stone/40'}`}>
                {step > i+1 ? '✓' : i+1}
              </span>
              <span className="hidden sm:inline">{s}</span>
            </button>
            {i < STEPS.length-1 && <div className={`h-px w-8 sm:w-16 mx-2 ${step>i+1?'bg-stone':'bg-stone/20'}`}/>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">

          {/* Step 1: Address */}
          {step === 1 && (
            <div>
              <h2 className="font-sans text-sm tracking-widest uppercase text-charcoal mb-5">Delivery Address</h2>
              <div className="space-y-3 mb-4">
                {addresses.map(addr => (
                  <label key={addr.id} className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${selAddr===addr.id?'border-charcoal bg-white':'border-sand hover:border-stone'}`}>
                    <input type="radio" name="addr" value={addr.id} checked={selAddr===addr.id} onChange={() => setSelAddr(addr.id)} className="mt-1 accent-charcoal"/>
                    <div>
                      <p className="font-sans text-sm font-semibold text-charcoal">{addr.name}</p>
                      <p className="font-sans text-xs text-stone">{addr.address}, {addr.city}, {addr.state} {addr.zip}</p>
                      <p className="font-sans text-xs text-stone">{addr.phone}</p>
                    </div>
                  </label>
                ))}
                <button onClick={() => setShowNew(!showNew)}
                  className="flex items-center gap-2 w-full border border-dashed border-sand px-4 py-3 font-sans text-[11px] tracking-widest uppercase text-charcoal hover:border-charcoal transition-colors">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add New Address
                </button>
              </div>

              {showNew && (
                <div className="border border-sand bg-white p-5 mb-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[['name','Full Name *'],['phone','Phone *'],['address','Street Address *'],['city','City *'],['state','State'],['zip','ZIP Code']].map(([f,l])=>(
                      <div key={f} className={f==='address'?'col-span-2':''}>
                        <label className="font-sans text-[10px] tracking-widest uppercase text-stone block mb-1">{l}</label>
                        <input value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})}
                          className="w-full border border-sand px-3 py-2.5 font-sans text-sm outline-none focus:border-charcoal transition-colors"/>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={saveAddr} className="bg-charcoal text-cream font-sans text-[11px] tracking-widest uppercase px-5 py-2.5 hover:bg-espresso transition-colors">Save</button>
                    <button onClick={() => setShowNew(false)} className="border border-sand text-charcoal font-sans text-[11px] tracking-widest uppercase px-5 py-2.5 hover:border-charcoal transition-colors">Cancel</button>
                  </div>
                </div>
              )}

              <button onClick={() => selAddr && setStep(2)} disabled={!selAddr}
                className="bg-charcoal text-cream font-sans text-[11px] tracking-widest uppercase px-8 py-3.5 hover:bg-espresso transition-colors disabled:opacity-40">
                Continue to Payment →
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div>
              <h2 className="font-sans text-sm tracking-widest uppercase text-charcoal mb-5">Payment Method</h2>
              <div className="space-y-3 mb-8">
                {[['cash_on_delivery','Cash on Delivery','Pay when your order arrives at your door'],['bank_transfer','Bank Transfer','Transfer directly to our bank account'],['credit_card','Credit / Debit Card','Secure online payment (coming soon)']].map(([v,l,s])=>(
                  <label key={v} className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${payment===v?'border-charcoal bg-white':'border-sand hover:border-stone'}`}>
                    <input type="radio" name="pay" value={v} checked={payment===v} onChange={()=>setPayment(v)} className="mt-1 accent-charcoal"/>
                    <div>
                      <p className="font-sans text-sm font-semibold text-charcoal">{l}</p>
                      <p className="font-sans text-xs text-stone">{s}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="border border-sand text-charcoal font-sans text-[11px] tracking-widest uppercase px-6 py-3.5 hover:border-charcoal transition-colors">← Back</button>
                <button onClick={() => setStep(3)} className="bg-charcoal text-cream font-sans text-[11px] tracking-widest uppercase px-8 py-3.5 hover:bg-espresso transition-colors">Review Order →</button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div>
              <h2 className="font-sans text-sm tracking-widest uppercase text-charcoal mb-5">Review Your Order</h2>
              <div className="border border-sand bg-white p-5 mb-5">
                <p className="font-sans text-[10px] tracking-widest uppercase text-stone mb-3">Delivery To</p>
                {addresses.find(a=>a.id===selAddr) && (() => {
                  const a = addresses.find(a=>a.id===selAddr)
                  return <p className="font-sans text-sm text-charcoal">{a.name} — {a.address}, {a.city} {a.zip}</p>
                })()}
              </div>
              <div className="border border-sand bg-white p-5 mb-5">
                <p className="font-sans text-[10px] tracking-widest uppercase text-stone mb-3">Payment</p>
                <p className="font-sans text-sm text-charcoal capitalize">{payment.replace(/_/g,' ')}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="border border-sand text-charcoal font-sans text-[11px] tracking-widest uppercase px-6 py-3.5 hover:border-charcoal transition-colors">← Back</button>
                <button onClick={handleCheckout} disabled={submitting || cart.length===0}
                  className="bg-charcoal text-cream font-sans text-[11px] tracking-widest uppercase px-8 py-3.5 hover:bg-espresso transition-colors disabled:opacity-50 flex items-center gap-2">
                  {submitting && <svg className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" viewBox="0 0 24 24"/>}
                  {submitting ? 'Placing Order…' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white border border-sand p-6 h-fit sticky top-24">
          <h2 className="font-style: italic; text-xl text-charcoal mb-5">Order Summary</h2>
          <div className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1">
            {cart.map(item => {
              const p = item.product || item
              const imgUrl = p?.image ? (p.image.startsWith('http') ? p.image : `http://127.0.0.1:8000/storage/${p.image}`) : PH
              return (
                <div key={item.id} className="flex gap-3 border-b border-sand pb-3 last:border-0">
                  <div className="w-10 h-12 bg-sand flex-shrink-0 overflow-hidden">
                    <img src={imgUrl} alt={p?.name} className="w-full h-full object-cover" onError={e=>{e.target.src=PH}}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-xs font-semibold text-charcoal truncate">{p?.name}</p>
                    <p className="font-sans text-xs text-stone">×{item.quantity}</p>
                  </div>
                  <p className="font-sans text-xs font-semibold text-charcoal flex-shrink-0">${((p?.price||0)*item.quantity).toFixed(2)}</p>
                </div>
              )
            })}
          </div>
          <div className="space-y-2 border-t border-sand pt-4">
            <div className="flex justify-between font-sans text-sm text-stone"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
            <div className="flex justify-between font-sans text-sm text-stone"><span>Shipping</span><span>{shipping===0?<span className="text-green-600">Free</span>:`$${shipping.toFixed(2)}`}</span></div>
            <div className="flex justify-between font-sans text-sm font-bold text-charcoal pt-2 border-t border-sand"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
