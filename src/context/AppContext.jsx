import { createContext, useContext, useState, useCallback, useRef } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {

  const [isLoggedIn, setIsLoggedIn] = useState(
    () => !!localStorage.getItem('sf-token')
  )

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sf-user')) || null }
    catch { return null }
  })
  const [notifOpen, setNotifOpen] = useState(false)
  const toggleNotif = useCallback(() => setNotifOpen(o => !o), [])
  const closeNotif  = useCallback(() => setNotifOpen(false), [])
  const [toast, setToast] = useState({
    show: false, icon: '', title: '', msg: '', key: 0
  })
  const timerRef = useRef(null)

  const showToast = useCallback((icon, title, msg) => {
    clearTimeout(timerRef.current)
    setToast({ show: true, icon, title, msg, key: Date.now() })
    timerRef.current = setTimeout(
      () => setToast(t => ({ ...t, show: false })), 3400
    )
  }, [])

  const saveAuth = useCallback((token, userData) => {
    localStorage.setItem('sf-token', token)
    localStorage.setItem('sf-user', JSON.stringify(userData))
    setIsLoggedIn(true)
    setUser(userData)
  }, [])

  const clearAuth = useCallback(() => {
    localStorage.removeItem('sf-token')
    localStorage.removeItem('sf-user')
    setIsLoggedIn(false)
    setUser(null)
  }, [])

  return (
    <AppContext.Provider value={{
      isLoggedIn, setIsLoggedIn,
      user, saveAuth, clearAuth,
      toast, showToast,notifOpen, toggleNotif, closeNotif,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)