import { createContext, useContext, useState } from 'react'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  const login = (u, t) => {
    setUser(u); setToken(t)
    localStorage.setItem('user', JSON.stringify(u))
    localStorage.setItem('token', t)
  }
//   const logout = () => {
//   setUser(null)
//   setToken(null)

//   localStorage.removeItem('user')
//   localStorage.removeItem('token')

//   window.location.href = "/login"
// }
const logout = () => {
  setUser(null)
  setToken(null)

  localStorage.removeItem('user')
  localStorage.removeItem('token')

  window.location.href = "/"
}

  return (
    <Ctx.Provider value={{ user, token, login, logout, isAdmin: user?.role?.toLowerCase() === 'admin', isLoggedIn: !!token }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
