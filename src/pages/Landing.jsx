// Landing.jsx — fully mobile responsive
import { useState } from 'react'
import { useApp } from '../context/AppContext'

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

export default function Landing({ navigate }) {
  const [showModal, setShowModal] = useState(false)
  const [tab,       setTab]       = useState('login')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'' })
  const { login, showToast } = useApp()

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
      const endpoint = tab === 'login'  ? 'api/auth/login' : 'api/auth/register'
      const body     = tab === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password }
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Something went wrong')
      login(data.user, data.token)
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
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:20, padding:'4px 14px', fontSize:'0.74rem', fontWeight:600, color:'#ffffff', marginBottom:20 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'#10b981', display:'inline-block', animation:'livePulse 1.5s ease-in-out infinite' }} />
                Live · 2,400+ Issues Tracked
              </div>
              <h1 className="hero-heading" style={{ fontSize:'clamp(2rem,5vw,3.5rem)', lineHeight:1.1, color:'#ffffff', marginBottom:16 }}>
                Fix <em style={{ color:'#ff6b35', fontStyle:'normal' }}>Our Roads.</em><br />Together.
              </h1>
              <p style={{ fontSize:'1rem', color:'rgba(255,255,255,0.8)', marginBottom:28, lineHeight:1.7, maxWidth:440 }}>
                Report potholes, construction zones, and road hazards in seconds. Track progress in real-time and hold authorities accountable until fixed.
              </p>
              <div className="hero-btns" style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:36 }}>
                <button className="btn-accent"        onClick={() => navigate('report')}>📝 Report an Issue</button>
                <button className="btn-outline-white" onClick={() => openModal('register')}>🚀 Create Free Account</button>
              </div>
              <div className="hero-stats" style={{ display:'flex', gap:28, flexWrap:'wrap' }}>
                {[['2.4K','Issues Reported'],['1.1K','Roads Fixed'],['48h','Avg Response']].map(([n,l]) => (
                  <div key={l}>
                    <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'1.8rem', color:'#ffffff' }}>{n}</div>
                    <div style={{ fontSize:'0.76rem', color:'rgba(255,255,255,0.65)', fontWeight:500 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:6, marginTop:24, paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.15)' }}>
                {[...Array(8)].map((_,i) => (
                  <div key={i} style={{ height:3, borderRadius:2, background:'rgba(255,255,255,0.4)', flex:1, opacity:i%2===0?0.7:0.3 }} />
                ))}
              </div>
            </div>

            {/* RIGHT — hidden on mobile */}
            <div className="hero-cards-col" style={{ position:'relative', height:360 }}>
              {[
                { title:'Pothole — MG Road',  loc:'📍 Bangalore, KA',  status:'Pending',     pct:30,  color:'#f59e0b', cls:'badge-pending',  ico:'🕳️', meta:'2 hours ago · High' },
                { title:'Road Construction',  loc:'📍 NH-48, Delhi',   status:'In Progress', pct:62,  color:'#3b82f6', cls:'badge-progress', ico:'🚧', meta:'3 days ago · Medium' },
                { title:'Street Light Fixed', loc:'📍 Andheri, Mumbai',status:'Resolved',    pct:100, color:'#10b981', cls:'badge-resolved', ico:'💡', meta:'Fixed in 26 hours ❤️' },
              ].map((c,i) => (
                <div key={i} className="float-card">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <div>
                      <div style={{ fontSize:'0.86rem', fontWeight:600, color:'#ffffff', marginBottom:2 }}>{c.ico} {c.title}</div>
                      <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.65)' }}>{c.loc}</div>
                    </div>
                    <span className={`badge ${c.cls}`}><span className="badge-dot" />{c.status}</span>
                  </div>
                  <div style={{ fontSize:'0.74rem', color:'rgba(255,255,255,0.6)', marginBottom:8 }}>{c.meta}</div>
                  <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:3, height:4, overflow:'hidden' }}>
                    <div style={{ width:`${c.pct}%`, height:'100%', background:c.color, borderRadius:3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section className="section-pad" style={{ background:'#f9fafb', borderTop:'1px solid #e5e7eb', borderBottom:'1px solid #e5e7eb' }}>
        <div className="page-container">
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <div className="section-label" style={{ marginBottom:8 }}>Why StreetFix</div>
            <h2>Built for Citizens,<br />Trusted by Government</h2>
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
              Join 12,000+ citizens making their roads safer. It is free, fast, and it works.
            </p>
            <div className="cta-btns" style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <button className="btn-accent"        onClick={() => openModal('register')}>Create Free Account</button>
              <button className="btn-outline-white" onClick={() => navigate('map')}>Explore Issue Map</button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="footer-bg" style={{ padding:'32px 0', textAlign:'center' }}>
        <div className="page-container">
          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'1.1rem', color:'white', marginBottom:6 }}>
            Street<span style={{ color:'#ff6b35' }}>Fix</span>
          </div>
          <p style={{ fontSize:'0.8rem', color:'#9ca3af' }}>Making Indian roads safer, one report at a time. © 2025 StreetFix</p>
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
                <input type="text"     className="form-input" placeholder="Full Name"        value={form.name}            onChange={e => setField('name', e.target.value)} />
              )}
              <input   type="email"    className="form-input" placeholder="Email Address"    value={form.email}           onChange={e => setField('email', e.target.value)} />
              <input   type="password" className="form-input" placeholder="Password"         value={form.password}        onChange={e => setField('password', e.target.value)} />
              {tab === 'register' && (
                <input type="password" className="form-input" placeholder="Confirm Password" value={form.confirmPassword} onChange={e => setField('confirmPassword', e.target.value)} />
              )}
              <button type="submit" disabled={loading}
                style={{ padding:'12px', borderRadius:10, border:'none', cursor:'pointer', marginTop:4,
                         background: loading ? '#9ca3af' : '#ff6b35',
                         color:'#ffffff', fontWeight:700, fontSize:'0.95rem' }}>
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
