// Navbar.jsx — fully fixed, reads notifOpen from AppContext
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

  const links = [
    { id:'landing',   label:'Home'         },
    { id:'home',      label:'Overview'     },
    { id:'dashboard', label:'Dashboard'    },
    { id:'report',    label:'Report Issue' },
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
            <span>Street<span style={{ color:'#ff6b35' }}>Fix</span></span>
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
                         borderRadius:8, display:'grid', placeItems:'center', cursor:'pointer' }}>
                <Bell size={16} color={notifOpen ? '#1e3a5f' : '#1f2937'} />
              </button>
            </div>

            {/* Auth area */}
            {isLoggedIn ? (
              <>
                {/* Clickable Avatar circle */}
                <div
                  onClick={() => navigate('profile')}
                  title="My Profile"
                  style={{
                    width:36, height:36,
                    background:'#1e3a5f',
                    borderRadius:'50%',
                    overflow:'hidden', // ✅ Prevents photo from overflowing the circle border
                    display:'grid', placeItems:'center',
                    fontSize:'0.74rem', fontWeight:700,
                    color:'white', flexShrink:0,
                    cursor:'pointer',
                    border:'2px solid transparent',
                    transition:'all 0.2s',
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
                  {/* ✅ Show profile picture if it exists, otherwise show initials */}
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Avatar" 
                      style={{ width:'100%', height:'100%', objectFit:'cover' }} 
                    />
                  ) : (
                    initials
                  )}
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
                <button className="btn-accent btn-sm" onClick={() => setAuthModal('signup')}>
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
          ? { position:'fixed', top:64, left:8, right:8, width:'auto', maxWidth:'none',
              zIndex:51, borderRadius:12, boxShadow:'0 8px 24px rgba(0,0,0,0.14)',
              background:'#ffffff', overflow:'hidden' }
          : { position:'fixed', top:64, right:24, width:320,
              zIndex:51, borderRadius:12, boxShadow:'0 8px 24px rgba(0,0,0,0.14)',
              background:'#ffffff', overflow:'hidden' }
        }>
          <div style={{ padding:'13px 16px', borderBottom:'1px solid #f3f4f6',
                        display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h4 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.92rem', margin:0 }}>
              Notifications
            </h4>
            <button className="nav-link btn-sm" style={{ fontSize:'0.76rem' }} onClick={closeNotif}>
              Close
            </button>
          </div>
          <div style={{ padding:'32px 16px', textAlign:'center', color:'#9ca3af' }}>
            <div style={{ fontSize:'1.8rem', marginBottom:8 }}>🔔</div>
            <p style={{ fontSize:'0.84rem', fontWeight:500, marginBottom:4 }}>No notifications yet</p>
            <p style={{ fontSize:'0.76rem' }}>You'll be notified when your report status changes.</p>
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

          {/* Profile link in mobile menu */}
          {isLoggedIn && (
            <button
              className="nav-link"
              style={{ display:'block', width:'100%', textAlign:'left', marginBottom:4, padding:'10px 14px' }}
              onClick={() => navigate('profile')}
            >
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
                onClick={() => { setAuthModal('signup'); setMobileOpen(false) }}>Get Started</button>
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