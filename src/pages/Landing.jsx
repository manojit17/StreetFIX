import { MapPin, Bell, BarChart2, Shield, Camera, Users } from 'lucide-react'

const FEATURES = [
  { icon:'📍', title:'Real Map Integration', desc:'See every reported issue on an interactive map. Filter by status, type, or location to understand your city road health at a glance.' },
  { icon:'🔔', title:'Live Notifications', desc:'Get real-time updates when your report changes status. Never wonder if someone is acting on your complaint again.' },
  { icon:'📊', title:'Progress Tracking', desc:'Monitor every issue from report to resolution. Full timeline, government responses, and community upvotes all in one place.' },
  { icon:'🏛️', title:'Government Direct', desc:'Reports go directly to the relevant municipal authority. No middlemen, no delays — straight to the people who can fix it.' },
  { icon:'📸', title:'Photo Evidence', desc:'Attach photos and GPS coordinates to every report. Visual proof accelerates government response times significantly.' },
  { icon:'🌐', title:'Community Driven', desc:'Upvote issues your neighbours report. The more votes, the higher the priority. Collective voice drives faster action.' },
]

const STEPS = [
  { n:'01', title:'Spot the Issue', desc:'See a pothole or road hazard on your daily commute.' },
  { n:'02', title:'File a Report', desc:'Snap a photo, drop a pin, describe the issue. Under 60 seconds.' },
  { n:'03', title:'Notify Authorities', desc:'Report forwarded automatically to the relevant government body.' },
  { n:'04', title:'Road Gets Fixed', desc:'Track progress and get notified when the road is repaired.' },
]

export default function Landing({ navigate }) {
  return (
    <div>
      {/* ── HERO ── */}
      <section className="hero-gradient" style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', paddingTop:64 }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'60px 24px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center' }}>
          <div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:20, padding:'4px 14px', fontSize:'0.74rem', fontWeight:600, color:'#ffffff', marginBottom:20 }}>
              <span className="badge-live badge" style={{ background:'transparent', color:'white', padding:0 }}><span className="badge-dot" style={{ background:'#10b981', animation:'livePulse 1.5s ease-in-out infinite' }} /></span>
              Live · 2,400+ Issues Tracked
            </div>
            <h1 style={{ fontSize:'clamp(2.2rem,5vw,3.5rem)', lineHeight:1.1, color:'#ffffff', marginBottom:16 }}>
              Fix <em style={{ color:'#ff6b35', fontStyle:'normal' }}>Our Roads.</em><br />Together.
            </h1>
            <p style={{ fontSize:'1rem', color:'rgba(255,255,255,0.8)', marginBottom:28, lineHeight:1.7, maxWidth:440 }}>
              Report potholes, construction zones, and road hazards in seconds. Track progress in real-time and hold authorities accountable until fixed.
            </p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:40 }}>
              <button className="btn-accent" onClick={() => navigate('report')}>📝 Report an Issue</button>
              <button className="btn-outline-white" onClick={() => navigate('map')}>🗺️ View Issue Map</button>
            </div>
            <div style={{ display:'flex', gap:32 }}>
              {[['2.4K','Issues Reported'],['1.1K','Roads Fixed'],['48h','Avg Response']].map(([n,l]) => (
                <div key={l}>
                  <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'1.8rem', color:'#ffffff' }}>{n}</div>
                  <div style={{ fontSize:'0.76rem', color:'rgba(255,255,255,0.65)', fontWeight:500 }}>{l}</div>
                </div>
              ))}
            </div>
            {/* Road dashes */}
            <div style={{ display:'flex', gap:6, marginTop:24, paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.15)' }}>
              {[...Array(8)].map((_,i) => (
                <div key={i} style={{ height:3, borderRadius:2, background:'rgba(255,255,255,0.4)', flex:1, opacity: i%2===0 ? 0.7 : 0.3 }} />
              ))}
            </div>
          </div>

          {/* Floating cards */}
          <div style={{ position:'relative', height:360 }}>
            {[
              { title:'Pothole — MG Road', loc:'📍 Bangalore, KA', status:'Pending', pct:30, color:'#f59e0b', cls:'badge-pending', ico:'🕳️', meta:'2 hours ago · High' },
              { title:'Road Construction', loc:'📍 NH-48, Delhi', status:'In Progress', pct:62, color:'#3b82f6', cls:'badge-progress', ico:'🚧', meta:'3 days ago · Medium' },
              { title:'Street Light Fixed', loc:'📍 Andheri, Mumbai', status:'Resolved', pct:100, color:'#10b981', cls:'badge-resolved', ico:'💡', meta:'Fixed in 26 hours ❤️' },
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
      </section>

      {/* ── FEATURES ── */}
      <section style={{ background:'#f9fafb', borderTop:'1px solid #e5e7eb', borderBottom:'1px solid #e5e7eb', padding:'72px 0' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div className="section-label" style={{ marginBottom:8 }}>Why StreetFix</div>
            <h2 style={{ fontSize:'2rem' }}>Built for Citizens,<br />Trusted by Government</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {FEATURES.map(f => (
              <div key={f.title} className="card" style={{ padding:28 }}>
                <div style={{ width:48, height:48, background:'rgba(30,58,95,0.08)', border:'1px solid rgba(30,58,95,0.15)', borderRadius:10, display:'grid', placeItems:'center', fontSize:'1.3rem', marginBottom:16 }}>{f.icon}</div>
                <h3 style={{ fontSize:'1rem', marginBottom:8 }}>{f.title}</h3>
                <p style={{ fontSize:'0.86rem', color:'#6b7280', lineHeight:1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding:'72px 0' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <div className="section-label" style={{ marginBottom:8 }}>How It Works</div>
            <h2 style={{ fontSize:'2rem' }}>Four Steps to Safer Roads</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20, position:'relative' }}>
            <div style={{ position:'absolute', top:26, left:'12%', right:'12%', height:1, background:'#e5e7eb', zIndex:0 }} />
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

      {/* ── CTA ── */}
      <section style={{ padding:'0 0 72px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px' }}>
          <div className="cta-box">
            <h2 style={{ fontSize:'2.2rem', color:'#ffffff', marginBottom:14 }}>Your City. <em style={{ color:'#ff6b35', fontStyle:'normal' }}>Your Voice.</em></h2>
            <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'0.95rem', marginBottom:28 }}>Join 12,000+ citizens making their roads safer. It's free, fast, and it works.</p>
            <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
              <button className="btn-accent" onClick={() => navigate('report')}>Create Free Account</button>
              <button className="btn-outline-white" onClick={() => navigate('map')}>Explore Issue Map</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer-bg" style={{ padding:'36px 0', textAlign:'center' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px' }}>
          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'1.1rem', color:'white', marginBottom:6 }}>
            Street<span style={{ color:'#ff6b35' }}>Fix</span>
          </div>
          <p style={{ fontSize:'0.8rem', color:'#9ca3af' }}>Making Indian roads safer, one report at a time. © 2025 StreetFix</p>
        </div>
      </footer>
    </div>
  )
}
