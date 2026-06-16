// ReportIssue.jsx — fully mobile responsive + connected to real backend
//
// NOTE: Your original handleSubmit had code copied from the Landing page
// (it referenced "tab", "form", "setLoading", "setError" which don't exist
// here). I replaced it with a real handleSubmit that sends this form's
// actual fields to your backend.

import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { MapPin } from 'lucide-react'

export default function ReportIssue({ navigate }) {
  const { showToast } = useApp()

  const [severity, setSeverity]   = useState('Medium')
  const [photos,   setPhotos]     = useState([])      // preview URLs only
  const [photoFiles, setPhotoFiles] = useState([])    // actual File objects to upload
  const [road,     setRoad]       = useState('')
  const [city,     setCity]       = useState('')
  const [detecting, setDetecting] = useState(false)

  // New form fields needed by the backend
  const [issueType,   setIssueType]   = useState('')
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [latitude,    setLatitude]    = useState(null)
  const [longitude,   setLongitude]   = useState(null)

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  // ── Detect GPS location using the browser's built-in geolocation ──
  const detectLocation = () => {
    setDetecting(true)
    setRoad('Detecting...')

    if (!navigator.geolocation) {
      setRoad('')
      setDetecting(false)
      showToast('⚠️', 'Not Supported', 'Your browser does not support location detection.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude)
        setLongitude(pos.coords.longitude)
        setRoad('Detected Location')
        setCity('')
        setDetecting(false)
        showToast('📍', 'Location Detected', 'GPS coordinates captured successfully.')
      },
      () => {
        setRoad('')
        setDetecting(false)
        showToast('⚠️', 'Permission Denied', 'Please allow location access and try again.')
      }
    )
  }

  // ── Handle photo file selection ──
  const handleFiles = (e) => {
    const files = Array.from(e.target.files).slice(0, 5)
    const urls  = files.map(f => URL.createObjectURL(f))
    setPhotos(urls)
    setPhotoFiles(files)
  }

  // ── Submit the report to the real backend ──
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!issueType)           { setError('Please select an issue type.');        return }
    if (!title)                { setError('Please enter an issue title.');        return }
    if (!description || description.length < 10) {
                                  setError('Description must be at least 10 characters.'); return }
    if (!latitude || !longitude) { setError('Please detect your location first.'); return }

    setLoading(true)

    try {
      const token = localStorage.getItem('streetfix_token')
      if (!token) {
        setError('Please login first to submit a report.')
        setLoading(false)
        return
      }

      // FormData because we may include an image file
      const formData = new FormData()
      formData.append('title',       title)
      formData.append('description', description)
      formData.append('type',        issueType)
      formData.append('severity',    severity.toLowerCase())
      formData.append('latitude',    latitude)
      formData.append('longitude',   longitude)
      if (photoFiles[0]) {
        formData.append('image', photoFiles[0]) // backend accepts one image per report
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/reports`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        // Do NOT set Content-Type — the browser sets the correct
        // multipart boundary automatically for FormData
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to submit report')

      showToast('✅', 'Report Submitted!', 'Your issue has been sent to the authority.')
      navigate('dashboard')

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const sevOptions = [
    { label: 'Low', icon: '🟢' },
    { label: 'Medium', icon: '🟡' },
    { label: 'High', icon: '🔴' },
    { label: 'Critical', icon: '🚨' },
  ]

  return (
    // page-container handles responsive side padding; maxWidth caps it on desktop
    <div className="page-container" style={{ maxWidth: 720, paddingTop: 32, paddingBottom: 60 }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 1.9rem)', marginBottom: 5 }}>📝 Report an Issue</h1>
        <p style={{ color: '#6b7280', fontSize: '0.88rem' }}>
          Help improve your city's roads. Every report goes directly to the relevant authority.
        </p>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{ background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626',
                      borderRadius:8, padding:'10px 14px', fontSize:'0.84rem', marginBottom:16 }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Issue Details ── */}
        <div className="card-static" style={{ padding: 22 }}>
          <SectionTitle>Issue Details</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="form-label">Issue Type *</label>
              <select
                className="form-input"
                style={{ cursor: 'pointer' }}
                value={issueType}
                onChange={e => setIssueType(e.target.value)}
              >
                <option value="" disabled>Select issue type</option>
                <option value="pothole">🕳️ Pothole</option>
                <option value="road_damage">🚧 Road Construction</option>
                <option value="streetlight">💡 Street Light</option>
                <option value="waterlogging">💧 Waterlogging</option>
                <option value="debris">🛣️ Bad Road Surface</option>
                <option value="missing_signage">⚠️ Missing Road Sign</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Issue Title *</label>
              <input
                className="form-input"
                placeholder="e.g. Large pothole causing traffic near main junction"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                placeholder="Describe the issue — what you saw, how long it's been there, any safety risks..."
                style={{ resize: 'vertical', minHeight: 100 }}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Severity — wraps on very small screens via CSS ── */}
        <div className="card-static" style={{ padding: 22 }}>
          <SectionTitle>Severity Level</SectionTitle>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {sevOptions.map(s => (
              <button
                key={s.label}
                className={`sev-opt ${severity === s.label ? 'selected' : ''}`}
                style={{ minWidth: 70 }}
                onClick={() => setSeverity(s.label)}
                type="button"
              >
                <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: 4 }}>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Location ── */}
        <div className="card-static" style={{ padding: 22 }}>
          <SectionTitle>Location</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Detect button — stacks nicely on mobile since it's already flex+wrap friendly */}
            <div
              onClick={detectLocation}
              style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '13px 16px',
                       display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flexWrap: 'wrap' }}
            >
              <MapPin size={20} color="#1e3a5f" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Detect My Location</div>
                <div style={{ fontSize: '0.76rem', color: '#6b7280' }}>Automatically pin your current GPS coordinates</div>
              </div>
              <button className="btn-outline btn-sm" style={{ pointerEvents: 'none' }} type="button">
                {detecting ? '...' : 'Detect'}
              </button>
            </div>

            {latitude && longitude && (
              <p style={{ fontSize: '0.78rem', color: '#1e3a5f', fontWeight: 600 }}>
                📍 Pinned: {latitude.toFixed(5)}, {longitude.toFixed(5)}
              </p>
            )}

            {/* form-row-2 class collapses to 1 column below 640px */}
            <div className="form-row-2">
              <div>
                <label className="form-label">Road / Street</label>
                <input className="form-input" placeholder="e.g. MG Road" value={road} onChange={e => setRoad(e.target.value)} />
              </div>
              <div>
                <label className="form-label">City</label>
                <input className="form-input" placeholder="e.g. Bangalore" value={city} onChange={e => setCity(e.target.value)} />
              </div>
            </div>

            <div className="form-row-2">
              <div>
                <label className="form-label">State</label>
                <select className="form-input" style={{ cursor: 'pointer' }}>
                  <option>Karnataka</option>
                  <option>Maharashtra</option>
                  <option>Delhi</option>
                  <option>Tamil Nadu</option>
                  <option>Telangana</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="form-label">PIN Code</label>
                <input className="form-input" placeholder="560001" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Photo Evidence ── */}
        <div className="card-static" style={{ padding: 22 }}>
          <SectionTitle>Photo Evidence</SectionTitle>
          <div className="upload-area" onClick={() => document.getElementById('file-input').click()}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>📸</div>
            <h4 style={{ fontSize: '0.92rem', marginBottom: 4 }}>Upload Photos</h4>
            <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              Tap to select · JPG, PNG up to 10MB · Max 5 photos
            </p>
            <input type="file" id="file-input" style={{ display: 'none' }} multiple accept="image/*" onChange={handleFiles} />
          </div>
          {photos.length > 0 && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              {photos.map((url, i) => (
                <div key={i} style={{ width: 72, height: 72, borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb', flexShrink: 0 }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Contact ── */}
        <div className="card-static" style={{ padding: 22 }}>
          <SectionTitle>Contact (Optional)</SectionTitle>
          <div className="form-row-2" style={{ marginBottom: 12 }}>
            <div>
              <label className="form-label">Your Name</label>
              <input className="form-input" placeholder="Rahul Joshi" />
            </div>
            <div>
              <label className="form-label">Phone Number</label>
              <input className="form-input" placeholder="+91 98765 43210" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.86rem', color: '#6b7280' }}>
            <input type="checkbox" id="notify-cb" defaultChecked style={{ accentColor: '#1e3a5f', width: 15, height: 15, flexShrink: 0 }} />
            <label htmlFor="notify-cb">Notify me via email when status changes</label>
          </div>
        </div>

        {/* ── Submit Row — buttons stack full-width on very small screens via CSS ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 4, flexWrap: 'wrap' }}>
          <button className="btn-outline" onClick={() => navigate('home')} type="button">Cancel</button>
          <button className="btn-accent" onClick={handleSubmit} disabled={loading} type="button">
            {loading ? 'Submitting...' : 'Submit Report →'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <span style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '0.92rem', color: '#111827', whiteSpace: 'nowrap' }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
    </div>
  )
}
