// Dashboard.jsx — real backend data, fake NOTIFS removed
import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import Badge from '../components/Badge'
import SupportButton from '../components/SupportButton'

const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
}

const timeAgo = (iso) => {
  if (!iso) return ''
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins   = Math.floor(diffMs / 60000)
  if (mins < 60)  return `${mins}m ago`
  const hours  = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const categoriseTitle = (title = '') => {
  const t = title.toLowerCase()
  if (t.includes('pothole'))      return 'Potholes'
  if (t.includes('construction')) return 'Construction'
  if (t.includes('light'))        return 'Street Lights'
  if (t.includes('water'))        return 'Waterlogging'
  return 'Other'
}

export default function Dashboard({ navigate, initialTab = 'overview' }) {
  const [tab, setTab] = useState(initialTab)
  const { user } = useApp()

  const [reports,  setReports]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [search,   setSearch]   = useState('')
  const [lightbox, setLightbox] = useState(null)

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
        const res  = await fetch(`${import.meta.env.VITE_API_URL}/reports/my`, {
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
    fetchMyReports()
  }, [])

  const handleSupportUpdate = (updatedReport) => {
    setReports(prev => prev.map(r => r._id === updatedReport._id ? updatedReport : r))
  }

  const totalCount      = reports.length
  const resolvedCount   = reports.filter(r => r.status === 'Resolved').length
  const inProgressCount = reports.filter(r => r.status === 'In Progress').length
  const pendingCount    = reports.filter(r => r.status === 'Pending').length
  const resolutionRate  = totalCount === 0 ? 0 : Math.round((resolvedCount / totalCount) * 100)
  const circumference   = 176
  const strokeDashoffset = circumference - (circumference * resolutionRate) / 100

  const breakdownCategories = ['Potholes', 'Construction', 'Street Lights', 'Waterlogging']
  const breakdownColors = {
    'Potholes'     : '#ff6b35',
    'Construction' : '#3b82f6',
    'Street Lights': '#f59e0b',
    'Waterlogging' : '#10b981',
  }
  const issueBreakdown = breakdownCategories
    .map(cat => {
      const count = reports.filter(r => categoriseTitle(r.title) === cat).length
      const pct   = totalCount === 0 ? 0 : Math.round((count / totalCount) * 100)
      return { label: cat, count, pct, color: breakdownColors[cat] }
    })
    .filter(c => c.count > 0)

  // Real activity feed from actual reports — no fake data
  const recentActivity = [...reports]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(r => ({
      dot  : r.status === 'Resolved' ? '#10b981' : r.status === 'In Progress' ? '#3b82f6' : '#f59e0b',
      title: r.title,
      desc : `Status: ${r.status} • ${r.severity} severity`,
      time : timeAgo(r.createdAt),
    }))

  const filteredReports = reports.filter(r => {
    const q = search.toLowerCase()
    return !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
  })

  return (
    <div>
      {/* Header */}
      <div style={{ background:'#f9fafb', borderBottom:'1px solid #e5e7eb', padding:'20px 0' }}>
        <div className="page-container" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:14 }}>
          <div>
            <h2 style={{ fontSize:'1.35rem' }}>Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋</h2>
            <p style={{ fontSize:'0.86rem', color:'#6b7280', marginTop:2 }}>Here's what's happening with your reports today.</p>
          </div>
          <button className="btn-accent" onClick={() => navigate('report')}>+ New Report</button>
        </div>
      </div>

      <div className="page-container" style={{ paddingBottom:48 }}>

        {/* Stat cards */}
        <div className="stats-grid" style={{ margin:'22px 0' }}>
          {[
            { icon:'📝', iconBg:'rgba(30,58,95,0.08)',   val: totalCount,      label:'Total Reports' },
            { icon:'✅', iconBg:'rgba(16,185,129,0.08)', val: resolvedCount,   label:'Resolved'      },
            { icon:'🔧', iconBg:'rgba(59,130,246,0.08)', val: inProgressCount, label:'In Progress'   },
            { icon:'⏳', iconBg:'rgba(245,158,11,0.08)', val: pendingCount,    label:'Pending'       },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ marginBottom:10 }}>
                <div style={{ width:38, height:38, background:s.iconBg, borderRadius:8, display:'grid', placeItems:'center', fontSize:'0.95rem' }}>{s.icon}</div>
              </div>
              <div className="stat-number">{s.val}</div>
              <div style={{ fontSize:'0.78rem', color:'#6b7280', fontWeight:500, marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tab-bar" style={{ marginBottom:22 }}>
          {[['overview','Overview'],['myreports','My Reports']].map(([id,label]) => (
            <button key={id} className={`tab-btn ${tab===id?'active':''}`} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="dashboard-grid">

            {/* Recent Activity — real reports, no fake data */}
            <div className="card-static" style={{ overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid #f3f4f6',
                            display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.92rem' }}>Recent Activity</h3>
                <span className="badge badge-live"><span className="badge-dot" />Live</span>
              </div>

              {loading && (
                <div style={{ padding:30, textAlign:'center', color:'#6b7280', fontSize:'0.85rem' }}>Loading...</div>
              )}

              {!loading && recentActivity.length === 0 && (
                <div style={{ padding:30, textAlign:'center', color:'#6b7280', fontSize:'0.85rem' }}>
                  No activity yet. Submit your first report to see it here.
                </div>
              )}

              {!loading && recentActivity.map((a,i) => (
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

              {/* Issue Breakdown */}
              <div className="card-static" style={{ padding:18 }}>
                <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.92rem', marginBottom:13 }}>Issue Breakdown</h3>
                {issueBreakdown.length === 0 ? (
                  <p style={{ fontSize:'0.82rem', color:'#9ca3af' }}>No reports yet to break down.</p>
                ) : issueBreakdown.map(b => (
                  <div key={b.label} style={{ marginBottom:11 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.84rem', marginBottom:5 }}>
                      <span>{b.label}</span>
                      <span style={{ color:'#6b7280' }}>{b.count} report{b.count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="progress-wrap">
                      <div className="progress-bar" style={{ width:`${b.pct}%`, background:b.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Resolution Rate */}
              <div className="card-static" style={{ padding:18 }}>
                <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.92rem', marginBottom:13 }}>Resolution Rate</h3>
                <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                  <div style={{ position:'relative', width:68, height:68, flexShrink:0 }}>
                    <svg viewBox="0 0 72 72" style={{ transform:'rotate(-90deg)', width:68, height:68 }}>
                      <circle cx="36" cy="36" r="28" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                      <circle cx="36" cy="36" r="28" fill="none" stroke="#10b981" strokeWidth="8"
                        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"/>
                    </svg>
                    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center',
                                  justifyContent:'center', fontFamily:'Poppins,sans-serif',
                                  fontWeight:700, fontSize:'0.9rem', color:'#1e3a5f' }}>
                      {resolutionRate}%
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize:'0.82rem', color:'#6b7280', marginBottom:8 }}>
                      {resolvedCount} of {totalCount} issue{totalCount !== 1 ? 's' : ''} resolved
                    </p>
                    {totalCount > 0 && (
                      <span className="badge badge-resolved"><span className="badge-dot" />Keep reporting!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MY REPORTS TAB */}
        {tab === 'myreports' && (
          <div className="card-static" style={{ overflow:'hidden' }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid #f3f4f6',
                          display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
              <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.92rem' }}>My Reports ({totalCount})</h3>
              <input className="form-input" style={{ width:210, maxWidth:'100%' }}
                placeholder="🔍 Search reports..." value={search}
                onChange={e => setSearch(e.target.value)} />
            </div>

            {loading && (
              <div style={{ padding:40, textAlign:'center', color:'#6b7280' }}>Loading your reports...</div>
            )}

            {!loading && error && (
              <div style={{ padding:'14px 18px', color:'#dc2626', fontSize:'0.85rem' }}>⚠️ {error}</div>
            )}

            {!loading && !error && filteredReports.length === 0 && (
              <div style={{ padding:40, textAlign:'center', color:'#6b7280' }}>
                <p style={{ fontSize:'2rem', marginBottom:8 }}>📭</p>
                <p>No reports yet. Click "+ New Report" to submit your first one.</p>
              </div>
            )}

            {!loading && !error && filteredReports.length > 0 && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))',
                            gap:16, padding:18 }}>
                {filteredReports.map(r => (
                  <div key={r._id} style={{ border:'1px solid #e5e7eb', borderRadius:10,
                                            overflow:'hidden', background:'#fff' }}>
                    {r.image ? (
                      <img src={r.image} alt={r.title} onClick={() => setLightbox(r.image)}
                        style={{ width:'100%', height:160, objectFit:'cover', cursor:'pointer', display:'block' }} />
                    ) : (
                      <div style={{ width:'100%', height:160, background:'#f3f4f6', display:'flex',
                                    alignItems:'center', justifyContent:'center', color:'#9ca3af', fontSize:'0.8rem' }}>
                        No photo attached
                      </div>
                    )}
                    <div style={{ padding:14 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
                                    gap:8, marginBottom:6 }}>
                        <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{r.title}</div>
                        <Badge status={r.status} />
                      </div>
                      <p style={{ fontSize:'0.8rem', color:'#6b7280', marginBottom:8,
                                  display:'-webkit-box', WebkitLineClamp:2,
                                  WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                        {r.description}
                      </p>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                                    fontSize:'0.74rem', color:'#9ca3af', marginBottom:10 }}>
                        <span>Severity: {r.severity}</span>
                        <span>{formatDate(r.createdAt)}</span>
                      </div>
                      <div style={{ display:'flex', justifyContent:'flex-start' }}>
                        <SupportButton report={r} onUpdate={handleSupportUpdate} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:1000,
                   display:'flex', alignItems:'center', justifyContent:'center', padding:20, cursor:'zoom-out' }}>
          <img src={lightbox} alt="Report" style={{ maxWidth:'100%', maxHeight:'100%', borderRadius:8 }} />
        </div>
      )}
    </div>
  )
}