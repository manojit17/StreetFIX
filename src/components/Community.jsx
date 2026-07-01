// Community.jsx — replaces Overview page
// Feed with 4 tabs: All Reports | Nearby | Trending | Leaderboard
// Each report card supports: upvote, comment, view details

import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import SupportButton from '../components/SupportButton'
import CommentSection from '../components/CommentSection'

const API = import.meta.env.VITE_API_URL

// Haversine formula — distance in meters between two GPS points
function getDistanceInMeters(lat1, lng1, lat2, lng2) {
  const R     = 6371000
  const toRad = (d) => d * (Math.PI / 180)
  const dLat  = toRad(lat2 - lat1)
  const dLng  = toRad(lng2 - lng1)
  const a     = Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Format distance nicely
const formatDistance = (m) => m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`

// Trending score formula
const trendingScore = (r) => {
  const ageMs  = Date.now() - new Date(r.createdAt).getTime()
  const ageH   = ageMs / 3600000
  const boost  = ageH < 24 ? 10 : ageH < 72 ? 5 : ageH < 168 ? 2 : 0
  return (r.supporters?.length || 0) * 2 + boost
}

// Relative time
const timeAgo = (iso) => {
  if (!iso) return ''
  const mins = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// Status badge
const statusStyle = (s) =>
  s === 'Resolved'    ? { background:'#d1fae5', color:'#065f46' } :
  s === 'In Progress' ? { background:'#dbeafe', color:'#1e40af' } :
                        { background:'#fef3c7', color:'#92400e' }

// ── Single Report Card ────────────────────────────────────────
function ReportCard({ report: initialReport, distance, onUpdate }) {
  const { isLoggedIn, showToast } = useApp()
  const [report,       setReport]       = useState(initialReport)
  const [commentOpen,  setCommentOpen]  = useState(false)

  // Keep local state in sync if parent updates (e.g. support toggle)
  useEffect(() => { setReport(initialReport) }, [initialReport])

  const handleSupportUpdate = (updated) => {
    setReport(updated)
    onUpdate?.(updated)
  }

  return (
    <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12,
                  overflow:'hidden', marginBottom:16 }}>

      {/* ── Card header — poster info ── */}
      <div style={{ padding:'14px 16px 10px', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:'50%', background:'#1e3a5f',
                     display:'grid', placeItems:'center', fontSize:'0.75rem',
                     fontWeight:700, color:'#fff', flexShrink:0 }}>
          {report.userId?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:600, fontSize:'0.88rem' }}>{report.userId?.name || 'Anonymous'}</div>
          <div style={{ fontSize:'0.74rem', color:'#9ca3af' }}>
            {timeAgo(report.createdAt)}
            {distance !== undefined && ` • 📍 ${formatDistance(distance)} away`}
          </div>
        </div>
        <span style={{ padding:'3px 10px', borderRadius:20, fontSize:'0.74rem', fontWeight:600, ...statusStyle(report.status) }}>
          {report.status}
        </span>
      </div>

      {/* ── Report content ── */}
      <div style={{ padding:'0 16px 12px' }}>
        <div style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:4 }}>{report.title}</div>
        <p style={{ fontSize:'0.84rem', color:'#6b7280', lineHeight:1.5, marginBottom:8 }}>
          {report.description}
        </p>
        <div style={{ fontSize:'0.76rem', color:'#9ca3af' }}>
          Severity: <span style={{ fontWeight:600, color:'#374151' }}>{report.severity}</span>
        </div>
      </div>

      {/* ── Photo ── */}
      {report.image && (
        <img src={report.image} alt={report.title}
          style={{ width:'100%', maxHeight:280, objectFit:'cover', display:'block' }} />
      )}

      {/* ── Engagement counts row ── */}
      <div style={{ padding:'10px 16px', borderTop:'1px solid #f3f4f6', borderBottom:'1px solid #f3f4f6',
                    display:'flex', gap:16, fontSize:'0.78rem', color:'#6b7280' }}>
        <span>👍 {report.supporters?.length || 0} supports</span>
        <span>💬 {report.commentCount || 0} comments</span>
      </div>

      {/* ── Action buttons ── */}
      <div style={{ padding:'10px 16px', display:'flex', gap:8, flexWrap:'wrap' }}>
        {/* Support/upvote button */}
        <SupportButton report={report} onUpdate={handleSupportUpdate} />

        {/* Comment toggle button */}
        <button
          onClick={() => {
            if (!isLoggedIn) { showToast('🔒', 'Login Required', 'Please sign in to comment.'); return }
            setCommentOpen(o => !o)
          }}
          style={{
            display:'flex', alignItems:'center', gap:6, padding:'6px 12px',
            borderRadius:20, border:`1px solid ${commentOpen ? '#1e3a5f' : '#e5e7eb'}`,
            background: commentOpen ? '#f0f4ff' : '#ffffff',
            color: commentOpen ? '#1e3a5f' : '#6b7280',
            fontSize:'0.82rem', fontWeight:600, cursor:'pointer',
          }}>
          💬 Comment
        </button>
      </div>

      {/* ── Comment section (expands on click) ── */}
      <CommentSection reportId={report._id} isOpen={commentOpen} />
    </div>
  )
}

// ── Leaderboard Row ───────────────────────────────────────────
function LeaderboardRow({ rank, name, score, reports, verifications }) {
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0',
                  borderBottom:'1px solid #f3f4f6' }}>
      <div style={{ width:32, textAlign:'center', fontWeight:700, fontSize:'0.9rem' }}>{medal}</div>
      <div style={{ width:36, height:36, borderRadius:'50%', background:'#1e3a5f',
                   display:'grid', placeItems:'center', fontSize:'0.75rem',
                   fontWeight:700, color:'#fff', flexShrink:0 }}>
        {name?.charAt(0)?.toUpperCase() || '?'}
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:600, fontSize:'0.88rem' }}>{name}</div>
        <div style={{ fontSize:'0.74rem', color:'#9ca3af' }}>{reports} reports • {verifications} verifications</div>
      </div>
      <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, color:'#ff6b35', fontSize:'0.95rem' }}>
        {score}
      </div>
    </div>
  )
}

// ── Main Community Page ───────────────────────────────────────
export default function Community({ navigate }) {
  const { isLoggedIn, showToast } = useApp()

  const [tab,        setTab]        = useState('all')
  const [allReports, setAllReports] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [userLat,    setUserLat]    = useState(null)
  const [userLng,    setUserLng]    = useState(null)
  const [locLoading, setLocLoading] = useState(false)
  const [leaderboard,setLeaderboard]= useState([])
  const [lbLoading,  setLbLoading]  = useState(false)

  // Fetch all reports on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const res  = await fetch(`${API}/reports`)
        const data = await res.json()
        if (data.success) setAllReports(data.data || [])
      } catch {
        showToast('❌', 'Error', 'Could not load reports.')
      } finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  // Detect location when user clicks Nearby tab
  const detectLocation = () => {
    if (userLat) return // already have it
    setLocLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude)
        setUserLng(pos.coords.longitude)
        setLocLoading(false)
      },
      () => {
        showToast('⚠️', 'Location Denied', 'Allow location access to see nearby reports.')
        setLocLoading(false)
      }
    )
  }

  // Fetch leaderboard when tab selected
  useEffect(() => {
    if (tab !== 'leaderboard') return
    const fetchLb = async () => {
      setLbLoading(true)
      try {
        const res  = await fetch(`${API}/reports`)
        const data = await res.json()
        if (!data.success) return

        // Build per-user stats from all reports
        const userMap = {}
        ;(data.data || []).forEach(r => {
          const uid  = r.userId?._id || r.userId
          const name = r.userId?.name || 'Anonymous'
          if (!uid) return
          if (!userMap[uid]) userMap[uid] = { name, reports:0, verifications:0, supports:0 }
          userMap[uid].reports++
        })

        // Score formula: reports×5 + verifications×3 + supports×1
        const lb = Object.values(userMap)
          .map(u => ({ ...u, score: u.reports * 5 + u.verifications * 3 + u.supports }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)

        setLeaderboard(lb)
      } catch {}
      finally { setLbLoading(false) }
    }
    fetchLb()
  }, [tab])

  // Update a single report in local state (after support toggle)
  const handleUpdate = (updated) => {
    setAllReports(prev => prev.map(r => r._id === updated._id ? updated : r))
  }

  // ── Derived lists ─────────────────────────────────────────────
  const nearbyReports = userLat
    ? allReports
        .map(r => ({ ...r, distance: getDistanceInMeters(userLat, userLng, r.latitude, r.longitude) }))
        .filter(r => r.distance <= 5000)
        .sort((a, b) => a.distance - b.distance)
    : []

  const trendingReports = [...allReports]
    .sort((a, b) => trendingScore(b) - trendingScore(a))
    .slice(0, 20)

  const TABS = [
    { id:'all',         label:'🌐 All Reports' },
    { id:'nearby',      label:'📍 Nearby'      },
    { id:'trending',    label:'🔥 Trending'    },
    { id:'leaderboard', label:'🏆 Leaderboard' },
  ]

  const renderFeed = (reports, showDistance = false) => {
    if (loading) return (
      <div style={{ padding:40, textAlign:'center', color:'#6b7280' }}>Loading reports...</div>
    )
    if (reports.length === 0) return (
      <div style={{ padding:40, textAlign:'center', color:'#6b7280' }}>
        <p style={{ fontSize:'2rem', marginBottom:8 }}>📭</p>
        <p>No reports to show here yet.</p>
      </div>
    )
    return reports.map(r => (
      <ReportCard
        key={r._id}
        report={r}
        distance={showDistance ? r.distance : undefined}
        onUpdate={handleUpdate}
      />
    ))
  }

  return (
    <div style={{ background:'#f3f4f6', minHeight:'100vh' }}>

      {/* ── Header ── */}
      <div style={{ background:'linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)', padding:'28px 0 20px' }}>
        <div className="page-container">
          <h1 style={{ color:'#fff', fontSize:'1.6rem', marginBottom:4 }}>🌍 Community</h1>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.88rem' }}>
            See what citizens are reporting. Support, comment, and verify issues near you.
          </p>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop:20, paddingBottom:48 }}>

        {/* ── Tab bar ── */}
        <div className="tab-bar" style={{ marginBottom:20 }}>
          {TABS.map(t => (
            <button key={t.id}
              className={`tab-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => {
                setTab(t.id)
                if (t.id === 'nearby') detectLocation()
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── ALL REPORTS TAB ── */}
        {tab === 'all' && (
          <div style={{ maxWidth:640, margin:'0 auto' }}>
            {renderFeed(allReports)}
          </div>
        )}

        {/* ── NEARBY TAB ── */}
        {tab === 'nearby' && (
          <div style={{ maxWidth:640, margin:'0 auto' }}>
            {locLoading && (
              <div style={{ padding:40, textAlign:'center', color:'#6b7280' }}>
                Detecting your location...
              </div>
            )}
            {!locLoading && !userLat && (
              <div style={{ padding:40, textAlign:'center', color:'#6b7280' }}>
                <p style={{ fontSize:'2rem', marginBottom:8 }}>📍</p>
                <p style={{ marginBottom:12 }}>Allow location access to see reports near you.</p>
                <button className="btn-accent" onClick={detectLocation}>Detect My Location</button>
              </div>
            )}
            {!locLoading && userLat && renderFeed(nearbyReports, true)}
          </div>
        )}

        {/* ── TRENDING TAB ── */}
        {tab === 'trending' && (
          <div style={{ maxWidth:640, margin:'0 auto' }}>
            {renderFeed(trendingReports)}
          </div>
        )}

        {/* ── LEADERBOARD TAB ── */}
        {tab === 'leaderboard' && (
          <div style={{ maxWidth:560, margin:'0 auto' }}>
            <div className="card-static" style={{ padding:20 }}>
              <h3 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.95rem', marginBottom:4 }}>
                🏆 Top Citizens
              </h3>
              <p style={{ fontSize:'0.78rem', color:'#9ca3af', marginBottom:16 }}>
                Score = Reports×5 + Verifications×3 + Supports×1
              </p>
              {lbLoading && <p style={{ color:'#9ca3af', fontSize:'0.85rem' }}>Loading...</p>}
              {!lbLoading && leaderboard.length === 0 && (
                <p style={{ color:'#9ca3af', fontSize:'0.85rem' }}>No data yet.</p>
              )}
              {!lbLoading && leaderboard.map((u, i) => (
                <LeaderboardRow key={i} rank={i + 1} name={u.name}
                  score={u.score} reports={u.reports} verifications={u.verifications} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}