import { createContext, useContext, useState } from 'react'

const AuthContext  = createContext(null)
const SESSION_KEY  = 'pbw:session'

function readSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) }
  catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession)

  const login = (userData) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export const isAdmin   = (user) => user?.role === 'admin'
export const isChofer  = (user) => user?.role === 'chofer'
