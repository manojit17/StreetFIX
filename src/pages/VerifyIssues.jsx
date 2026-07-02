// VerifyIssues.jsx — geo-based verification page
// Shows reports near the user that still need verification.
// Rules: must be within 500m, one verification per user, photo optional.
// FIX: removed 'token' from useApp() (doesn't exist in AppContext)
//      now reads token directly from localStorage instead.

import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

const API             = import.meta.env.VITE_API_URL
const VERIFY_RADIUS_M = 500

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

const formatDistance = (m) =>
  m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`

const timeAgo = (iso) => {
  if (!iso) return ''
  const mins = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const statusStyle = (s) =>
  s === 'Resolved'    ? { background:'#d1fae5', color:'#065f46' } :
  s === 'In Progress' ? { background:'#e0e7ff', color:'#3730a3' } :
                        { background:'#fef3c7', color:'#92400e' }

// ── Single Verify Card ────────────────────────────────────────
function VerifyCard({ report, distance, myUserId, onVerified }) {
  const { showToast } = useApp()
  // FIX: read token directly from localStorage
  const token = localStorage.getItem('sf-token')

  const [open,       setOpen]       = useState(false)
  const [choice,     setChoice]     = useState(null)  // 'confirm' | 'resolved'
  const [photo,      setPhoto]      = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const inRange = distance <= VERIFY_RADIUS_M

  const confirmCount  = report.verifications?.filter(v => v.type === 'confirm').length  || 0
  const resolvedCount = report.verifications?.filter(v => v.type === 'resolved').length || 0

  const alreadyVerified = report.verifications?.some(
    v => (v.userId?._id || v.userId)?.toString() === myUserId
  )

  const isOwnReport = (report.userId?._id || report.userId)?.toString() === myUserId

  const handleSubmit = async () => {
    if (!choice) {
      showToast('⚠️', 'Pick an answer', 'Is this issue still here or fixed?')
      return
    }
    if (!navigator.geolocation) {
      showToast('❌', 'No Geolocation', 'Your browser cannot detect location.')
      return
    }

    setSubmitting(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const form = new FormData()
          form.append('type',      choice)
          form.append('latitude',  pos.coords.latitude)
          form.append('longitude', pos.coords.longitude)
          if (photo) form.append('photo', photo)

          const res  = await fetch(`${API}/reports/${report._id}/verify`, {
            method : 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body   : form,
          })
          const data = await res.json()

          if (!data.success) {
            showToast('❌', 'Could Not Verify', data.message || 'Something went wrong.')
          } else {
            showToast('✅', 'Thanks!', data.message)
            onVerified(data.data)
            setOpen(false)
            setChoice(null)
            setPhoto(null)
          }
        } catch {
          showToast('❌', 'Error', 'Could not submit verification.')
        } finally {
          setSubmitting(false)
        }
      },
      () => {
        showToast('⚠️', 'Location Denied', 'Allow location access to verify.')
        setSubmitting(false)
      }
    )
  }

  return (
    <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:12,
                  overflow:'hidden', marginBottom:14 }}>
      <div style={{ padding:16 }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:2 }}>{report.title}</div>
            <div style={{ fontSize:'0.76rem', color:'#9ca3af' }}>
              📍 {formatDistance(distance)} away • {timeAgo(report.createdAt)}
            </div>
          </div>
          <span style={{ padding:'3px 10px', borderRadius:20, fontSize:'0.72rem',
                         fontWeight:600, flexShrink:0, ...statusStyle(report.status) }}>
            {report.status}
          </span>
        </div>

        {/* Description */}
        <p style={{ fontSize:'0.84rem', color:'#6b7280', lineHeight:1.5, marginBottom:10 }}>
          {report.description}
        </p>

        {/* Report photo if exists */}
        {report.image && (
          <img src={report.image} alt={report.title}
            style={{ width:'100%', maxHeight:180, objectFit:'cover', borderRadius:8,
                     marginBottom:10, display:'block' }} />
        )}

        {/* Counts */}
        <div style={{ display:'flex', gap:16, fontSize:'0.78rem', color:'#6b7280', marginBottom:12 }}>
          <span>👍 {report.supporters?.length || 0} supports</span>
          <span>✅ {confirmCount} verified</span>
          {resolvedCount > 0 && <span>🛠️ {resolvedCount} say fixed</span>}
        </div>

        {/* Action area */}
        {isOwnReport ? (
          <div style={{ fontSize:'0.8rem', color:'#9ca3af', fontStyle:'italic' }}>
            This is your own report — you cannot verify it yourself.
          </div>
        ) : alreadyVerified ? (
          <div style={{ fontSize:'0.8rem', color:'#059669', fontWeight:600 }}>
            ✓ You already verified this report
          </div>
        ) : !open ? (
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            <button
              disabled={!inRange}
              onClick={() => setOpen(true)}
              title={!inRange ? `Move within ${VERIFY_RADIUS_M}m to verify` : ''}
              style={{
                padding:'7px 16px', borderRadius:8, border:'none',
                background: inRange ? '#1e3a5f' : '#e5e7eb',
                color: inRange ? '#fff' : '#9ca3af',
                fontSize:'0.82rem', fontWeight:600,
                cursor: inRange ? 'pointer' : 'not-allowed',
              }}>
              ✓ Verify
            </button>
            {!inRange && (
              <span style={{ fontSize:'0.74rem', color:'#ef4444' }}>
                Must be within {VERIFY_RADIUS_M}m to verify
              </span>
            )}
          </div>
        ) : (
          // ── Expanded verify form ──
          <div style={{ background:'#f9fafb', borderRadius:10, padding:14 }}>
            <div style={{ fontSize:'0.85rem', fontWeight:600, marginBottom:10 }}>
              Is this issue still here?
            </div>

            <div style={{ display:'flex', gap:8, marginBottom:12 }}>
              <button
                onClick={() => setChoice('confirm')}
                style={{
                  flex:1, padding:'9px', borderRadius:8, fontSize:'0.82rem',
                  fontWeight:600, cursor:'pointer',
                  border: choice === 'confirm' ? '2px solid #1e3a5f' : '1px solid #e5e7eb',
                  background: choice === 'confirm' ? '#eef2ff' : '#fff',
                  color: choice === 'confirm' ? '#1e3a5f' : '#374151',
                }}>
                ✅ Yes, still a problem
              </button>
              <button
                onClick={() => setChoice('resolved')}
                style={{
                  flex:1, padding:'9px', borderRadius:8, fontSize:'0.82rem',
                  fontWeight:600, cursor:'pointer',
                  border: choice === 'resolved' ? '2px solid #059669' : '1px solid #e5e7eb',
                  background: choice === 'resolved' ? '#ecfdf5' : '#fff',
                  color: choice === 'resolved' ? '#059669' : '#374151',
                }}>
                🛠️ No, it's fixed
              </button>
            </div>

            <label style={{ display:'block', fontSize:'0.78rem', color:'#6b7280', marginBottom:6 }}>
              📸 Attach photo (optional)
            </label>
            <input type="file" accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              style={{ fontSize:'0.78rem', marginBottom:12 }} />

            <div style={{ display:'flex', gap:8 }}>
              <button
                disabled={submitting}
                onClick={handleSubmit}
                style={{
                  flex:1, padding:'9px', borderRadius:8, border:'none',
                  background: submitting ? '#9ca3af' : '#ff6b35',
                  color:'#fff', fontSize:'0.82rem', fontWeight:600,
                  cursor: submitting ? 'wait' : 'pointer',
                }}>
                {submitting ? 'Submitting...' : 'Submit Verification'}
              </button>
              <button
                onClick={() => { setOpen(false); setChoice(null); setPhoto(null) }}
                style={{
                  padding:'9px 14px', borderRadius:8, border:'1px solid #e5e7eb',
                  background:'#fff', color:'#6b7280', fontSize:'0.82rem',
                  fontWeight:600, cursor:'pointer',
                }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Verify Issues Page ───────────────────────────────────
export default function VerifyIssues() {
  // FIX: removed 'token' from destructuring — it doesn't exist in AppContext
  const { isLoggedIn, user } = useApp()

  const [reports,    setReports]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [userLat,    setUserLat]    = useState(null)
  const [userLng,    setUserLng]    = useState(null)
  const [locLoading, setLocLoading] = useState(false)
  const { showToast } = useApp()

  // Fetch all non-resolved reports on mount
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true)
      try {
        const res  = await fetch(`${API}/reports`)
        const data = await res.json()
        if (data.success) {
          setReports((data.data || []).filter(r => r.status !== 'Resolved'))
        }
      } catch {
        showToast('❌', 'Error', 'Could not load reports.')
      } finally { setLoading(false) }
    }
    fetchReports()
  }, [])

  const detectLocation = () => {
    setLocLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude)
        setUserLng(pos.coords.longitude)
        setLocLoading(false)
      },
      () => {
        showToast('⚠️', 'Location Denied', 'Allow location access to see nearby issues.')
        setLocLoading(false)
      }
    )
  }

  // When a report is verified, update it in local state immediately
  const handleVerified = (updatedReport) => {
    setReports(prev =>
      updatedReport.status === 'Resolved'
        ? prev.filter(r => r._id !== updatedReport._id)
        : prev.map(r => r._id === updatedReport._id ? updatedReport : r)
    )
  }

  // Sort reports by distance from user
  const sortedReports = userLat
    ? reports
        .map(r => ({
          ...r,
          distance: getDistanceInMeters(userLat, userLng, r.latitude, r.longitude)
        }))
        .sort((a, b) => a.distance - b.distance)
    : []

  return (
    <div style={{ background:'#f3f4f6', minHeight:'100vh' }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#1e3a5f 0%,#1e40af 100%)', padding:'28px 0 20px' }}>
        <div className="page-container">
          <h1 style={{ color:'#fff', fontSize:'1.6rem', marginBottom:4 }}>📍 Verify Issues Near You</h1>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.88rem', marginBottom:14 }}>
            Confirm reports in your area, or flag them as already fixed.
          </p>
          <button className="btn-accent" onClick={detectLocation} disabled={locLoading}>
            {locLoading ? '⏳ Detecting...' : userLat ? '📍 Refresh Location' : '📍 Detect My Location'}
          </button>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop:20, paddingBottom:48 }}>
        <div style={{ maxWidth:640, margin:'0 auto' }}>

          {/* Not logged in warning */}
          {!isLoggedIn && (
            <div style={{ padding:16, background:'#fef3c7', borderRadius:10, marginBottom:16,
                         fontSize:'0.85rem', color:'#92400e' }}>
              🔒 Please log in to verify issues.
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ padding:40, textAlign:'center', color:'#6b7280' }}>
              Loading reports...
            </div>
          )}

          {/* Prompt to detect location */}
          {!loading && !userLat && !locLoading && (
            <div style={{ padding:40, textAlign:'center', color:'#6b7280' }}>
              <p style={{ fontSize:'2rem', marginBottom:8 }}>📍</p>
              <p style={{ marginBottom:16 }}>
                Detect your location to see issues near you and start verifying.
              </p>
              <button className="btn-accent" onClick={detectLocation}>
                Detect My Location
              </button>
            </div>
          )}

          {/* No reports nearby */}
          {!loading && userLat && sortedReports.length === 0 && (
            <div style={{ padding:40, textAlign:'center', color:'#6b7280' }}>
              <p style={{ fontSize:'2rem', marginBottom:8 }}>✅</p>
              <p>No reports need verification right now in your area.</p>
            </div>
          )}

          {/* Report cards */}
          {!loading && userLat && sortedReports.map(r => (
            <VerifyCard
              key={r._id}
              report={r}
              distance={r.distance}
              myUserId={user?._id || user?.id}
              onVerified={handleVerified}
            />
          ))}
        </div>
      </div>
    </div>
  )
}