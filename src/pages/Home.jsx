// Home.jsx (Overview page) — notification quick action opens panel via AppContext
import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import Badge from '../components/Badge'

const statusToProgress = (status) => {
  if (status === 'Resolved')    return { pct: 100, color: '#10b981' }
  if (status === 'In Progress') return { pct: 60,  color: '#3b82f6' }
  return                              { pct: 20,  color: '#f59e0b' }
}

const guessIcon = (title = '') => {
  const t = title.toLowerCase()
  if (t.includes('pothole'))      return { icon:'🕳️', bg:'rgba(239,68,68,0.1)' }
  if (t.includes('construction')) return { icon:'🚧', bg:'rgba(59,130,246,0.1)' }
  if (t.includes('light'))        return { icon:'💡', bg:'rgba(16,185,129,0.1)' }
  if (t.includes('water'))        return { icon:'💧', bg:'rgba(245,158,11,0.1)' }
  return                                 { icon:'📍', bg:'rgba(107,114,128,0.1)' }
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

export default function Home({ navigate }) {
  // toggleNotif opens/closes the notification panel in the Navbar
  const { isLoggedIn, toggleNotif } = useApp()

  const [allReports, setAllReports] = useState([])
  const [allLoading, setAllLoading] = useState(true)
  const [myReports,  setMyReports]  = useState([])
  const [myLoading,  setMyLoading]  = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res  = await fetch(`${import.meta.env.VITE_API_URL}/reports`)
        const data = await res.json()
        if (data.success) setAllReports(data.data || [])
      } catch {}
      finally { setAllLoading(false) }
    }
    fetchAll()
  }, [])

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

  const totalCount      = allReports.length
  const resolvedCount   = allReports.filter(r => r.status === 'Resolved').length
  const inProgressCount = allReports.filter(r => r.status === 'In Progress').length
  const pendingCount    = allReports.filter(r => r.status === 'Pending').length

  const sourceReports = isLoggedIn ? myReports  : allReports
  const sourceLoading = isLoggedIn ? myLoading  : allLoading
  const recentReports = [...sourceReports]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4)

  const keywordCount = (kw) => allReports.filter(r => r.title.toLowerCase().includes(kw)).length

  // Quick actions — each has its own action function
  // 🔔 Notifications now calls toggleNotif() instead of navigate('dashboard')
  const quickActions = [
    { icon:'📝', iconBg:'rgba(30,58,95,0.08)',  label:'Report Issue',   action: () => navigate('report')    },
    { icon:'📊', iconBg:'rgba(16,185,129,0.08)', label:'My Reports',    action: () => navigate('dashboard') },
    { icon:'🔔', iconBg:'rgba(245,158,11,0.08)', label:'Notifications', action: () => toggleNotif()         },
  ]

  return (
    <div>
      {/* Hero bar */}
      <div style={{ background:'linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)', borderBottom:'1px solid #e5e7eb', padding:'32px 0 24px' }}>
        <div className="page-container" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:16 }}>
          <div>
            <span className="badge badge-live" style={{ marginBottom:8, display:'inline-flex' }}><span className="badge-dot" />Live Updates</span>
            <h1 style={{ fontSize:'1.7rem', color:'#ffffff', marginBottom:4 }}>Your City Dashboard</h1>
            <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.88rem' }}>Monitor road conditions and active reports in real time.</p>
          </div>
          <button className="btn-accent" onClick={() => navigate('report')}>+ Report New Issue</button>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop:24, paddingBottom:48 }}>

        {/* Quick Actions */}
        <div className="quick-actions-grid" style={{ marginBottom:24 }}>
          {quickActions.map(q => (
            <div key={q.label} className="quick-action" onClick={q.action}>
              <div style={{ width:48, height:48, background:q.iconBg, borderRadius:10, display:'grid', placeItems:'center', fontSize:'1.3rem' }}>{q.icon}</div>
              <span style={{ fontSize:'0.86rem', fontWeight:600 }}>{q.label}</span>
            </div>
          ))}
        </div>

        <div className="overview-grid">

          {/* LEFT — Recent Reports */}
          <div>
            <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:'1rem', marginBottom:12 }}>
              {isLoggedIn ? 'My Recent Reports' : 'Recent Reports Near You'}
            </h3>

            {sourceLoading && (
              <div style={{ padding:24, textAlign:'center', color:'#6b7280', fontSize:'0.85rem' }}>
                Loading reports...
              </div>
            )}

            {!sourceLoading && recentReports.length === 0 && (
              <div style={{ padding:24, textAlign:'center', color:'#6b7280', fontSize:'0.85rem' }}>
                {isLoggedIn ? 'You have not reported any issues yet.' : 'No reports yet. Be the first!'}
                <div style={{ marginTop:12 }}>
                  <button className="btn-accent btn-sm" onClick={() => navigate('report')}>+ Report an Issue</button>
                </div>
              </div>
            )}

            {!sourceLoading && recentReports.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {recentReports.map(r => {
                  const { icon, bg }   = guessIcon(r.title)
                  const { pct, color } = statusToProgress(r.status)
                  return (
                    <div key={r._id} className="report-row">
                      <div style={{ width:44, height:44, background:bg, borderRadius:10, display:'grid', placeItems:'center', fontSize:'1.15rem', flexShrink:0 }}>{icon}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:'0.9rem', fontWeight:600, marginBottom:2 }}>{r.title}</div>
                        <div style={{ fontSize:'0.78rem', color:'#6b7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.description}</div>
                        <div className="progress-wrap" style={{ marginTop:6 }}>
                          <div className="progress-bar" style={{ width:`${pct}%`, background:color }} />
                        </div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <Badge status={r.status} />
                        <div style={{ fontSize:'0.72rem', color:'#9ca3af', marginTop:5 }}>{timeAgo(r.createdAt)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* RIGHT — City stats + Most Common */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="card-static" style={{ padding:20 }}>
              <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.95rem', marginBottom:14 }}>City-Wide Status</h3>
              <div className="stats-grid" style={{ gridTemplateColumns:'1fr 1fr' }}>
                {[
                  [pendingCount,    '#f59e0b', 'Pending'],
                  [inProgressCount, '#3b82f6', 'In Progress'],
                  [resolvedCount,   '#10b981', 'Resolved'],
                  [totalCount,      '#1e3a5f', 'Total'],
                ].map(([n,c,l]) => (
                  <div key={l} style={{ background:'#f9fafb', borderRadius:8, padding:14, textAlign:'center' }}>
                    <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'1.4rem', color:c }}>{n}</div>
                    <div style={{ fontSize:'0.72rem', color:'#6b7280', marginTop:2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-static" style={{ padding:20 }}>
              <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.95rem', marginBottom:12 }}>🔥 Most Common Issues</h3>
              {totalCount === 0 ? (
                <p style={{ fontSize:'0.82rem', color:'#9ca3af' }}>Not enough data yet.</p>
              ) : (
                [['pothole','Potholes'],['water','Waterlogging'],['light','Street Lights'],['construction','Construction']].map(([kw, label]) => (
                  <div key={kw} style={{ display:'flex', justifyContent:'space-between', marginBottom:9 }}>
                    <span style={{ fontSize:'0.85rem' }}>{label}</span>
                    <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, color:'#1e3a5f', fontSize:'0.85rem' }}>{keywordCount(kw)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}