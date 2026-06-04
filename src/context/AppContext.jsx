import { createContext, useContext, useState, useCallback, useRef } from 'react'
const AppContext = createContext()
export function AppProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [toast, setToast] = useState({ show: false, icon: '', title: '', msg: '', key: 0 })
  const timerRef = useRef(null)
  const showToast = useCallback((icon, title, msg) => {
    clearTimeout(timerRef.current)
    setToast({ show: true, icon, title, msg, key: Date.now() })
    timerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 3400)
  }, [])
  return (
    <AppContext.Provider value={{ isLoggedIn, setIsLoggedIn, toast, showToast }}>
      {children}
    </AppContext.Provider>
  )
}
export const useApp = () => useContext(AppContext)
