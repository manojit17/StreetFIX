// Navbar.jsx — updated with confirmed nav order + live notifications
// Home | Community | Report Issue | Verify Issues | Dashboard | [🔔] [avatar→Profile]
import { useState, useEffect } from 'react'
import { Bell, Menu, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import AuthModal from './AuthModal'


function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  )
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoint])
  return isMobile
}

export default function Navbar({ currentPage, setCurrentPage }) {
  const { isLoggedIn, user, clearAuth, showToast, notifOpen, toggleNotif, closeNotif } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authModal,  setAuthModal]  = useState(null)
  const isMobile = useIsMobile(768)

  // ── Live notifications state ────────────────────────────────
  const [notifs,        setNotifs]        = useState([])
  const [notifsLoading, setNotifsLoading]  = useState(false)
  const [unreadCount,   setUnreadCount]    = useState(0)

  // Fetch notifications whenever the panel opens
  useEffect(() => {
    if (!notifOpen || !isLoggedIn) return
    const fetchNotifs = async () => {
      setNotifsLoading(true)
      try {
        const token = localStorage.getItem('sf-token')
        const res   = await fetch(`${import.meta.env.VITE_API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) {
          setNotifs(data.data || [])
          setUnreadCount((data.data || []).filter(n => !n.read).length)
        }
      } catch {}
      finally { setNotifsLoading(false) }
    }
    fetchNotifs()
  }, [notifOpen, isLoggedIn])

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('sf-token')
      await fetch(`${import.meta.env.VITE_API_URL}/notifications/read-all`, {
        method : 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifs(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {}
  }

  const notifIcon = (type) => {
    if (type === 'support')       return '👍'
    if (type === 'comment')       return '💬'
    if (type === 'verification')  return '✅'
    if (type === 'status_change') return '🔄'
    return '🔔'
  }

  const timeAgo = (iso) => {
    if (!iso) return ''
    const mins = Math.floor((Date.now() - new Date(iso)) / 60000)
    if (mins < 60)  return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)   return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  // ── CONFIRMED NAV ORDER ──────────────────────────────────────
  // Home | Community | Report Issue | Verify Issues | Dashboard
  const links = [
    { id:'landing',  label:'Home'          },
    { id:'community',label:'Community'     },
    { id:'report',   label:'Report Issue'  },
    { id:'verify',   label:'Verify Issues' },
    { id:'dashboard',label:'Dashboard'     },
    ...(user?.role === 'admin' ? [{ id:'admin', label:'Admin' }] : []),
  ]

  const navigate = (page) => {
    setCurrentPage(page)
    setMobileOpen(false)
    closeNotif()
  }

  const logout = () => {
    clearAuth()
    navigate('landing')
    showToast('👋', 'Signed Out', 'You have been logged out successfully.')
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <>
      {/* ── Navbar bar ── */}
      <nav style={{
        background:'#ffffff', borderBottom:'1px solid #e5e7eb',
        position:'fixed', top:0, left:0, right:0,
        zIndex:48, height:64, display:'flex', alignItems:'center',
        boxShadow:'0 1px 3px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          display:'flex', alignItems:'center', width:'100%',
          maxWidth:1200, margin:'0 auto',
          padding: isMobile ? '0 14px' : '0 24px',
        }}>

          {/* Logo */}
          <div onClick={() => navigate('landing')}
            style={{ display:'flex', alignItems:'center', gap:8,
                     fontFamily:'Poppins,sans-serif', fontWeight:700,
                     fontSize:'1.1rem', cursor:'pointer', marginRight:'auto', flexShrink:0 }}>
            <div style={{ width:34, height:34, background:'#1e3a5f', borderRadius:8,
                         display:'grid', placeItems:'center', fontSize:'1rem', color:'white', flexShrink:0 }}>
              🛣️
            </div>
            <span>Road<span style={{ color:'#ff6b35' }}>Watch</span></span>
          </div>

          {/* Desktop nav links */}
          {!isMobile && (
            <div style={{ display:'flex', gap:2 }}>
              {links.map(l => (
                <button key={l.id} className={`nav-link ${currentPage === l.id ? 'active' : ''}`}
                  onClick={() => navigate(l.id)}>
                  {l.label}
                </button>
              ))}
            </div>
          )}

          {/* Right controls */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:16, flexShrink:0 }}>

            {/* Bell icon */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <button
                onClick={toggleNotif}
                aria-label="Notifications"
                style={{ width:36, height:36, background: notifOpen ? '#f0f4ff' : '#f9fafb',
                         border: `1px solid ${notifOpen ? '#1e3a5f' : '#e5e7eb'}`,
                         borderRadius:8, display:'grid', placeItems:'center',
                         cursor:'pointer', position:'relative' }}>
                <Bell size={16} color={notifOpen ? '#1e3a5f' : '#1f2937'} />
                {/* Red dot — only shows when there are unread notifications */}
                {unreadCount > 0 && (
                  <div style={{
                    position:'absolute', top:6, right:6,
                    width:8, height:8, borderRadius:'50%',
                    background:'#ef4444',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'0.5rem', color:'white', fontWeight:700,
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </button>
            </div>

            {/* Auth area */}
            {isLoggedIn ? (
              <>
                {/* Clickable avatar → Profile page */}
                <div
                  onClick={() => navigate('profile')}
                  title="My Profile"
                  style={{
                    width:36, height:36, background:'#1e3a5f', borderRadius:'50%',
                    overflow:'hidden', display:'grid', placeItems:'center',
                    fontSize:'0.74rem', fontWeight:700, color:'white', flexShrink:0,
                    cursor:'pointer', border:'2px solid transparent', transition:'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#ff6b35'
                    e.currentTarget.style.transform   = 'scale(1.08)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'transparent'
                    e.currentTarget.style.transform   = 'scale(1)'
                  }}
                >
                  {user?.avatar
                    ? <img src={user.avatar} alt="Avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : initials
                  }
                </div>
                {!isMobile && (
                  <button className="nav-link btn-sm" onClick={logout}>Logout</button>
                )}
              </>
            ) : (
              <>
                {!isMobile && (
                  <button className="btn-outline btn-sm" onClick={() => setAuthModal('login')}>
                    Sign In
                  </button>
                )}
                <button className="btn-accent btn-sm" onClick={() => setAuthModal('choose')}>
                  {isMobile ? 'Start' : 'Get Started'}
                </button>
              </>
            )}

            {/* Hamburger — mobile only */}
            {isMobile && (
              <button onClick={() => setMobileOpen(prev => !prev)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                style={{ background:'none', border:'none', cursor:'pointer', display:'flex', padding:4, flexShrink:0 }}>
                {mobileOpen ? <X size={22} color="#1f2937" /> : <Menu size={22} color="#1f2937" />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Notification panel */}
      {notifOpen && (
        <div style={isMobile
          ? { position:'fixed', top:64, left:8, right:8, width:'auto',
              zIndex:51, borderRadius:12, boxShadow:'0 8px 24px rgba(0,0,0,0.14)',
              background:'#ffffff', overflow:'hidden' }
          : { position:'fixed', top:64, right:24, width:320,
              zIndex:51, borderRadius:12, boxShadow:'0 8px 24px rgba(0,0,0,0.14)',
              background:'#ffffff', overflow:'hidden' }
        }>
          {/* Panel header */}
          <div style={{ padding:'13px 16px', borderBottom:'1px solid #f3f4f6',
                        display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
            <h4 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.92rem', margin:0,
                        display:'flex', alignItems:'center' }}>
              Notifications
              {unreadCount > 0 && (
                <span style={{ background:'#ef4444', color:'white', borderRadius:20,
                               padding:'1px 7px', fontSize:'0.7rem', marginLeft:6 }}>
                  {unreadCount}
                </span>
              )}
            </h4>
            <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
              {unreadCount > 0 && (
                <button className="nav-link btn-sm" style={{ fontSize:'0.76rem' }}
                  onClick={handleMarkAllRead}>
                  Mark all read
                </button>
              )}
              <button className="nav-link btn-sm" style={{ fontSize:'0.76rem' }} onClick={closeNotif}>
                Close
              </button>
            </div>
          </div>

          {/* Panel body */}
          <div style={{ maxHeight:360, overflowY:'auto' }}>
            {notifsLoading && (
              <div style={{ padding:24, textAlign:'center', color:'#9ca3af', fontSize:'0.84rem' }}>
                Loading...
              </div>
            )}

            {!notifsLoading && notifs.length === 0 && (
              <div style={{ padding:'32px 16px', textAlign:'center', color:'#9ca3af' }}>
                <div style={{ fontSize:'1.8rem', marginBottom:8 }}>🔔</div>
                <p style={{ fontSize:'0.84rem', fontWeight:500, marginBottom:4 }}>No notifications yet</p>
                <p style={{ fontSize:'0.76rem' }}>
                  You'll be notified when someone supports, comments, or verifies your reports.
                </p>
              </div>
            )}

            {!notifsLoading && notifs.map(n => (
              <div key={n._id}
                style={{ padding:'11px 16px', borderBottom:'1px solid #f3f4f6',
                         display:'flex', gap:10, cursor:'pointer',
                         background: n.read ? '#fff' : 'rgba(30,58,95,0.03)' }}>
                <div style={{ fontSize:'1.1rem', flexShrink:0, marginTop:2 }}>
                  {notifIcon(n.type)}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'0.82rem', fontWeight: n.read ? 400 : 600,
                                marginBottom:2, color:'#111827', lineHeight:1.4 }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize:'0.72rem', color:'#9ca3af' }}>
                    {timeAgo(n.createdAt)}
                  </div>
                </div>
                {!n.read && (
                  <div style={{ width:7, height:7, borderRadius:'50%',
                                background:'#1e3a5f', flexShrink:0, marginTop:5 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {notifOpen && (
        <div onClick={closeNotif} style={{ position:'fixed', inset:0, zIndex:50 }} />
      )}

      {/* Mobile menu */}
      {isMobile && mobileOpen && (
        <div style={{ position:'fixed', top:64, left:0, right:0, background:'#ffffff',
                      borderBottom:'1px solid #e5e7eb', zIndex:49, padding:16,
                      boxShadow:'0 4px 12px rgba(0,0,0,0.08)',
                      maxHeight:'calc(100vh - 64px)', overflowY:'auto' }}>
          {links.map(l => (
            <button key={l.id} className={`nav-link ${currentPage === l.id ? 'active' : ''}`}
              style={{ display:'block', width:'100%', textAlign:'left', marginBottom:4, padding:'10px 14px' }}
              onClick={() => navigate(l.id)}>
              {l.label}
            </button>
          ))}

          {isLoggedIn && (
            <button className="nav-link"
              style={{ display:'block', width:'100%', textAlign:'left', marginBottom:4, padding:'10px 14px' }}
              onClick={() => navigate('profile')}>
              👤 My Profile
            </button>
          )}

          {isLoggedIn ? (
            <button className="btn-outline"
              style={{ width:'100%', justifyContent:'center', marginTop:10 }}
              onClick={() => { logout(); setMobileOpen(false) }}>
              Logout
            </button>
          ) : (
            <div style={{ display:'flex', gap:10, marginTop:12 }}>
              <button className="btn-outline" style={{ flex:1, justifyContent:'center' }}
                onClick={() => { setAuthModal('login'); setMobileOpen(false) }}>Sign In</button>
              <button className="btn-accent" style={{ flex:1, justifyContent:'center' }}
                onClick={() => { setAuthModal('choose'); setMobileOpen(false) }}>Get Started</button>
            </div>
          )}
        </div>
      )}

      {authModal && (
        <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onSwitch={setAuthModal} />
      )}
    </>
  )
}