import { useApp } from '../context/AppContext'
import { CheckCircle, MapPin, Bell, BarChart2, Camera, Users } from 'lucide-react'
import StatusBadge from '../components/StatusBadge'

const features = [
  { icon: <MapPin size={22} />, title: 'Real Map Integration', desc: 'See every reported issue on an interactive map. Filter by status, type, or location to understand your city\'s road health.' },
  { icon: <Bell size={22} />, title: 'Live Notifications', desc: 'Get real-time updates when your report changes status. Never wonder if someone\'s acting on your complaint.' },
  { icon: <BarChart2 size={22} />, title: 'Progress Tracking', desc: 'Monitor every issue from report to resolution. Full timeline, government responses, and community upvotes.' },
  { icon: '🏛️', title: 'Government Direct', desc: 'Reports go directly to the relevant municipal authority. No middlemen — straight to the people who can fix it.' },
  { icon: <Camera size={22} />, title: 'Photo Evidence', desc: 'Attach photos and GPS coordinates to every report. Visual proof accelerates government response times.' },
  { icon: <Users size={22} />, title: 'Community Driven', desc: 'Upvote issues your neighbours report. More votes = higher priority. Collective voice drives faster action.' },
]

const floatCards = [
  { title: 'Pothole — MG Road', loc: 'Bangalore, KA', status: 'Pending', meta: '2 hours ago · High severity', fill: 30, fillColor: '#f59e0b' },
  { title: 'Road Construction', loc: 'NH-48, Delhi', status: 'In Progress', meta: '3 days ago · Medium severity', fill: 62, fillColor: '#3b82f6' },
  { title: 'Street Light Fixed', loc: 'Andheri, Mumbai', status: 'Resolved', meta: 'Fixed in 26 hours · Community ❤️', fill: 100, fillColor: '#10b981' },
]

export default function LandingPage({ onOpenAuth }) {
  const { navigate } = useApp()

  return (
    <div>
      {/* ── HERO ── */}
      <section className="hero-gradient min-h-screen flex items-center pt-16">
        <div className="max-w-6xl mx-auto px-5 py-16 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-white text-xs font-semibold mb-5">
                <span className="live-dot"></span>
                Live · 2,400+ Issues Tracked
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Fix <span className="text-accent">Our Roads.</span><br />Together.
              </h1>
              <p className="text-white/75 text-base mb-7 leading-relaxed max-w-md">
                Report potholes, construction zones, and road hazards in seconds. Track progress in real-time and hold authorities accountable until fixed.
              </p>
              <div className="flex gap-3 flex-wrap mb-9">
                <button className="btn-accent" onClick={() => navigate('report')}>📝 Report an Issue</button>
                <button className="btn-outline-white" onClick={() => navigate('map')}>🗺️ View Issue Map</button>
              </div>
              {/* Stats */}
              <div className="flex gap-7 flex-wrap">
                {[['2.4K', 'Issues Reported'], ['1.1K', 'Roads Fixed'], ['48h', 'Avg Response']].map(([val, lbl]) => (
                  <div key={lbl}>
                    <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {val.replace('K', '')}<span className="text-accent">{val.includes('K') ? 'K' : val.includes('h') ? 'h' : ''}</span>
                    </div>
                    <div className="text-xs text-white/60 mt-0.5">{lbl}</div>
                  </div>
                ))}
              </div>
              {/* Road dashes */}
              <div className="flex gap-2 mt-5 pt-5 border-t border-white/10">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="road-dash"></div>
                ))}
              </div>
            </div>

            {/* Right: Float Cards */}
            <div className="relative h-80 hidden md:block">
              {floatCards.map((c, i) => (
                <div key={i} className="float-card">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-sm">{c.title}</div>
                      <div className="text-xs text-white/60 mt-0.5">📍 {c.loc}</div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="text-xs text-white/50 mb-2">{c.meta}</div>
                  <div className="h-1.5 rounded bg-white/20 overflow-hidden">
                    <div className="h-full rounded" style={{ width: `${c.fill}%`, background: c.fillColor }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section-bg py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <div className="text-xs font-semibold text-accent uppercase tracking-widest mb-2">Why RoadWatch</div>
            <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Built for Citizens,<br />Trusted by Citizens</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="card p-6">
                <div className="feature-icon">{typeof f.icon === 'string' ? <span style={{ fontSize: '1.3rem' }}>{f.icon}</span> : f.icon}</div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section-white py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <div className="text-xs font-semibold text-accent uppercase tracking-widest mb-2">How It Works</div>
            <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Four Steps to Safer Roads</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
            <div className="hidden md:block absolute top-6 left-16 right-16 h-px bg-gray-200"></div>
            {[
              { n: '01', title: 'Spot the Issue', desc: 'See a pothole or road hazard on your commute.' },
              { n: '02', title: 'File a Report', desc: 'Snap a photo, drop a pin. Under 60 seconds.' },
              { n: '03', title: 'Notify Quickly', desc: 'Report Was issued quickly' },
              { n: '04', title: 'Road Gets Fixed', desc: 'Track progress and get notified when repaired.' },
            ].map((s, i) => (
              <div key={i} className="text-center relative z-10">
                <div className="step-circle">{s.n}</div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{s.title}</h4>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-5">
          <div className="cta-box">
            <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Your City. <span className="text-accent">Your Voice.</span>
            </h2>
            <p className="text-white/70 text-sm mb-7">Join 12,000+ citizens making their roads safer. It's free, fast, and hope it works.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button className="btn-accent" onClick={() => onOpenAuth('signup')}>Create Free Account</button>
              <button className="btn-outline-white" onClick={() => navigate('map')}>Explore Issue Map</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer-bg py-10">
        <div className="max-w-6xl mx-auto px-5 text-center">
          <div className="text-lg font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Road<span className="text-accent">Watch</span>
          </div>
          <p className="text-sm text-gray-400">Making Indian roads safer, one report at a time. © 2025 RoadWatch</p>
        </div>
      </footer>
    </div>
  )
}
