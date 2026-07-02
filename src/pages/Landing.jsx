// Landing.jsx — floating cards + stats show logged-in user's OWN reports
import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import SupportButton from '../components/SupportButton'

const FEATURES = [
  { icon:'📍', title:'Real Map Integration', desc:'See every reported issue on an interactive map. Filter by status, type, or location to understand your city road health at a glance.' },
  { icon:'🔔', title:'Live Notifications', desc:'Get real-time updates when your report changes status. Never wonder if someone is acting on your complaint again.' },
  { icon:'📊', title:'Progress Tracking', desc:'Monitor every issue from report to resolution. Full timeline, government responses, and community upvotes all in one place.' },
  { icon:'🏛️', title:'Government Direct', desc:'Reports go directly to the relevant municipal authority. No middlemen, no delays — straight to the people who can fix it.' },
  { icon:'📸', title:'Photo Evidence', desc:'Attach photos and GPS coordinates to every report. Visual proof accelerates government response times significantly.' },
  { icon:'🌐', title:'Community Driven', desc:'Upvote issues your neighbours report. The more votes, the higher the priority. Collective voice drives faster action.' },
]

const STEPS = [
  { n:'01', title:'Spot the Issue',     desc:'See a pothole or road hazard on your daily commute.' },
  { n:'02', title:'File a Report',      desc:'Snap a photo, drop a pin, describe the issue. Under 60 seconds.' },
  { n:'03', title:'Notify Authorities', desc:'Report forwarded automatically to the relevant government body.' },
  { n:'04', title:'Road Gets Fixed',    desc:'Track progress and get notified when the road is repaired.' },
]

const statusColor = (s) => s === 'Resolved' ? '#10b981' : s === 'In Progress' ? '#3b82f6' : '#f59e0b'
const statusPct   = (s) => s === 'Resolved' ? 100 : s === 'In Progress' ? 60 : 20
const statusCls   = (s) => s === 'Resolved' ? 'badge-resolved' : s === 'In Progress' ? 'badge-progress' : 'badge-pending'

export default function Landing({ navigate }) {
  const { saveAuth, showToast, isLoggedIn } = useApp()

  const [showModal, setShowModal] = useState(false)
  const [tab,       setTab]       = useState('login')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'' })

  // ── My reports (if logged in) for floating cards ────────────
  const [myReports,     setMyReports]     = useState([])
  const [myLoading,     setMyLoading]     = useState(false)

  // ── All reports (always) for the city-wide stats badge ──────
  const [allTotal,      setAllTotal]      = useState(0)
  const [statsLoading,  setStatsLoading]  = useState(true)

  // Fetch city-wide total (public, always runs)
  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const res  = await fetch(`${import.meta.env.VITE_API_URL}/reports`)
        const data = await res.json()
        if (data.success) setAllTotal((data.data || []).length)
      } catch {}
      finally { setStatsLoading(false) }
    }
    fetchTotal()
  }, [])

  // Fetch MY reports only when logged in
  useEffect(() => {
    if (!isLoggedIn) { setMyReports([]); return }
    const fetchMine = async () => {
      setMyLoading(true)
      try {
        const token = localStorage.getItem('sf-token')
        const res   = await fetch(`${import.meta.env.VITE_API_URL}/reports/my`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.success) setMyReports(data.data || [])
      } catch {}
      finally { setMyLoading(false) }
    }
    fetchMine()
  }, [isLoggedIn])

  // My 3 most recent reports for the floating cards
  const myRecentThree = [...myReports]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)

  const myResolved = myReports.filter(r => r.status === 'Resolved').length

  const setField = (key, val) => { setForm(f => ({ ...f, [key]: val })); setError('') }
  const openModal = (t = 'login') => {
    setTab(t); setError('')
    setForm({ name:'', email:'', password:'', confirmPassword:'' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (tab === 'login') {
      if (!form.email || !form.password) { setError('Please enter email and password.'); return }
    } else {
      if (!form.name || !form.email || !form.password) { setError('Please fill all fields.'); return }
      if (form.password !== form.confirmPassword)       { setError('Passwords do not match.'); return }
      if (form.password.length < 6)                    { setError('Password must be at least 6 characters.'); return }
    }
    setLoading(true); setError('')
    try {
      const endpoint = tab === 'login' ? 'auth/login' : 'auth/register'
      const body     = tab === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password }
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Something went wrong')
      saveAuth(data.token, data.user)
      setShowModal(false)
      showToast(tab === 'login' ? '👋' : '🎉',
                tab === 'login' ? 'Welcome back!' : 'Account created!',
                `Hello, ${data.user.name}!`)
      navigate('home')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div>
      {/* ══ HERO ══ */}
      <section className="hero-gradient" style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', paddingTop:40 }}>
        <div className="page-container" style={{ width:'100%', paddingTop:24, paddingBottom:48 }}>
          <div className="hero-grid">

            {/* LEFT */}
            <div>
              {/* Live badge — shows city-wide total */}
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:20, padding:'4px 14px', fontSize:'0.74rem', fontWeight:600, color:'#ffffff', marginBottom:20 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#10b981', display:'inline-block', animation:'livePulse 1.5s ease-in-out infinite' }} />
                {statsLoading ? 'Live · Loading...' : `Live · ${allTotal} Issue${allTotal !== 1 ? 's' : ''} Tracked`}
              </div>

              <h1 className="hero-heading" style={{ fontSize:'clamp(2rem,5vw,3.5rem)', lineHeight:1.1, color:'#ffffff', marginBottom:16 }}>
                Fix <em style={{ color:'#ff6b35', fontStyle:'normal' }}>Our Roads.</em><br />Together.
              </h1>

              <p style={{ fontSize:'1rem', color:'rgba(255,255,255,0.8)', marginBottom:28, lineHeight:1.7, maxWidth:440 }}>
                Report potholes, construction zones, and road hazards in seconds. Track progress in real-time and hold authorities accountable until fixed.
              </p>

              <div className="hero-btns" style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:36 }}>
                <button className="btn-accent" onClick={() => navigate('report')}>📝 Report an Issue</button>
                {!isLoggedIn && (
                  <button className="btn-outline-white" onClick={() => openModal('login')}>🔑 Sign In</button>
                )}
              </div>

              {/* Stats — show MY report counts if logged in, else city total */}
              {isLoggedIn && !myLoading && myReports.length > 0 && (
                <div className="hero-stats" style={{ display:'flex', gap:28, flexWrap:'wrap' }}>
                  <div>
                    <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'1.8rem', color:'#ffffff' }}>{myReports.length}</div>
                    <div style={{ fontSize:'0.76rem', color:'rgba(255,255,255,0.65)', fontWeight:500 }}>My Reports</div>
                  </div>
                  <div>
                    <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'1.8rem', color:'#ffffff' }}>{myResolved}</div>
                    <div style={{ fontSize:'0.76rem', color:'rgba(255,255,255,0.65)', fontWeight:500 }}>My Roads Fixed</div>
                  </div>
                </div>
              )}

              {/* Not logged in — show city total as motivation */}
              {!isLoggedIn && !statsLoading && allTotal > 0 && (
                <div className="hero-stats" style={{ display:'flex', gap:28, flexWrap:'wrap' }}>
                  <div>
                    <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'1.8rem', color:'#ffffff' }}>{allTotal}</div>
                    <div style={{ fontSize:'0.76rem', color:'rgba(255,255,255,0.65)', fontWeight:500 }}>Issues Reported</div>
                  </div>
                </div>
              )}

              <div style={{ display:'flex', gap:6, marginTop:24, paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.15)' }}>
                {[...Array(8)].map((_,i) => (
                  <div key={i} style={{ height:3, borderRadius:2, background:'rgba(255,255,255,0.4)', flex:1, opacity:i%2===0?0.7:0.3 }} />
                ))}
              </div>
            </div>

            {/* RIGHT — floating cards */}
            <div className="hero-cards-col" style={{ position:'relative', height:360 }}>
              {/* Logged in + has reports → show their own reports */}
              {isLoggedIn && !myLoading && myRecentThree.length > 0 && (
                myRecentThree.map((r, i) => (
                  <div key={r._id} className="float-card">
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                      <div>
                        <div style={{ fontSize:'0.86rem', fontWeight:600, color:'#ffffff', marginBottom:2 }}>{r.title}</div>
                        <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.65)' }}>Severity: {r.severity}</div>
                      </div>
                      <span className={`badge ${statusCls(r.status)}`}><span className="badge-dot" />{r.status}</span>
                    </div>
                    <div style={{ fontSize:'0.74rem', color:'rgba(255,255,255,0.6)', marginBottom:8 }}>{r.description?.slice(0, 60)}{r.description?.length > 60 ? '...' : ''}</div>
                    <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:3, height:4, overflow:'hidden' }}>
                      <div style={{ width:`${statusPct(r.status)}%`, height:'100%', background:statusColor(r.status), borderRadius:3 }} />
                    </div>
                  </div>
                ))
              )}

              {/* Logged in but no reports yet */}
              {isLoggedIn && !myLoading && myRecentThree.length === 0 && (
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
                  <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.85rem', textAlign:'center' }}>
                    You haven't reported any issues yet
                  </p>
                  <button className="btn-outline-white" onClick={() => navigate('report')}>
                    + Report Your First Issue
                  </button>
                </div>
              )}

              {/* Not logged in — prompt to sign in */}
              {!isLoggedIn && (
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12 }}>
                  <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'0.85rem', textAlign:'center', maxWidth:220 }}>
                    Sign in to see your personal report progress here
                  </p>
                  <button className="btn-outline-white" onClick={() => openModal('login')}>
                    🔑 Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section className="section-pad" style={{ background:'#f9fafb', borderTop:'1px solid #e5e7eb', borderBottom:'1px solid #e5e7eb' }}>
        <div className="page-container">
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <div className="section-label" style={{ marginBottom:8 }}>Why RoadWatch</div>
            <h2>Built for Citizens,<br />Trusted by Citizens</h2>
          </div>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="card" style={{ padding:24 }}>
                <div style={{ width:46, height:46, background:'rgba(30,58,95,0.08)', border:'1px solid rgba(30,58,95,0.15)', borderRadius:10, display:'grid', placeItems:'center', fontSize:'1.3rem', marginBottom:14 }}>{f.icon}</div>
                <h3 style={{ fontSize:'1rem', marginBottom:8 }}>{f.title}</h3>
                <p style={{ fontSize:'0.86rem', color:'#6b7280', lineHeight:1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="section-pad">
        <div className="page-container">
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <div className="section-label" style={{ marginBottom:8 }}>How It Works</div>
            <h2>Four Steps to Safer Roads</h2>
          </div>
          <div className="steps-grid">
            <div className="steps-connector" style={{ position:'absolute', top:26, left:'12%', right:'12%', height:1, background:'#e5e7eb', zIndex:0 }} />
            {STEPS.map(s => (
              <div key={s.n} style={{ textAlign:'center', position:'relative', zIndex:1 }}>
                <div className="step-circle">{s.n}</div>
                <h4 style={{ fontSize:'0.95rem', marginBottom:6 }}>{s.title}</h4>
                <p style={{ fontSize:'0.82rem', color:'#6b7280' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding:'0 0 60px' }}>
        <div className="page-container">
          <div className="cta-box">
            <h2 style={{ fontSize:'2.2rem', color:'#ffffff', marginBottom:14 }}>
              Your City. <em style={{ color:'#ff6b35', fontStyle:'normal' }}>Your Voice.</em>
            </h2>
            <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'0.95rem', marginBottom:28 }}>
              Join thousands of citizens making their roads safer. It is free, fast, and it works.
            </p>
            <div className="cta-btns" style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <button className="btn-accent" onClick={() => navigate('report')}>📝 Report an Issue</button>
              {!isLoggedIn && (
                <button className="btn-outline-white" onClick={() => openModal('login')}>🔑 Sign In</button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="footer-bg" style={{ padding:'32px 0', textAlign:'center' }}>
        <div className="page-container">
          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'1.1rem', color:'white', marginBottom:6 }}>
            Road<span style={{ color:'#ff6b35' }}>Watch</span>
          </div>
          <p style={{ fontSize:'0.8rem', color:'#9ca3af' }}>Making Indian roads safer, one report at a time. © 2026 RoadWatch</p>
        </div>
      </footer>

      {/* ══ AUTH MODAL ══ */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign:'center', marginBottom:18 }}>
              <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'1.3rem', color:'#1e3a5f' }}>
                Street<span style={{ color:'#ff6b35' }}>Fix</span>
              </div>
              <p style={{ fontSize:'0.84rem', color:'#6b7280', marginTop:4 }}>
                {tab === 'login' ? 'Sign in to your account' : 'Create a new account'}
              </p>
            </div>
            <div style={{ display:'flex', background:'#f3f4f6', borderRadius:10, padding:4, marginBottom:18 }}>
              {['login','register'].map(t => (
                <button key={t} onClick={() => { setTab(t); setError('') }}
                  style={{ flex:1, padding:'8px 0', border:'none', cursor:'pointer', borderRadius:8,
                           fontSize:'0.875rem', fontWeight:600, transition:'all 0.2s',
                           background: tab===t ? '#ffffff' : 'transparent',
                           color:      tab===t ? '#1e3a5f'  : '#6b7280',
                           boxShadow:  tab===t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
                  {t === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>
            {error && (
              <div style={{ background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626',
                            borderRadius:8, padding:'10px 14px', fontSize:'0.84rem', marginBottom:14 }}>
                ⚠️ {error}
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {tab === 'register' && (
                <input type="text" className="form-input" placeholder="Full Name" value={form.name} onChange={e => setField('name', e.target.value)} />
              )}
              <input type="email"    className="form-input" placeholder="Email Address"    value={form.email}           onChange={e => setField('email', e.target.value)} />
              <input type="password" className="form-input" placeholder="Password"         value={form.password}        onChange={e => setField('password', e.target.value)} />
              {tab === 'register' && (
                <input type="password" className="form-input" placeholder="Confirm Password" value={form.confirmPassword} onChange={e => setField('confirmPassword', e.target.value)} />
              )}
              <button type="submit" disabled={loading}
                style={{ padding:'12px', borderRadius:10, border:'none', cursor:'pointer', marginTop:4,
                         background: loading ? '#9ca3af' : '#ff6b35', color:'#ffffff', fontWeight:700, fontSize:'0.95rem' }}>
                {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
            <p style={{ textAlign:'center', fontSize:'0.82rem', color:'#6b7280', marginTop:14 }}>
              {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => { setTab(tab==='login'?'register':'login'); setError('') }}
                style={{ background:'none', border:'none', color:'#1e3a5f', fontWeight:600, cursor:'pointer', fontSize:'0.82rem' }}>
                {tab === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}