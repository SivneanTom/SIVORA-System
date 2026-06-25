import { createContext, useContext, useState, useCallback } from 'react'
import { cartAPI } from '../api'

const Ctx = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true)
      const r = await cartAPI.get()
      setCart(r.data?.data || r.data || [])
    } catch { setCart([]) }
    finally { setLoading(false) }
  }, [])

  const addToCart = async (productId, quantity = 1) => {
    await cartAPI.add({ product_id: productId, quantity })
    await fetchCart()
  }
  const updateCart = async (id, quantity) => {
    await cartAPI.update(id, { quantity })
    await fetchCart()
  }
  const clearCart = () => {
  setCart([]);
};
  const removeFromCart = async (id) => {
    await cartAPI.remove(id)
    await fetchCart()
  }

  const cartCount = cart.reduce((s, i) => s + (i.quantity || 1), 0)
  const cartTotal = cart.reduce((s, i) => s + ((i.product?.price || 0) * (i.quantity || 1)), 0)

  return (
<Ctx.Provider 
value={{ 
 cart, 
 loading, 
 fetchCart, 
 addToCart, 
 updateCart, 
 removeFromCart,
 clearCart,
 cartCount, 
 cartTotal 
}}>      {children}
    </Ctx.Provider>
  )
}

export const useCart = () => useContext(Ctx)
