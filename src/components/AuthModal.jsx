import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { X } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL

export default function AuthModal({ mode, onClose, onSwitch }) {

  const { saveAuth, showToast } = useApp()

  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError('Please enter both email and password'); return }
    setLoading(true); setError('')
    try {
      const res  = await fetch(`${API_URL}/auth/login`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')

      // ── Admin-only gate ──────────────────────────────────
      // If someone opened the Admin login form but their account
      // isn't actually role:'admin', block them right here.
      if (mode === 'admin' && data.user?.role !== 'admin') {
        setError('This account does not have admin access.')
        setLoading(false)
        return
      }

      saveAuth(data.token, data.user)
      onClose()
      showToast('✅', `Welcome back, ${data.user?.name || ''}!`, 'You are now signed in.')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const handleSignup = async () => {
    if (!form.firstName || !form.email || !form.password) { setError('First Name, Email and Password are required'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    const fullName = `${form.firstName} ${form.lastName}`.trim()
    try {
      const res  = await fetch(`${API_URL}/auth/register`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ name: fullName, email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed')
      saveAuth(data.token, data.user)
      onClose()
      showToast('🎉', 'Account Created!', `Welcome to StreetFix, ${data.user?.name || ''}!`)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  // ── Chooser screen ─────────────────────────────────────────
  if (mode === 'choose') {
    return (
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal-box">
          <button onClick={onClose} style={{position:'absolute',top:14,right:16,background:'none',border:'none',cursor:'pointer',color:'#6b7280'}}><X size={20}/></button>
          <div style={{textAlign:'center',marginBottom:22}}>
            <div style={{width:48,height:48,background:'#1e3a5f',borderRadius:10,display:'grid',placeItems:'center',margin:'0 auto 12px',fontSize:'1.4rem'}}>🛣️</div>
            <h2 style={{fontSize:'1.5rem',marginBottom:4}}>Continue as</h2>
            <p style={{fontSize:'0.88rem',color:'#6b7280'}}>Choose how you'd like to sign in</p>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            <button className="btn-accent" style={{width:'100%',justifyContent:'center'}} onClick={() => onSwitch('signup')}>
              👤 I'm a User
            </button>
            <button className="btn-outline" style={{width:'100%',justifyContent:'center'}} onClick={() => onSwitch('admin')}>
              🔐 I'm an Admin
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button onClick={onClose} style={{position:'absolute',top:14,right:16,background:'none',border:'none',cursor:'pointer',color:'#6b7280'}}><X size={20}/></button>
        <div style={{textAlign:'center',marginBottom:22}}>
          <div style={{width:48,height:48,background:'#1e3a5f',borderRadius:10,display:'grid',placeItems:'center',margin:'0 auto 12px',fontSize:'1.4rem'}}>
            {mode === 'admin' ? '🔐' : '🛣️'}
          </div>
          <h2 style={{fontSize:'1.5rem',marginBottom:4}}>
            {mode === 'admin' ? 'Admin Sign In' : mode === 'login' ? 'Welcome Back' : 'Join StreetFix'}
          </h2>
          <p style={{fontSize:'0.88rem',color:'#6b7280'}}>
            {mode === 'admin' ? 'Restricted access' : mode === 'login' ? 'Sign in to your account' : 'Help make your city safer'}
          </p>
        </div>
        {error && (
          <div style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:8,padding:'10px 14px',marginBottom:14,fontSize:'0.84rem',color:'#ef4444',display:'flex',alignItems:'center',gap:8}}>
            ⚠️ {error}
          </div>
        )}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {mode==='signup' && (
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div><label className="form-label">First Name *</label><input className="form-input" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Manojit"/></div>
              <div><label className="form-label">Last Name</label><input className="form-input" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Raul"/></div>
            </div>
          )}
          <div><label className="form-label">Email Address *</label><input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="raul@email.com"/></div>
          <div><label className="form-label">Password *</label><input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters"/></div>
          <button className="btn-accent" style={{width:'100%',justifyContent:'center',opacity:loading?0.75:1}} onClick={mode==='signup' ? handleSignup : handleLogin} disabled={loading}>
            {loading ? '⏳ Please wait...' : mode==='signup' ? 'Create Account →' : 'Sign In →'}
          </button>
        </div>
        {mode !== 'admin' && (
          <p style={{textAlign:'center',marginTop:16,fontSize:'0.84rem',color:'#6b7280'}}>
            {mode==='login' ? "Don't have an account? " : 'Already have an account? '}
            <span style={{color:'#ff6b35',cursor:'pointer',fontWeight:600}} onClick={()=>{onSwitch(mode==='login'?'signup':'login');setError('')}}>
              {mode==='login'?'Create one free':'Sign in'}
            </span>
          </p>
        )}
      </div>
    </div>
  )
}