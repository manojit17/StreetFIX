// Home.jsx — fully mobile responsive + real backend data
import { useState, useEffect } from 'react'
import Badge from '../components/Badge'

// Maps a report's severity to a progress-bar percentage and colour,
// since the backend doesn't store a "progress %" — we derive a simple
// visual indicator from status instead (more meaningful than a fake number)
const statusToProgress = (status) => {
  if (status === 'Resolved')    return { pct: 100, color: '#10b981' }
  if (status === 'In Progress') return { pct: 60,  color: '#3b82f6' }
  return                              { pct: 20,  color: '#f59e0b' } // Pending
}

// Simple icon based on keywords in the report title — best-effort guess
// since reports don't have a fixed "type" field shown in the UI yet
const guessIcon = (title = '') => {
  const t = title.toLowerCase()
  if (t.includes('pothole'))        return { icon:'🕳️', bg:'rgba(239,68,68,0.1)' }
  if (t.includes('construction'))   return { icon:'🚧', bg:'rgba(59,130,246,0.1)' }
  if (t.includes('light'))          return { icon:'💡', bg:'rgba(16,185,129,0.1)' }
  if (t.includes('water'))          return { icon:'💧', bg:'rgba(245,158,11,0.1)' }
  return                                   { icon:'📍', bg:'rgba(107,114,128,0.1)' }
}

// "2h ago", "3d ago" style relative time from an ISO date string
const timeAgo = (iso) => {
  if (!iso) return ''
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins   = Math.floor(diffMs / 60000)
  if (mins < 60)   return `${mins}m ago`
  const hours  = Math.floor(mins / 60)
  if (hours < 24)  return `${hours}h ago`
  const days   = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function Home({ navigate }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  // ── Fetch all public reports (no login required for this endpoint) ──
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      setError('')
      try {
        const res  = await fetch(`${import.meta.env.VITE_API_URL}/reports`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to load reports')
        setReports(data.data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  // ── Derived real stats from the fetched reports ──────────────
  const totalCount      = reports.length
  const resolvedCount   = reports.filter(r => r.status === 'Resolved').length
  const inProgressCount = reports.filter(r => r.status === 'In Progress').length
  const pendingCount    = reports.filter(r => r.status === 'Pending').length

  // Most recent 4 reports, newest first (backend already sorts by -createdAt,
  // but we slice defensively here too)
  const recentReports = [...reports]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4)

  return (
    <div>
      {/* ── Hero bar ── */}
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

        {/* ── Quick Actions ── */}
        <div className="quick-actions-grid" style={{ marginBottom:24 }}>
          {[
            { icon:'📝', iconBg:'rgba(30,58,95,0.08)', label:'Report Issue', page:'report' },
            // { icon:'🗺️', iconBg:'rgba(59,130,246,0.08)', label:'Issue Map', page:'map' },
            { icon:'📊', iconBg:'rgba(16,185,129,0.08)', label:'My Reports', page:'dashboard' },
            { icon:'🔔', iconBg:'rgba(245,158,11,0.08)', label:'Notifications', page:'dashboard' },
          ].map(q => (
            <div key={q.label} className="quick-action" onClick={() => navigate(q.page)}>
              <div style={{ width:48, height:48, background:q.iconBg, borderRadius:10, display:'grid', placeItems:'center', fontSize:'1.3rem' }}>{q.icon}</div>
              <span style={{ fontSize:'0.86rem', fontWeight:600 }}>{q.label}</span>
            </div>
          ))}
        </div>

        <div className="overview-grid">

          {/* LEFT — Recent Reports — NOW REAL DATA */}
          <div>
            <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:'1rem', marginBottom:12 }}>Recent Reports Near You</h3>

            {loading && (
              <div style={{ padding:24, textAlign:'center', color:'#6b7280', fontSize:'0.85rem' }}>
                Loading reports...
              </div>
            )}

            {!loading && error && (
              <div style={{ padding:'12px 16px', color:'#dc2626', fontSize:'0.84rem', background:'#fef2f2', borderRadius:8 }}>
                ⚠️ {error}
              </div>
            )}

            {!loading && !error && recentReports.length === 0 && (
              <div style={{ padding:24, textAlign:'center', color:'#6b7280', fontSize:'0.85rem' }}>
                No reports yet. Be the first to report an issue!
              </div>
            )}

            {!loading && !error && recentReports.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {recentReports.map(r => {
                  const { icon, bg }       = guessIcon(r.title)
                  const { pct, color }     = statusToProgress(r.status)
                  return (
                    <div key={r._id} className="report-row">
                      <div style={{ width:44, height:44, background:bg, borderRadius:10, display:'grid', placeItems:'center', fontSize:'1.15rem', flexShrink:0 }}>{icon}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:'0.9rem', fontWeight:600, marginBottom:2 }}>{r.title}</div>
                        <div style={{ fontSize:'0.78rem', color:'#6b7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {r.description}
                        </div>
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

          {/* RIGHT — City stats + Trending */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* City-wide stats — NOW REAL COUNTS from all reports */}
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

            {/* Trending — kept as a simple static placeholder for now.
                Real trend % needs historical day-over-day comparison,
                which is a separate backend feature (not built yet). */}
            <div className="card-static" style={{ padding:20 }}>
              <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.95rem', marginBottom:12 }}>🔥 Most Common Issues</h3>
              {totalCount === 0 ? (
                <p style={{ fontSize:'0.82rem', color:'#9ca3af' }}>Not enough data yet.</p>
              ) : (
                // Quick real tally: count how many reports mention each keyword in the title
                ['pothole', 'water', 'light', 'construction'].map(keyword => {
                  const count = reports.filter(r => r.title.toLowerCase().includes(keyword)).length
                  const label = keyword === 'water' ? 'Waterlogging'
                              : keyword === 'light' ? 'Street Lights'
                              : keyword === 'construction' ? 'Construction'
                              : 'Potholes'
                  return (
                    <div key={keyword} style={{ display:'flex', justifyContent:'space-between', marginBottom:9 }}>
                      <span style={{ fontSize:'0.85rem' }}>{label}</span>
                      <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, color:'#1e3a5f', fontSize:'0.85rem' }}>{count}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}