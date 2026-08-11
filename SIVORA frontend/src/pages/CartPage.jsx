import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { PageLoader } from '../components/Spinner'

const PH = 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=200&auto=format&fit=crop'

export default function CartPage() {
  const { cart, loading, fetchCart, updateCart, removeFromCart, cartTotal } = useCart()
  const { isLoggedIn } = useAuth()

  useEffect(() => { if (isLoggedIn) fetchCart() }, [isLoggedIn])

  if (!isLoggedIn) return (
    <div className="max-w-lg mx-auto px-5 py-24 text-center">
      <p className="font-serif text-3xl text-charcoal mb-4">Your Cart</p>
      <p className="font-sans text-sm text-stone mb-8">Please login to view your cart.</p>
      <Link to="/login" className="bg-charcoal text-cream font-sans text-[11px] tracking-widest uppercase px-8 py-3.5 hover:bg-espresso transition-colors">Login</Link>
    </div>
  )

  if (loading) return <PageLoader/>

  if (cart.length === 0) return (
    <div className="max-w-lg mx-auto px-5 py-24 text-center">
      <svg className="w-16 h-16 text-stone mx-auto mb-6" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      <p className="font-serif text-3xl text-charcoal mb-3">Your cart is empty</p>
      <p className="font-sans text-sm text-stone mb-8">Add some beautiful pieces to get started.</p>
      <Link to="/shop" className="bg-charcoal text-cream font-sans text-[11px] tracking-widest uppercase px-8 py-3.5 hover:bg-espresso transition-colors">Shop Now</Link>
    </div>
  )

  const shipping = cartTotal >= 99 ? 0 : 9.99

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <h1 className="font-semibold text-3xl text-charcoal mb-10">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header row */}
          <div className="hidden md:grid grid-cols-[2fr,1fr,1fr,auto] gap-4 pb-3 border-b border-sand">
            {['Product','Price','Quantity','Total'].map(h=>(
              <span key={h} className="font-sans text-[10px] tracking-widest uppercase text-stone">{h}</span>
            ))}
          </div>

          {cart.map(item => {
            const product = item.product || item
            const imgUrl = product?.image
            ? (
                product.image.startsWith('http')
                  ? product.image
                  : `${import.meta.env.VITE_STORAGE_URL}/${product.image}`
              )
            : PH
            const price = parseFloat(product?.price || 0)
            const lineTotal = price * (item.quantity || 1)

            return (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-[2fr,1fr,1fr,auto] gap-4 items-center py-4 border-b border-sand">
                <div className="flex gap-4 items-center">
                  <Link to={`/products/${product?.id}`} className="w-20 h-24 bg-sand flex-shrink-0 overflow-hidden block">
                    <img src={imgUrl} alt={product?.name} className="w-full h-full object-cover" onError={e=>{e.target.src=PH}}/>
                  </Link>
                  <div>
                    <Link to={`/products/${product?.id}`} className="font-sans text-sm font-semibold text-charcoal hover:text-stone transition-colors block mb-1">{product?.name}</Link>
                    <p className="font-sans text-xs text-stone">{product?.category?.name}</p>
                    <button onClick={() => removeFromCart(item.id)} className="font-sans text-[10px] tracking-widest uppercase text-red-500 hover:text-red-700 transition-colors mt-2 flex items-center gap-1">
                      <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
                      Remove
                    </button>
                  </div>
                </div>
                <p className="font-sans text-sm font-semibold text-charcoal md:text-left">${price.toFixed(2)}</p>
                <div className="flex items-center border border-sand w-fit">
                  <button onClick={() => item.quantity > 1 ? updateCart(item.id, item.quantity-1) : removeFromCart(item.id)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-sand transition-colors font-sans text-charcoal">−</button>
                  <span className="w-8 text-center font-sans text-sm text-charcoal">{item.quantity}</span>
                  <button onClick={() => updateCart(item.id, item.quantity+1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-sand transition-colors font-sans text-charcoal">+</button>
                </div>
                <p className="font-sans text-sm font-semibold text-charcoal">${lineTotal.toFixed(2)}</p>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="bg-white p-6 border border-sand h-fit sticky top-24">
          <h2 className="font-style: italic; text-2xl text-charcoal mb-6">Order Summary</h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between font-sans text-sm text-stone">
              <span>Subtotal ({cart.length} {cart.length===1?'item':'items'})</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-sans text-sm text-stone">
              <span>Shipping</span>
              <span className={shipping===0?'text-green-600':''}>
                {shipping===0 ? 'Free' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            {cartTotal < 99 && <p className="font-sans text-[11px] text-stone">Add ${(99-cartTotal).toFixed(2)} more for free shipping</p>}
            <div className="border-t border-sand pt-3 flex justify-between font-sans text-sm font-semibold text-charcoal">
              <span>Total</span>
              <span>${(cartTotal + shipping).toFixed(2)}</span>
            </div>
          </div>
          <Link to="/checkout"
            className="block w-full text-center bg-charcoal text-cream font-sans text-[11px] tracking-widest uppercase py-4 hover:bg-espresso transition-colors mb-3">
            Proceed to Checkout
          </Link>
          <Link to="/shop"
            className="block w-full text-center border border-sand text-charcoal font-sans text-[11px] tracking-widest uppercase py-3.5 hover:border-charcoal transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
