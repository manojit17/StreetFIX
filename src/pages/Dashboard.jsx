// Dashboard.jsx — fully mobile responsive + real backend data in "My Reports"
import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import Badge from '../components/Badge'

const ACTIVITY = [
  { dot:'#10b981', title:'Pothole on MG Road — Fixed!', desc:'PWD marked your report as resolved', time:'2h ago' },
  { dot:'#3b82f6', title:'NH-48 Construction Zone', desc:'Status changed to In Progress', time:'5h ago' },
  { dot:'#ff6b35', title:'New report submitted', desc:'Broken street light at Andheri West', time:'1d ago' },
  { dot:'#f59e0b', title:'Upvotes on your report', desc:'12 citizens upvoted Waterlogged Road', time:'2d ago' },
  { dot:'#10b981', title:'Road resurfacing complete', desc:'Link Road, Versova — fully resolved', time:'3d ago' },
]

const NOTIFS = [
  { dot:'#10b981', title:'✅ Issue #1042 Resolved — Pothole at MG Road', desc:'PWD has completed repairs. Your report made this happen!', time:'2h ago', unread:true },
  { dot:'#3b82f6', title:'🔧 Status Update — Road construction at NH-48', desc:'NHAI has assigned a team to address your report.', time:'5h ago', unread:true },
  { dot:'#ff6b35', title:'👍 Your report got 12 upvotes', desc:'Waterlogged road on Linking Road is trending in your area.', time:'1d ago', unread:false },
  { dot:'#9ca3af', title:'🏙️ 3 new issues near you', desc:'Citizens reported issues within 2km of your location.', time:'2d ago', unread:false },
  { dot:'#10b981', title:'✅ Issue #1035 Resolved — Link Road, Versova', desc:'Road resurfacing completed. Thank you for reporting!', time:'3d ago', unread:false },
]

// Helper: turn the backend's stored issue type icon/title into something readable
// (your reports are saved with plain text title/description, no fixed "type" enum
// shown here, so we just show the title directly)
const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
}

export default function Dashboard({ navigate, initialTab = 'overview' }) {
  const [tab, setTab] = useState(initialTab)
  const { user } = useApp()

  // ── Real reports state ──────────────────────────────────────
  const [reports,  setReports]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [search,   setSearch]   = useState('')
  const [lightbox, setLightbox] = useState(null) // holds the image URL to show full-size, or null

  // ── Fetch the logged-in user's real reports from the backend ──
  useEffect(() => {
    const fetchMyReports = async () => {
      setLoading(true)
      setError('')
      try {
        const token = localStorage.getItem('sf-token')
        if (!token) {
          setError('Please login to see your reports.')
          setLoading(false)
          return
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL}/reports/my`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()

        if (!res.ok) throw new Error(data.message || 'Failed to load reports')

        setReports(data.data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    // Only fetch when the "My Reports" tab is actually viewed,
    // so we don't waste a request if the user never clicks it
    if (tab === 'myreports') {
      fetchMyReports()
    }
  }, [tab])

  // ── Derived stats from real report data ──────────────────────
  const totalCount      = reports.length
  const resolvedCount   = reports.filter(r => r.status === 'Resolved').length
  const inProgressCount = reports.filter(r => r.status === 'In Progress').length
  const pendingCount    = reports.filter(r => r.status === 'Pending').length

  // ── Search filter ────────────────────────────────────────────
  const filteredReports = reports.filter(r => {
    const q = search.toLowerCase()
    return !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
  })

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ background:'#f9fafb', borderBottom:'1px solid #e5e7eb', padding:'20px 0' }}>
        <div className="page-container" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:14 }}>
          <div>
            {/* Real logged-in user's name instead of hardcoded "Rahul" */}
            <h2 style={{ fontSize:'1.35rem' }}>Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋</h2>
            <p style={{ fontSize:'0.86rem', color:'#6b7280', marginTop:2 }}>Here's what's happening with your reports today.</p>
          </div>
          <button className="btn-accent" onClick={() => navigate('report')}>+ New Report</button>
        </div>
      </div>

      <div className="page-container" style={{ paddingBottom:48 }}>

        {/* ── Stat cards — now from REAL report counts ── */}
        <div className="stats-grid" style={{ margin:'22px 0' }}>
          {[
            { icon:'📝', iconBg:'rgba(30,58,95,0.08)', val: totalCount,      label:'Total Reports' },
            { icon:'✅', iconBg:'rgba(16,185,129,0.08)', val: resolvedCount,   label:'Resolved' },
            { icon:'🔧', iconBg:'rgba(59,130,246,0.08)', val: inProgressCount, label:'In Progress' },
            { icon:'⏳', iconBg:'rgba(245,158,11,0.08)', val: pendingCount,    label:'Pending' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div style={{ width:38, height:38, background:s.iconBg, borderRadius:8, display:'grid', placeItems:'center', fontSize:'0.95rem' }}>{s.icon}</div>
              </div>
              <div className="stat-number">{s.val}</div>
              <div style={{ fontSize:'0.78rem', color:'#6b7280', fontWeight:500, marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="tab-bar" style={{ marginBottom:22 }}>
          {[['overview','Overview'],['myreports','My Reports'],['notifications','Notifications']].map(([id,label]) => (
            <button key={id} className={`tab-btn ${tab===id?'active':''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {/* ── OVERVIEW TAB — still uses placeholder activity feed for now ── */}
        {tab === 'overview' && (
          <div className="dashboard-grid">
            <div className="card-static" style={{ overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.92rem' }}>Recent Activity</h3>
                <span className="badge badge-live"><span className="badge-dot" />Live</span>
              </div>
              {ACTIVITY.map((a,i) => (
                <div key={i} className="activity-item">
                  <div style={{ width:9, height:9, borderRadius:'50%', background:a.dot, flexShrink:0, marginTop:5 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'0.85rem', fontWeight:600, marginBottom:1 }}>{a.title}</div>
                    <div style={{ fontSize:'0.78rem', color:'#6b7280' }}>{a.desc}</div>
                  </div>
                  <span style={{ fontSize:'0.72rem', color:'#9ca3af', flexShrink:0 }}>{a.time}</span>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div className="card-static" style={{ padding:18 }}>
                <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.92rem', marginBottom:13 }}>Issue Breakdown</h3>
                {[['Potholes','6 reports',43,'#ff6b35'],['Construction','3 reports',21,'#3b82f6'],['Street Lights','3 reports',21,'#f59e0b'],['Waterlogging','2 reports',14,'#10b981']].map(([l,r,pct,c]) => (
                  <div key={l} style={{ marginBottom:11 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.84rem', marginBottom:5 }}>
                      <span>{l}</span><span style={{ color:'#6b7280' }}>{r}</span>
                    </div>
                    <div className="progress-wrap"><div className="progress-bar" style={{ width:`${pct}%`, background:c }} /></div>
                  </div>
                ))}
              </div>

              <div className="card-static" style={{ padding:18 }}>
                <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.92rem', marginBottom:13 }}>Resolution Rate</h3>
                <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                  <div style={{ position:'relative', width:68, height:68, flexShrink:0 }}>
                    <svg viewBox="0 0 72 72" style={{ transform:'rotate(-90deg)', width:68, height:68 }}>
                      <circle cx="36" cy="36" r="28" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                      <circle cx="36" cy="36" r="28" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="176" strokeDashoffset="47" strokeLinecap="round"/>
                    </svg>
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'0.9rem', color:'#1e3a5f' }}>73%</div>
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

        {/* ── MY REPORTS TAB — NOW SHOWS REAL DATA + PHOTOS ── */}
        {tab === 'myreports' && (
          <div className="card-static" style={{ overflow:'hidden' }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
              <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.92rem' }}>My Reports ({totalCount})</h3>
              <input
                className="form-input"
                style={{ width:210, maxWidth:'100%' }}
                placeholder="🔍 Search reports..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Loading state */}
            {loading && (
              <div style={{ padding:40, textAlign:'center', color:'#6b7280' }}>
                Loading your reports...
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <div style={{ padding:'14px 18px', color:'#dc2626', fontSize:'0.85rem' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && filteredReports.length === 0 && (
              <div style={{ padding:40, textAlign:'center', color:'#6b7280' }}>
                <p style={{ fontSize:'2rem', marginBottom:8 }}>📭</p>
                <p>No reports yet. Click "+ New Report" to submit your first one.</p>
              </div>
            )}

            {/* Real report cards — grid layout, each card shows photo if present */}
            {!loading && !error && filteredReports.length > 0 && (
              <div style={{
                display:'grid',
                gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))',
                gap:16,
                padding:18,
              }}>
                {filteredReports.map(r => (
                  <div key={r._id} style={{ border:'1px solid #e5e7eb', borderRadius:10, overflow:'hidden', background:'#fff' }}>

                    {/* Photo — only renders if the report has an image */}
                    {r.image ? (
                      <img
                        src={r.image}
                        alt={r.title}
                        onClick={() => setLightbox(r.image)}
                        style={{ width:'100%', height:160, objectFit:'cover', cursor:'pointer', display:'block' }}
                      />
                    ) : (
                      <div style={{ width:'100%', height:160, background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af', fontSize:'0.8rem' }}>
                        No photo attached
                      </div>
                    )}

                    <div style={{ padding:14 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:6 }}>
                        <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{r.title}</div>
                        <Badge status={r.status} />
                      </div>
                      <p style={{ fontSize:'0.8rem', color:'#6b7280', marginBottom:8, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                        {r.description}
                      </p>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'0.74rem', color:'#9ca3af' }}>
                        <span>Severity: {r.severity}</span>
                        <span>{formatDate(r.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {tab === 'notifications' && (
          <div className="card-static" style={{ overflow:'hidden' }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
              <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.92rem' }}>All Notifications</h3>
              <button className="nav-link btn-sm" style={{ fontSize:'0.8rem' }}>Mark all read</button>
            </div>
            {NOTIFS.map((n,i) => (
              <div key={i} className="activity-item" style={{ background: n.unread ? 'rgba(30,58,95,0.02)' : 'transparent' }}>
                <div style={{ width:9, height:9, borderRadius:'50%', background:n.dot, flexShrink:0, marginTop:5 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'0.86rem', fontWeight:600, marginBottom:2 }}>{n.title}</div>
                  <div style={{ fontSize:'0.78rem', color:'#6b7280' }}>{n.desc}</div>
                </div>
                <span style={{ fontSize:'0.72rem', color:'#9ca3af', flexShrink:0 }}>{n.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox — click any report photo to view it full size ── */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:1000,
            display:'flex', alignItems:'center', justifyContent:'center', padding:20, cursor:'zoom-out',
          }}
        >
          <img src={lightbox} alt="Report" style={{ maxWidth:'100%', maxHeight:'100%', borderRadius:8 }} />
        </div>
      )}
    </div>
  )
}