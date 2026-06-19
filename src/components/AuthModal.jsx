import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { X } from 'lucide-react'

export default function AuthModal({ mode, onClose, onSwitch }) {

  const { setIsLoggedIn, showToast } = useApp()

  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')   // ← shows error inside modal, not alert()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setError('') // clear error when user types
  }

  // ── LOGIN ─────────────────────────────────────────────────────
  const handleLogin = async () => {

    // Validate before hitting API
    if (!form.email || !form.password) {
      setError('Please enter both email and password')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('https://streetfix-backend-1j59.onrender.com/api/auth/login', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          email   : form.email,
          password: form.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      // Save token + user to localStorage
      if (data.token) {
        localStorage.setItem('sf-token', data.token)
        localStorage.setItem('sf-user', JSON.stringify(data.user))
      }

      setIsLoggedIn(true)
      onClose()
      showToast('✅', `Welcome back, ${data.user?.name || ''}!`, 'You are now signed in to StreetFix.')

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── SIGNUP ────────────────────────────────────────────────────
  const handleSignup = async () => {

    // Validate before hitting API
    if (!form.firstName || !form.email || !form.password) {
      setError('Please fill in First Name, Email, and Password')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    // ✅ KEY FIX: backend expects "name" not "firstName"+"lastName"
    // Your User model has: name: { type: String, required: true }
    const fullName = `${form.firstName} ${form.lastName}`.trim()

    try {
      const response = await fetch('https://streetfix-backend-1j59.onrender.com/api/auth/register', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          name    : fullName,      // ✅ matches backend User model field
          email   : form.email,
          password: form.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      // Save token + user to localStorage
      if (data.token) {
        localStorage.setItem('sf-token', data.token)
        localStorage.setItem('sf-user', JSON.stringify(data.user))
      }

      setIsLoggedIn(true)
      onClose()
      showToast('🎉', 'Account Created!', `Welcome to StreetFix, ${data.user?.name || ''}!`)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">

        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position:'absolute', top:14, right:16, background:'none', border:'none', cursor:'pointer', color:'#6b7280' }}
        >
          <X size={20} />
        </button>

        {/* Logo + Title */}
        <div style={{ textAlign:'center', marginBottom:22 }}>
          <div style={{ width:48, height:48, background:'#1e3a5f', borderRadius:10, display:'grid', placeItems:'center', margin:'0 auto 12px', fontSize:'1.4rem' }}>
            🛣️
          </div>
          <h2 style={{ fontSize:'1.5rem', marginBottom:4 }}>
            {mode === 'login' ? 'Welcome Back' : 'Join StreetFix'}
          </h2>
          <p style={{ fontSize:'0.88rem', color:'#6b7280' }}>
            {mode === 'login' ? 'Sign in to your account' : 'Help make your city safer'}
          </p>
        </div>

        {/* ── Error box — inside modal instead of browser alert() ── */}
        {error && (
          <div style={{
            background  : 'rgba(239,68,68,0.08)',
            border      : '1px solid rgba(239,68,68,0.25)',
            borderRadius: 8,
            padding     : '10px 14px',
            marginBottom: 14,
            fontSize    : '0.84rem',
            color       : '#ef4444',
            display     : 'flex',
            alignItems  : 'center',
            gap         : 8,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Form Fields ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* First + Last name — signup only */}
          {mode === 'signup' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div>
                <label className="form-label">First Name *</label>
                <input
                  className="form-input"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Rahul"
                />
              </div>
              <div>
                <label className="form-label">Last Name</label>
                <input
                  className="form-input"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Joshi"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="form-label">Email Address *</label>
            <input
              className="form-input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="rahul@email.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="form-label">Password *</label>
            <input
              className="form-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
            />
          </div>

          {/* Submit button */}
          <button
            className="btn-accent"
            style={{ width:'100%', justifyContent:'center', opacity: loading ? 0.75 : 1 }}
            onClick={mode === 'login' ? handleLogin : handleSignup}
            disabled={loading}
          >
            {loading
              ? '⏳ Please wait...'
              : mode === 'login' ? 'Sign In →' : 'Create Account →'
            }
          </button>
        </div>

        {/* Switch mode link */}
        <p style={{ textAlign:'center', marginTop:16, fontSize:'0.84rem', color:'#6b7280' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span
            style={{ color:'#ff6b35', cursor:'pointer', fontWeight:600 }}
            onClick={() => { onSwitch(mode === 'login' ? 'signup' : 'login'); setError('') }}
          >
            {mode === 'login' ? 'Create one free' : 'Sign in'}
          </span>
        </p>

      </div>
    </div>
  )
}