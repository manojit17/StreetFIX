import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { MapPin } from 'lucide-react'

export default function ReportIssue({ navigate }) {
  const { showToast } = useApp()
  const [severity, setSeverity] = useState('Medium')
  const [photos, setPhotos] = useState([])
  const [road, setRoad] = useState('')
  const [city, setCity] = useState('')
  const [detecting, setDetecting] = useState(false)

  const detectLocation = () => {
    setDetecting(true)
    setRoad('Detecting...')
    setTimeout(() => {
      setRoad('MG Road, Sector 4')
      setCity('Bangalore')
      setDetecting(false)
      showToast('📍', 'Location Detected', 'GPS coordinates captured successfully.')
    }, 1200)
  }

  const handleFiles = (e) => {
    const files = Array.from(e.target.files).slice(0, 5)
    const urls = files.map(f => URL.createObjectURL(f))
    setPhotos(urls)
  }

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    // Pick the correct endpoint based on login or signup tab
    const endpoint = tab === "login" ? "auth/login" : "auth/register";

    const response = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        tab === "login"
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, password: form.password }
      ),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    // Save the token to localStorage so we can use it later
    localStorage.setItem("streetfix_token", data.token);
    localStorage.setItem("streetfix_user", JSON.stringify(data.user));

    navigate("/");
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
  const sevOptions = [
    { label: 'Low', icon: '🟢' },
    { label: 'Medium', icon: '🟡' },
    { label: 'High', icon: '🔴' },
    { label: 'Critical', icon: '🚨' },
  ]

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 60px' }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.9rem', marginBottom: 5 }}>📝 Report an Issue</h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
          Help improve your city's roads. Every report goes directly to the relevant authority.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* ── Issue Details ── */}
        <div className="card-static" style={{ padding: 24 }}>
          <SectionTitle>Issue Details</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="form-label">Issue Type *</label>
              <select className="form-input" style={{ cursor: 'pointer' }}>
                <option value="" disabled>Select issue type</option>
                <option>🕳️ Pothole</option>
                <option>🚧 Road Construction</option>
                <option>💡 Street Light</option>
                <option>💧 Waterlogging</option>
                <option>🛣️ Bad Road Surface</option>
                <option>⚠️ Missing Road Sign</option>
                <option>🌳 Tree Fallen on Road</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Issue Title *</label>
              <input className="form-input" placeholder="e.g. Large pothole causing traffic near main junction" />
            </div>
            <div>
              <label className="form-label">Description</label>
              <textarea className="form-input" placeholder="Describe the issue — what you saw, how long it's been there, any safety risks..." style={{ resize: 'vertical', minHeight: 100 }} />
            </div>
          </div>
        </div>

        {/* ── Severity ── */}
        <div className="card-static" style={{ padding: 24 }}>
          <SectionTitle>Severity Level</SectionTitle>
          <div style={{ display: 'flex', gap: 10 }}>
            {sevOptions.map(s => (
              <button
                key={s.label}
                className={`sev-opt ${severity === s.label ? 'selected' : ''}`}
                onClick={() => setSeverity(s.label)}
              >
                <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: 4 }}>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Location ── */}
        <div className="card-static" style={{ padding: 24 }}>
          <SectionTitle>Location</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Detect button */}
            <div
              onClick={detectLocation}
              style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#1e3a5f'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
            >
              <MapPin size={20} color="#1e3a5f" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Detect My Location</div>
                <div style={{ fontSize: '0.76rem', color: '#6b7280' }}>Automatically pin your current GPS coordinates</div>
              </div>
              <button className="btn-outline btn-sm" style={{ pointerEvents: 'none' }}>
                {detecting ? '...' : 'Detect'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="form-label">Road / Street *</label>
                <input className="form-input" placeholder="e.g. MG Road" value={road} onChange={e => setRoad(e.target.value)} />
              </div>
              <div>
                <label className="form-label">City *</label>
                <input className="form-input" placeholder="e.g. Bangalore" value={city} onChange={e => setCity(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
        <div className="card-static" style={{ padding: 24 }}>
          <SectionTitle>Photo Evidence</SectionTitle>
          <div className="upload-area" onClick={() => document.getElementById('file-input').click()}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>📸</div>
            <h4 style={{ fontSize: '0.92rem', marginBottom: 4 }}>Upload Photos</h4>
            <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              Drag & drop or click to select · JPG, PNG up to 10MB · Max 5 photos
            </p>
            <input type="file" id="file-input" style={{ display: 'none' }} multiple accept="image/*" onChange={handleFiles} />
          </div>
          {photos.length > 0 && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              {photos.map((url, i) => (
                <div key={i} style={{ width: 76, height: 76, borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb', flexShrink: 0 }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Contact ── */}
        <div className="card-static" style={{ padding: 24 }}>
          <SectionTitle>Contact (Optional)</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
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
            <input type="checkbox" id="notify-cb" defaultChecked style={{ accentColor: '#1e3a5f', width: 15, height: 15 }} />
            <label htmlFor="notify-cb">Notify me via email when status changes</label>
          </div>
        </div>

        {/* ── Submit Row ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 4 }}>
          <button className="btn-outline" onClick={() => navigate('home')}>Cancel</button>
          <button className="btn-accent" onClick={handleSubmit}>Submit Report →</button>
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
