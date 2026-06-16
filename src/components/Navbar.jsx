// Navbar.jsx — fully mobile responsive
// FIXED: removed reliance on Tailwind's "hidden md:flex" classes since they
// were being overridden by an inline style. Now uses a JS-based screen
// width check (useIsMobile hook below) so visibility is 100% reliable
// regardless of any CSS conflicts in the project.

import { useState, useEffect } from 'react'
import { Bell, Menu, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import AuthModal from './AuthModal'

const NOTIFS = [
  { id:1, dot:'#10b981', title:'Issue #1042 Resolved ✅', msg:'Pothole at MG Road has been fixed', time:'2h ago', unread:true },
  { id:2, dot:'#3b82f6', title:'Status Update 🔧', msg:'NH-48 construction is now In Progress', time:'5h ago', unread:true },
  { id:3, dot:'#ff6b35', title:'Your report submitted', msg:'Issue #1049 pending review', time:'1d ago', unread:false },
  { id:4, dot:'#9ca3af', title:'3 new issues near you', msg:'Citizens reported nearby problems', time:'2d ago', unread:false },
]

// ── Custom hook: returns true if screen width is below 768px ──
// This replaces Tailwind's "hidden md:flex" classes which were
// unreliable due to inline style conflicts. Pure JS = always works.
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint)

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
  const isMobile = useIsMobile(768) // true when screen width < 768px

  const links = [
    { id:'landing', label:'Home' },
    { id:'home', label:'Overview' },
    { id:'dashboard', label:'Dashboard' },
    { id:'report', label:'Report Issue' },
    { id:'map', label:'Issue Map' },
  ]

  const navigate = (page) => { setCurrentPage(page); setMobileOpen(false); setNotifOpen(false) }

  const logout = () => {
    setIsLoggedIn(false)
    navigate('landing')
    showToast('👋', 'Signed Out', 'You have been logged out successfully.')
  }

  return (
    <>
      <nav style={{
        background:'#ffffff', borderBottom:'1px solid #e5e7eb', position:'fixed',
        top:0, left:0, right:0, zIndex:50, height:64, display:'flex', alignItems:'center',
        boxShadow:'0 1px 3px rgba(0,0,0,0.08)'
      }}>
        <div style={{
          display:'flex', alignItems:'center', width:'100%', maxWidth:1200,
          margin:'0 auto', padding: isMobile ? '0 14px' : '0 24px', gap:0
        }}>

          {/* ── Logo ── */}
          <div
            onClick={() => navigate('landing')}
            style={{ display:'flex', alignItems:'center', gap:8, fontFamily:'Poppins,sans-serif',
                     fontWeight:700, fontSize:'1.1rem', cursor:'pointer', marginRight:'auto', flexShrink:0 }}
          >
            <div style={{ width:34, height:34, background:'#1e3a5f', borderRadius:8,
                         display:'grid', placeItems:'center', fontSize:'1rem', color:'white', flexShrink:0 }}>
              🛣️
            </div>
            {/* Hide logo text only on extremely narrow screens */}
            {window.innerWidth > 320 && (
              <span>Street<span style={{ color:'#ff6b35' }}>Fix</span></span>
            )}
          </div>

          {/* ── Desktop Nav Links — controlled by JS, NOT Tailwind classes ── */}
          {!isMobile && (
            <div style={{ display:'flex', gap:2 }}>
              {links.map(l => (
                <button key={l.id} className={`nav-link ${currentPage === l.id ? 'active' : ''}`} onClick={() => navigate(l.id)}>
                  {l.label}
                </button>
              ))}
            </div>
          )}

          {/* ── Right side controls ── */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:16, position:'relative', flexShrink:0 }}>

            {/* Notification bell */}
            <div style={{ position:'relative', display:'flex' }}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                style={{ width:36, height:36, background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:8,
                         display:'grid', placeItems:'center', cursor:'pointer', position:'relative', flexShrink:0 }}
              >
                <Bell size={16} color="#1f2937" />
                <div style={{ position:'absolute', top:6, right:6, width:7, height:7, background:'#ef4444', borderRadius:'50%' }} />
              </button>

              {notifOpen && (
                <div
                  className="notif-panel"
                  style={ isMobile ? { width:'calc(100vw - 32px)', right:-50 } : undefined }
                >
                  <div style={{ padding:'13px 16px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <h4 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.92rem' }}>Notifications</h4>
                    <button className="nav-link btn-sm" style={{ fontSize:'0.76rem' }}>Mark all read</button>
                  </div>
                  {NOTIFS.map(n => (
                    <div key={n.id} style={{ padding:'11px 16px', borderBottom:'1px solid #f3f4f6', display:'flex', gap:10,
                                            background: n.unread ? 'rgba(30,58,95,0.02)' : '#fff', cursor:'pointer' }}>
                      <div style={{ width:7, height:7, borderRadius:'50%', background:n.dot, flexShrink:0, marginTop:5 }} />
                      <div>
                        <div style={{ fontSize:'0.82rem', fontWeight:600, marginBottom:1 }}>{n.title}</div>
                        <div style={{ fontSize:'0.74rem', color:'#6b7280' }}>{n.msg}</div>
                        <div style={{ fontSize:'0.7rem', color:'#9ca3af', marginTop:2 }}>{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Auth area — controlled by JS, NOT Tailwind classes */}
            {isLoggedIn ? (
              <>
                <div style={{ width:36, height:36, background:'#1e3a5f', borderRadius:'50%', display:'grid',
                             placeItems:'center', fontSize:'0.74rem', fontWeight:700, color:'white', flexShrink:0 }}>
                  RJ
                </div>
                {!isMobile && (
                  <button className="nav-link btn-sm" onClick={logout}>Logout</button>
                )}
              </>
            ) : (
              <>
                {!isMobile && (
                  <button className="btn-outline btn-sm" onClick={() => setAuthModal('login')}>Sign In</button>
                )}
                <button className="btn-accent btn-sm" onClick={() => setAuthModal('signup')}>
                  {isMobile ? 'Start' : 'Get Started'}
                </button>
              </>
            )}

            {/* Hamburger — only renders when isMobile is true (JS-controlled) */}
            {isMobile && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{ background:'none', border:'none', cursor:'pointer', display:'flex', padding:4, flexShrink:0 }}
              >
                {mobileOpen ? <X size={22} color="#1f2937" /> : <Menu size={22} color="#1f2937" />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Mobile dropdown menu — only renders when isMobile AND mobileOpen are true ── */}
      {isMobile && mobileOpen && (
        <div style={{
          position:'fixed', top:64, left:0, right:0, background:'#ffffff',
          borderBottom:'1px solid #e5e7eb', zIndex:49, padding:16,
          boxShadow:'0 4px 12px rgba(0,0,0,0.08)',
          maxHeight:'calc(100vh - 64px)', overflowY:'auto'
        }}>
          {links.map(l => (
            <button
              key={l.id}
              className={`nav-link ${currentPage === l.id ? 'active' : ''}`}
              style={{ display:'block', width:'100%', textAlign:'left', marginBottom:4, padding:'10px 14px' }}
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
              <button className="btn-outline" style={{ flex:1, justifyContent:'center' }}
                onClick={() => { setAuthModal('login'); setMobileOpen(false) }}>
                Sign In
              </button>
              <button className="btn-accent" style={{ flex:1, justifyContent:'center' }}
                onClick={() => { setAuthModal('signup'); setMobileOpen(false) }}>
                Get Started
              </button>
            </div>
          )}
        </div>
      )}

      {notifOpen && <div style={{ position:'fixed', inset:0, zIndex:49 }} onClick={() => setNotifOpen(false)} />}

      {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onSwitch={setAuthModal} />}
    </>
  )
}
