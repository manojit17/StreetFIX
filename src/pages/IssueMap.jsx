import { useState } from 'react'
import Badge from '../components/Badge'

const MARKERS = [
  { id:1, left:'38%', top:'35%', status:'Pending',     pin:'pin-pending',  icon:'🕳️', title:'Deep Pothole',        loc:'MG Road, City Centre' },
  { id:2, left:'57%', top:'28%', status:'In Progress', pin:'pin-progress', icon:'🚧', title:'Road Construction',    loc:'NH-48, North Zone' },
  { id:3, left:'26%', top:'62%', status:'Resolved',    pin:'pin-resolved', icon:'💡', title:'Street Light Fixed',   loc:'West Road, Sector 4' },
  { id:4, left:'66%', top:'54%', status:'Pending',     pin:'pin-pending',  icon:'💧', title:'Waterlogging',         loc:'Linking Road Junction' },
  { id:5, left:'18%', top:'44%', status:'In Progress', pin:'pin-progress', icon:'🛣️', title:'Bad Road Surface',     loc:'Old Highway West' },
  { id:6, left:'81%', top:'20%', status:'Resolved',    pin:'pin-resolved', icon:'⚠️', title:'Sign Missing',         loc:'Park Street North' },
  { id:7, left:'45%', top:'68%', status:'Pending',     pin:'pin-pending',  icon:'🕳️', title:'Pothole',              loc:'South Ring Road' },
  { id:8, left:'73%', top:'62%', status:'In Progress', pin:'pin-progress', icon:'🚧', title:'Road Digging',         loc:'Eastern Bypass' },
]

const FILTERS = ['All Issues', '🕳️ Potholes', '🚧 Construction', '💡 Street Lights', '💧 Waterlogging']
const STATUS_FILTERS = ['⏳ Pending', '🔧 In Progress', '✅ Resolved']

export default function IssueMap({ navigate }) {
  const [activeFilter, setActiveFilter] = useState('All Issues')
  const [popup, setPopup] = useState(null)

  const handleMarkerClick = (marker, e) => {
    e.stopPropagation()
    setPopup(marker)
  }

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>

      {/* Toolbar */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', padding: '10px 20px', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
        <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#6b7280', marginRight: 4 }}>Filter:</span>
        {FILTERS.map(f => (
          <button key={f} className={`filter-chip ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {STATUS_FILTERS.map(f => (
            <button key={f} className="filter-chip">{f}</button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }} onClick={() => setPopup(null)}>
        <div className="map-bg">
          {/* Road SVG */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="mgrid" width="70" height="70" patternUnits="userSpaceOnUse">
                <path d="M 70 0 L 0 0 0 70" fill="none" stroke="rgba(255,255,255,0.025)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mgrid)"/>
            {/* Main roads */}
            <line x1="0" y1="36%" x2="100%" y2="36%" stroke="rgba(255,107,53,0.25)" strokeWidth="12"/>
            <line x1="0" y1="64%" x2="100%" y2="64%" stroke="rgba(255,107,53,0.18)" strokeWidth="8"/>
            <line x1="22%" y1="0" x2="22%" y2="100%" stroke="rgba(255,107,53,0.2)" strokeWidth="10"/>
            <line x1="56%" y1="0" x2="56%" y2="100%" stroke="rgba(255,107,53,0.22)" strokeWidth="9"/>
            <line x1="80%" y1="0" x2="80%" y2="100%" stroke="rgba(255,107,53,0.14)" strokeWidth="7"/>
            {/* Dashed center lines */}
            <line x1="0" y1="36%" x2="100%" y2="36%" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="18,18"/>
            <line x1="56%" y1="0" x2="56%" y2="100%" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="18,18"/>
            {/* City blocks */}
            <rect x="24%" y="38%" width="30%" height="24%" fill="rgba(255,255,255,0.012)" rx="3"/>
            <rect x="58%" y="10%" width="20%" height="24%" fill="rgba(255,255,255,0.012)" rx="3"/>
            <rect x="2%" y="4%" width="18%" height="30%" fill="rgba(255,255,255,0.01)" rx="3"/>
            {/* Labels */}
            <text x="39%" y="52%" fill="rgba(255,255,255,0.12)" fontSize="11" textAnchor="middle" fontFamily="Inter,sans-serif">CITY CENTRE</text>
            <text x="68%" y="24%" fill="rgba(255,255,255,0.09)" fontSize="9" textAnchor="middle" fontFamily="Inter,sans-serif">NORTH ZONE</text>
            <text x="11%" y="22%" fill="rgba(255,255,255,0.09)" fontSize="9" textAnchor="middle" fontFamily="Inter,sans-serif">WEST ZONE</text>
          </svg>

          {/* Markers */}
          {MARKERS.map(m => (
            <div
              key={m.id}
              className={`map-marker ${m.pin}`}
              style={{ left: m.left, top: m.top }}
              onClick={(e) => handleMarkerClick(m, e)}
            >
              <div className="marker-pin">
                <span className="marker-icon">{m.icon}</span>
              </div>
            </div>
          ))}

          {/* Popup */}
          {popup && (
            <div
              className="map-popup"
              style={{ left: popup.left, top: `calc(${popup.top} - 160px)` }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setPopup(null)}
                style={{ position: 'absolute', top: 8, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '1rem', lineHeight: 1 }}
              >✕</button>
              <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '0.9rem', marginBottom: 3 }}>{popup.title}</div>
              <div style={{ fontSize: '0.76rem', color: '#6b7280', marginBottom: 10 }}>📍 {popup.loc}</div>
              <Badge status={popup.status} />
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>View Details</button>
                <button className="btn-outline btn-sm">👍 Upvote</button>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="map-legend">
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Legend</div>
            {[['#f59e0b','Pending'],['#3b82f6','In Progress'],['#10b981','Resolved']].map(([c,l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.8rem', marginBottom: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: c, flexShrink: 0 }} />
                {l}
              </div>
            ))}
          </div>

          {/* Stats overlay */}
          <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[['#f59e0b','142 Pending'],['#3b82f6','89 In Progress'],['#10b981','1,124 Resolved']].map(([c,l]) => (
              <div key={l} style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb', borderRadius: 20, padding: '5px 13px', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <span style={{ color: c, fontSize: '0.8rem' }}>●</span>{l}
              </div>
            ))}
          </div>

          {/* Report here button */}
          <button
            className="btn-accent"
            style={{ position: 'absolute', bottom: 16, right: 16, boxShadow: '0 6px 20px rgba(255,107,53,0.4)' }}
            onClick={() => navigate('report')}
          >
            + Report Issue Here
          </button>
        </div>
      </div>
    </div>
  )
}
