import Badge from '../components/Badge'

const RECENT = [
  { icon:'🕳️', iconBg:'rgba(239,68,68,0.1)', title:'Deep Pothole', loc:'MG Road, Bangalore · 0.4 km away', status:'Pending', pct:25, barColor:'#f59e0b', time:'2h ago' },
  { icon:'🚧', iconBg:'rgba(59,130,246,0.1)', title:'Construction Barrier', loc:'NH-48, Delhi · 1.2 km away', status:'In Progress', pct:60, barColor:'#3b82f6', time:'5h ago' },
  { icon:'💡', iconBg:'rgba(16,185,129,0.1)', title:'Street Light Repaired', loc:'Andheri West, Mumbai', status:'Resolved', pct:100, barColor:'#10b981', time:'1d ago' },
  { icon:'💧', iconBg:'rgba(245,158,11,0.1)', title:'Waterlogging Issue', loc:'Linking Road, Mumbai · 2.1 km', status:'In Progress', pct:45, barColor:'#3b82f6', time:'2d ago' },
]

export default function Home({ navigate }) {
  return (
    <div>
      {/* Hero bar */}
      <div style={{ background:'linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)', borderBottom:'1px solid #e5e7eb', padding:'36px 0 28px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
          <div>
            <span className="badge badge-live" style={{ marginBottom:8, display:'inline-flex' }}><span className="badge-dot" />Live Updates</span>
            <h1 style={{ fontSize:'1.9rem', color:'#ffffff', marginBottom:4 }}>Your City Dashboard</h1>
            <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.9rem' }}>Monitor road conditions and active reports in real time.</p>
          </div>
          <button className="btn-accent" onClick={() => navigate('report')}>+ Report New Issue</button>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'28px 24px 48px' }}>
        {/* Quick Actions */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:28 }}>
          {[
            { icon:'📝', iconBg:'rgba(30,58,95,0.08)', label:'Report Issue', page:'report' },
            { icon:'🗺️', iconBg:'rgba(59,130,246,0.08)', label:'Issue Map', page:'map' },
            { icon:'📊', iconBg:'rgba(16,185,129,0.08)', label:'My Reports', page:'dashboard' },
            { icon:'🔔', iconBg:'rgba(245,158,11,0.08)', label:'Notifications', page:'dashboard' },
          ].map(q => (
            <div key={q.label} className="quick-action" onClick={() => navigate(q.page)}>
              <div style={{ width:48, height:48, background:q.iconBg, borderRadius:10, display:'grid', placeItems:'center', fontSize:'1.3rem' }}>{q.icon}</div>
              <span style={{ fontSize:'0.86rem', fontWeight:600 }}>{q.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'start' }}>
          {/* Recent Reports */}
          <div>
            <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:'1rem', marginBottom:12 }}>Recent Reports Near You</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {RECENT.map(r => (
                <div key={r.title} className="report-row">
                  <div style={{ width:44, height:44, background:r.iconBg, borderRadius:10, display:'grid', placeItems:'center', fontSize:'1.15rem', flexShrink:0 }}>{r.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'0.9rem', fontWeight:600, marginBottom:2 }}>{r.title}</div>
                    <div style={{ fontSize:'0.78rem', color:'#6b7280' }}>{r.loc}</div>
                    <div className="progress-wrap" style={{ marginTop:6 }}>
                      <div className="progress-bar" style={{ width:`${r.pct}%`, background:r.barColor }} />
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <Badge status={r.status} />
                    <div style={{ fontSize:'0.72rem', color:'#9ca3af', marginTop:5 }}>{r.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* City stats */}
            <div className="card-static" style={{ padding:20 }}>
              <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.95rem', marginBottom:14 }}>City-Wide Status</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[['142','#f59e0b','Pending'],['89','#3b82f6','In Progress'],['1,124','#10b981','Resolved'],['2,441','#1e3a5f','Total']].map(([n,c,l]) => (
                  <div key={l} style={{ background:'#f9fafb', borderRadius:8, padding:14, textAlign:'center' }}>
                    <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'1.5rem', color:c }}>{n}</div>
                    <div style={{ fontSize:'0.72rem', color:'#6b7280', marginTop:2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Trending */}
            <div className="card-static" style={{ padding:20 }}>
              <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.95rem', marginBottom:12 }}>🔥 Trending Issues</h3>
              {[['Potholes','↑ 34%','#ff6b35'],['Waterlogging','↑ 67%','#ef4444'],['Street Lights','↓ 12%','#10b981'],['Construction Zones','→ 0%','#9ca3af']].map(([l,v,c]) => (
                <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:9 }}>
                  <span style={{ fontSize:'0.85rem' }}>{l}</span>
                  <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, color:c, fontSize:'0.85rem' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
