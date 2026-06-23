// Navbar.jsx — mobile responsive, notification panel z-index fixed
// KEY FIXES:
//   1. Notification panel z-index raised to 51 (above everything)
//   2. Backdrop overlay z-index set to 50 (below panel, above page)
//   3. Mobile menu z-index set to 49 (below both)
//   4. Notification button can no longer be cut off — right controls use flexShrink:0

import { useState, useEffect } from 'react'
import { Bell, Menu, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import AuthModal from './AuthModal'

const NOTIFS = [
  <div style={{ padding:'20px 16px', textAlign:'center', color:'#9ca3af', fontSize:'0.84rem' }}>
  🔔 No notifications yet
</div>
]

// Returns true when screen width < breakpoint (default 768px)
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
  const { isLoggedIn, setIsLoggedIn, showToast } = useApp()
  const [notifOpen, setNotifOpen]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authModal, setAuthModal]   = useState(null)
  const isMobile = useIsMobile(768)

  const links = [
    { id:'landing', label:'Home' },
    { id:'home',    label:'Overview' },
    { id:'dashboard', label:'Dashboard' },
    { id:'report',  label:'Report Issue' },
    // { id:'map',     label:'Issue Map' },
  ]

  const navigate = (page) => {
    setCurrentPage(page)
    setMobileOpen(false)
    setNotifOpen(false)
  }

  const logout = () => {
    setIsLoggedIn(false)
    navigate('landing')
    showToast('👋', 'Signed Out', 'You have been logged out successfully.')
  }

  // ── Z-INDEX LAYERS (highest wins) ──────────────────────────────────────
  // 51  — notification panel  (must be on top of everything)
  // 50  — notification backdrop (closes panel on outside-click)
  // 49  — mobile menu dropdown
  // 48  — navbar itself (fixed bar)
  // ───────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Navbar bar ── */}
      <nav style={{
        background:'#ffffff',
        borderBottom:'1px solid #e5e7eb',
        position:'fixed',
        top:0, left:0, right:0,
        zIndex:48,          // navbar sits below panels
        height:64,
        display:'flex',
        alignItems:'center',
        boxShadow:'0 1px 3px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          display:'flex',
          alignItems:'center',
          width:'100%',
          maxWidth:1200,
          margin:'0 auto',
          padding: isMobile ? '0 14px' : '0 24px',
        }}>

          {/* ── Logo ── */}
          <div
            onClick={() => navigate('landing')}
            style={{
              display:'flex', alignItems:'center', gap:8,
              fontFamily:'Poppins,sans-serif', fontWeight:700,
              fontSize:'1.1rem', cursor:'pointer',
              marginRight:'auto', flexShrink:0,
            }}
          >
            <div style={{
              width:34, height:34, background:'#1e3a5f', borderRadius:8,
              display:'grid', placeItems:'center', fontSize:'1rem',
              color:'white', flexShrink:0,
            }}>
              🛣️
            </div>
            <span>Street<span style={{ color:'#ff6b35' }}>Fix</span></span>
          </div>

          {/* ── Desktop nav links ── */}
          {!isMobile && (
            <div style={{ display:'flex', gap:2 }}>
              {links.map(l => (
                <button
                  key={l.id}
                  className={`nav-link ${currentPage === l.id ? 'active' : ''}`}
                  onClick={() => navigate(l.id)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}

          {/* ── Right-side controls ── */}
          <div style={{
            display:'flex', alignItems:'center',
            gap:8, marginLeft:16,
            flexShrink:0,
            // IMPORTANT: do NOT set overflow:hidden here —
            // the notification panel must be able to escape this div
          }}>

            {/* ── Notification bell + panel ── */}
            {/* The panel itself is fixed to the viewport so it's never clipped */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <button
                onClick={() => setNotifOpen(prev => !prev)}
                aria-label="Notifications"
                style={{
                  width:36, height:36,
                  background:'#f9fafb',
                  border:'1px solid #e5e7eb',
                  borderRadius:8,
                  display:'grid', placeItems:'center',
                  cursor:'pointer',
                  position:'relative',
                  flexShrink:0,
                }}
              >
                <Bell size={16} color="#1f2937" />
                {/* Unread dot */}
                {/* <div style={{
                  position:'absolute', top:6, right:6,
                  width:7, height:7,
                  background:'#ef4444', borderRadius:'50%',
                  pointerEvents:'none',
                }} />
              </button>
            </div> */}

            {/* ── Auth area ── */}
            {isLoggedIn ? (
              <>
                <div style={{
                  width:36, height:36, background:'#1e3a5f',
                  borderRadius:'50%', display:'grid', placeItems:'center',
                  fontSize:'0.74rem', fontWeight:700, color:'white', flexShrink:0,
                }}>
                  RJ
                </div>
                {!isMobile && (
                  <button className="nav-link btn-sm" onClick={logout}>Logout</button>
                )}
              </>
            ) : (
              <>
                {!isMobile && (
                  <button
                    className="btn-outline btn-sm"
                    onClick={() => setAuthModal('login')}
                  >
                    Sign In
                  </button>
                )}
                <button
                  className="btn-accent btn-sm"
                  onClick={() => setAuthModal('signup')}
                >
                  {isMobile ? 'Start' : 'Get Started'}
                </button>
              </>
            )}

            {/* ── Hamburger (mobile only) ── */}
            {isMobile && (
              <button
                onClick={() => setMobileOpen(prev => !prev)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                style={{
                  background:'none', border:'none',
                  cursor:'pointer', display:'flex',
                  padding:4, flexShrink:0,
                }}
              >
                {mobileOpen
                  ? <X    size={22} color="#1f2937" />
                  : <Menu size={22} color="#1f2937" />
                }
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════
          NOTIFICATION PANEL
          Rendered outside the navbar so it's never clipped.
          zIndex: 51 — sits above the backdrop (50) and navbar (48).
      ══════════════════════════════════════════════════════════════ */}
      {notifOpen && (
        <div
          className="notif-panel"
          style={
            isMobile
              ? {
                  // Mobile: stretch across viewport with 8px margin each side
                  position:'fixed',
                  top:64,
                  left:8,
                  right:8,
                  width:'auto',
                  maxWidth:'none',
                  zIndex:51,           // ← KEY FIX: must be above backdrop
                  borderRadius:12,
                  boxShadow:'0 8px 24px rgba(0,0,0,0.14)',
                  background:'#ffffff',
                  overflow:'hidden',
                }
              : {
                  // Desktop: anchored to the right edge of the bell icon
                  position:'fixed',
                  top:64,
                  right:24,
                  width:320,
                  zIndex:51,           // ← KEY FIX
                  borderRadius:12,
                  boxShadow:'0 8px 24px rgba(0,0,0,0.14)',
                  background:'#ffffff',
                  overflow:'hidden',
                }
          }
        >
          {/* Panel header */}
          <div style={{
            padding:'13px 16px',
            borderBottom:'1px solid #f3f4f6',
            display:'flex',
            justifyContent:'space-between',
            alignItems:'center',
          }}>
            <h4 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.92rem', margin:0 }}>
              Notifications
            </h4>
            <button
              className="nav-link btn-sm"
              style={{ fontSize:'0.76rem' }}
              onClick={() => setNotifOpen(false)}
            >
              Mark all read
            </button>
          </div>

          {/* Notification items */}
          {NOTIFS.map(n => (
            <div
              key={n.id}
              style={{
                padding:'11px 16px',
                borderBottom:'1px solid #f3f4f6',
                display:'flex',
                gap:10,
                background: n.unread ? 'rgba(30,58,95,0.02)' : '#fff',
                cursor:'pointer',
              }}
            >
              <div style={{
                width:7, height:7, borderRadius:'50%',
                background:n.dot, flexShrink:0, marginTop:5,
              }} />
              <div>
                <div style={{ fontSize:'0.82rem', fontWeight:600, marginBottom:1 }}>
                  {n.title}
                </div>
                <div style={{ fontSize:'0.74rem', color:'#6b7280' }}>{n.msg}</div>
                <div style={{ fontSize:'0.7rem', color:'#9ca3af', marginTop:2 }}>
                  {n.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          NOTIFICATION BACKDROP
          zIndex: 50 — below the panel (51) so clicks outside close it,
          but the panel itself is never covered.
      ══════════════════════════════════════════════════════════════ */}
      {notifOpen && (
        <div
          onClick={() => setNotifOpen(false)}
          style={{ position:'fixed', inset:0, zIndex:50 }}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════
          MOBILE MENU DROPDOWN
          zIndex: 49 — below notification panel & backdrop.
      ══════════════════════════════════════════════════════════════ */}
      {isMobile && mobileOpen && (
        <div style={{
          position:'fixed',
          top:64, left:0, right:0,
          background:'#ffffff',
          borderBottom:'1px solid #e5e7eb',
          zIndex:49,                  // below notif panel
          padding:16,
          boxShadow:'0 4px 12px rgba(0,0,0,0.08)',
          maxHeight:'calc(100vh - 64px)',
          overflowY:'auto',
        }}>
          {links.map(l => (
            <button
              key={l.id}
              className={`nav-link ${currentPage === l.id ? 'active' : ''}`}
              style={{
                display:'block', width:'100%',
                textAlign:'left', marginBottom:4, padding:'10px 14px',
              }}
              onClick={() => navigate(l.id)}
            >
              {l.label}
            </button>
          ))}

          {isLoggedIn ? (
            <button
              className="btn-outline"
              style={{ width:'100%', justifyContent:'center', marginTop:10 }}
              onClick={() => { logout(); setMobileOpen(false) }}
            >
              Logout
            </button>
          ) : (
            <div style={{ display:'flex', gap:10, marginTop:12 }}>
              <button
                className="btn-outline"
                style={{ flex:1, justifyContent:'center' }}
                onClick={() => { setAuthModal('login'); setMobileOpen(false) }}
              >
                Sign In
              </button>
              <button
                className="btn-accent"
                style={{ flex:1, justifyContent:'center' }}
                onClick={() => { setAuthModal('signup'); setMobileOpen(false) }}
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      )}

      {/* Auth modal */}
      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSwitch={setAuthModal}
        />
      )}
    </>
  )
}
