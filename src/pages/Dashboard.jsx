import { useState } from 'react'
import Badge from '../components/Badge'

const ACTIVITY = [
  { dot:'#10b981', title:'Pothole on MG Road — Fixed!', desc:'PWD marked your report as resolved', time:'2h ago' },
  { dot:'#3b82f6', title:'NH-48 Construction Zone', desc:'Status changed to In Progress', time:'5h ago' },
  { dot:'#ff6b35', title:'New report submitted', desc:'Broken street light at Andheri West', time:'1d ago' },
  { dot:'#f59e0b', title:'Upvotes on your report', desc:'12 citizens upvoted Waterlogged Road', time:'2d ago' },
  { dot:'#10b981', title:'Road resurfacing complete', desc:'Link Road, Versova — fully resolved', time:'3d ago' },
]

const REPORTS = [
  { type:'🕳️ Pothole', sev:'High', loc:'MG Road', city:'Bangalore, KA', status:'Resolved', date:'Jun 01, 2025' },
  { type:'🚧 Construction', sev:'Medium', loc:'NH-48', city:'Delhi, DL', status:'In Progress', date:'May 29, 2025' },
  { type:'💡 Street Light', sev:'Medium', loc:'Andheri West', city:'Mumbai, MH', status:'Pending', date:'May 27, 2025' },
  { type:'💧 Waterlogging', sev:'High', loc:'Linking Road', city:'Mumbai, MH', status:'In Progress', date:'May 25, 2025' },
  { type:'🛣️ Bad Surface', sev:'Low', loc:'Versova', city:'Mumbai, MH', status:'Resolved', date:'May 20, 2025' },
]

const NOTIFS = [
  { dot:'#10b981', title:'✅ Issue #1042 Resolved — Pothole at MG Road', desc:'PWD has completed repairs. Your report made this happen!', time:'2h ago', unread:true },
  { dot:'#3b82f6', title:'🔧 Status Update — Road construction at NH-48', desc:'NHAI has assigned a team to address your report.', time:'5h ago', unread:true },
  { dot:'#ff6b35', title:'👍 Your report got 12 upvotes', desc:'Waterlogged road on Linking Road is trending in your area.', time:'1d ago', unread:false },
  { dot:'#9ca3af', title:'🏙️ 3 new issues near you', desc:'Citizens reported issues within 2km of your location.', time:'2d ago', unread:false },
  { dot:'#10b981', title:'✅ Issue #1035 Resolved — Link Road, Versova', desc:'Road resurfacing completed. Thank you for reporting!', time:'3d ago', unread:false },
]

export default function Dashboard({ navigate, initialTab = 'overview' }) {
  const [tab, setTab] = useState(initialTab)

  return (
    <div>
      {/* Header */}
      <div style={{ background:'#f9fafb', borderBottom:'1px solid #e5e7eb', padding:'22px 0' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h2 style={{ fontSize:'1.5rem' }}>Welcome back, Rahul 👋</h2>
            <p style={{ fontSize:'0.86rem', color:'#6b7280', marginTop:2 }}>Here's what's happening with your reports today.</p>
          </div>
          <button className="btn-accent" onClick={() => navigate('report')}>+ New Report</button>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px 48px' }}>
        {/* Stat cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, margin:'24px 0' }}>
          {[
            { icon:'📝', iconBg:'rgba(30,58,95,0.08)', val:'14', label:'Total Reports', change:'+3 this week', up:true },
            { icon:'✅', iconBg:'rgba(16,185,129,0.08)', val:'8', label:'Resolved', change:'+2 this month', up:true },
            { icon:'🔧', iconBg:'rgba(59,130,246,0.08)', val:'4', label:'In Progress', change:'Active now', up:true },
            { icon:'⏳', iconBg:'rgba(245,158,11,0.08)', val:'2', label:'Pending', change:'Needs attention', up:false },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div style={{ width:40, height:40, background:s.iconBg, borderRadius:8, display:'grid', placeItems:'center', fontSize:'1rem' }}>{s.icon}</div>
                <span style={{ fontSize:'0.72rem', fontWeight:600, padding:'2px 8px', borderRadius:4, background: s.up ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: s.up ? '#065f46' : '#ef4444' }}>{s.change}</span>
              </div>
              <div className="stat-number">{s.val}</div>
              <div style={{ fontSize:'0.78rem', color:'#6b7280', fontWeight:500, marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tab-bar" style={{ marginBottom:24 }}>
          {[['overview','Overview'],['myreports','My Reports'],['notifications','Notifications']].map(([id,label]) => (
            <button key={id} className={`tab-btn ${tab===id?'active':''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'start' }}>
            <div className="card-static" style={{ overflow:'hidden' }}>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.95rem' }}>Recent Activity</h3>
                <span className="badge badge-live"><span className="badge-dot" />Live</span>
              </div>
              {ACTIVITY.map((a,i) => (
                <div key={i} className="activity-item">
                  <div style={{ width:9, height:9, borderRadius:'50%', background:a.dot, flexShrink:0, marginTop:5 }} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'0.86rem', fontWeight:600, marginBottom:1 }}>{a.title}</div>
                    <div style={{ fontSize:'0.78rem', color:'#6b7280' }}>{a.desc}</div>
                  </div>
                  <span style={{ fontSize:'0.72rem', color:'#9ca3af', flexShrink:0 }}>{a.time}</span>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* Breakdown */}
              <div className="card-static" style={{ padding:20 }}>
                <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.95rem', marginBottom:14 }}>Issue Breakdown</h3>
                {[['Potholes','6 reports',43,'#ff6b35'],['Construction','3 reports',21,'#3b82f6'],['Street Lights','3 reports',21,'#f59e0b'],['Waterlogging','2 reports',14,'#10b981']].map(([l,r,pct,c]) => (
                  <div key={l} style={{ marginBottom:11 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.84rem', marginBottom:5 }}>
                      <span>{l}</span><span style={{ color:'#6b7280' }}>{r}</span>
                    </div>
                    <div className="progress-wrap"><div className="progress-bar" style={{ width:`${pct}%`, background:c }} /></div>
                  </div>
                ))}
              </div>
              {/* Resolution rate */}
              <div className="card-static" style={{ padding:20 }}>
                <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.95rem', marginBottom:14 }}>Resolution Rate</h3>
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ position:'relative', width:72, height:72, flexShrink:0 }}>
                    <svg viewBox="0 0 72 72" style={{ transform:'rotate(-90deg)', width:72, height:72 }}>
                      <circle cx="36" cy="36" r="28" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                      <circle cx="36" cy="36" r="28" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="176" strokeDashoffset="47" strokeLinecap="round"/>
                    </svg>
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'0.95rem', color:'#1e3a5f' }}>73%</div>
                  </div>
                  <div>
                    <p style={{ fontSize:'0.82rem', color:'#6b7280', marginBottom:8 }}>8 of 14 issues resolved</p>
                    <span className="badge badge-resolved"><span className="badge-dot" />Above City Average</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MY REPORTS TAB ── */}
        {tab === 'myreports' && (
          <div className="card-static" style={{ overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.95rem' }}>My Reports (14)</h3>
              <input className="form-input" style={{ width:210 }} placeholder="🔍 Search reports..." />
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    {['Issue Type','Location','Status','Date','Actions'].map(h => (
                      <th key={h} style={{ padding:'10px 18px', textAlign:'left', fontSize:'0.72rem', fontWeight:600, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.06em', borderBottom:'1px solid #e5e7eb', background:'#f9fafb' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {REPORTS.map((r,i) => (
                    <tr key={i}>
                      <td style={{ padding:'13px 18px' }}>
                        <div style={{ fontWeight:600, fontSize:'0.88rem' }}>{r.type}</div>
                        <div style={{ fontSize:'0.74rem', color:'#9ca3af' }}>Severity: {r.sev}</div>
                      </td>
                      <td style={{ padding:'13px 18px' }}>
                        <div style={{ fontSize:'0.88rem' }}>{r.loc}</div>
                        <div style={{ fontSize:'0.78rem', color:'#6b7280' }}>{r.city}</div>
                      </td>
                      <td style={{ padding:'13px 18px' }}><Badge status={r.status} /></td>
                      <td style={{ padding:'13px 18px', fontSize:'0.78rem', color:'#9ca3af' }}>{r.date}</td>
                      <td style={{ padding:'13px 18px' }}>
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn-outline btn-sm">View</button>
                          {r.status === 'Pending' && <button className="btn-danger">Delete</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {tab === 'notifications' && (
          <div className="card-static" style={{ overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.95rem' }}>All Notifications</h3>
              <button className="nav-link btn-sm" style={{ fontSize:'0.8rem' }}>Mark all read</button>
            </div>
            {NOTIFS.map((n,i) => (
              <div key={i} className="activity-item" style={{ background: n.unread ? 'rgba(30,58,95,0.02)' : 'transparent' }}>
                <div style={{ width:9, height:9, borderRadius:'50%', background:n.dot, flexShrink:0, marginTop:5 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.86rem', fontWeight:600, marginBottom:2 }}>{n.title}</div>
                  <div style={{ fontSize:'0.78rem', color:'#6b7280' }}>{n.desc}</div>
                </div>
                <span style={{ fontSize:'0.72rem', color:'#9ca3af', flexShrink:0 }}>{n.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
