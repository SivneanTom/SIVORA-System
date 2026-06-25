import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { wishlistAPI } from '../api'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { PageLoader } from '../components/Spinner'

const PH = 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&auto=format&fit=crop'

export default function WishlistPage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    wishlistAPI.get()
      .then(r => setList(r.data?.data || r.data || []))
      .finally(() => setLoading(false))
  }, [])

  const remove = async (id) => {
  try {
    await wishlistAPI.remove(id);

    setList(prev =>
      prev.filter(item => item.id !== id)
    );

  } catch (error) {
    console.error(error);
  }
};

  const addCart = async p => {
    try { await addToCart(p.id, 1); toast(`${p.name} added to cart`) }
    catch { toast('Could not add to cart', 'error') }
  }

  if (loading) return <PageLoader/>

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="flex items-end justify-between mb-10">
        <h1 className="font-style: italic; text-3xl text-charcoal">My Wishlist</h1>
        {list.length > 0 && <p className="font-sans text-sm text-stone">{list.length} items</p>}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-16 h-16 text-stone mx-auto mb-6" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <p className="font-serif text-2xl text-stone mb-4">Your wishlist is empty</p>
          <Link to="/shop" className="bg-charcoal text-cream font-sans text-[11px] tracking-widest uppercase px-8 py-3.5 hover:bg-espresso transition-colors">Discover Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {list.map(item => {
            const product = item.product || item
            const imgUrl = product?.image ? (product.image.startsWith('http') ? product.image : `http://127.0.0.1:8000/storage/${product.image}`) : PH
            return (
              <div key={item.id} className="group">
                <div className="relative aspect-[3/4] bg-sand overflow-hidden mb-3">
                  <Link to={`/products/${product?.id}`}>
                    <img src={imgUrl} alt={product?.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={e=>{e.target.src=PH}}/>
                  </Link>
                  <button onClick={() => remove(item.id)}
                    className="absolute top-2.5 right-2.5 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-red-50 transition-colors">
                    <svg width="13" height="13" fill="#2C2018" stroke="#2C2018" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
                <Link to={`/products/${product?.id}`} className="font-sans text-xs text-charcoal hover:text-stone transition-colors block mb-1 truncate">{product?.name}</Link>
                <p className="font-sans text-sm font-semibold text-charcoal mb-3">${parseFloat(product?.price||0).toFixed(2)}</p>
                <button onClick={() => addCart(product)} className="w-full bg-charcoal text-cream font-sans text-[10px] tracking-widest uppercase py-2.5 hover:bg-espresso transition-colors">Add to Cart</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
