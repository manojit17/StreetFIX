import { createContext, useContext, useState, useCallback, useRef } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {

  // ── Auth state ─────────────────────────────────────────────
  // Check localStorage on first load so login persists on refresh
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem('sf-token')
  )

  const [user, setUser] = useState(
    () => {
      try {
        return JSON.parse(localStorage.getItem('sf-user')) || null
      } catch {
        return null
      }
    }
  )

  // ── Toast state ────────────────────────────────────────────
  const [toast, setToast] = useState({
    show: false, icon: '', title: '', msg: '', key: 0
  })
  const timerRef = useRef(null)

  // ── showToast ──────────────────────────────────────────────
  const showToast = useCallback((icon, title, msg) => {
    clearTimeout(timerRef.current)
    setToast({ show: true, icon, title, msg, key: Date.now() })
    timerRef.current = setTimeout(
      () => setToast(t => ({ ...t, show: false })),
      3400
    )
  }, [])

  // ── saveAuth — call this after login or signup ─────────────
  const saveAuth = useCallback((token, userData) => {
    localStorage.setItem('sf-token', token)
    localStorage.setItem('sf-user', JSON.stringify(userData))
    setIsLoggedIn(true)
    setUser(userData)
  }, [])

  // ── clearAuth — call this on logout ───────────────────────
  const clearAuth = useCallback(() => {
    localStorage.removeItem('sf-token')
    localStorage.removeItem('sf-user')
    setIsLoggedIn(false)
    setUser(null)
  }, [])

  return (
    <AppContext.Provider value={{
      // auth
      isLoggedIn,
      setIsLoggedIn,
      user,
      saveAuth,
      clearAuth,
      // toast
      toast,
      showToast,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
