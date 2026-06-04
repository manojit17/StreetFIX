import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { X } from 'lucide-react'

export default function AuthModal({ mode, onClose, onSwitch }) {
  const { setIsLoggedIn, showToast } = useApp()
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' })

  const handleLogin = () => {
    onClose()
    setIsLoggedIn(true)
    showToast('✅', 'Welcome back, Rahul!', 'You are now signed in to StreetFix.')
  }
  const handleSignup = () => {
    onClose()
    setIsLoggedIn(true)
    showToast('🎉', 'Account Created!', 'Welcome to StreetFix. Start reporting issues!')
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button onClick={onClose} style={{ position:'absolute', top:14, right:16, background:'none', border:'none', cursor:'pointer', color:'#6b7280' }}>
          <X size={20} />
        </button>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:22 }}>
          <div style={{ width:48, height:48, background:'#1e3a5f', borderRadius:10, display:'grid', placeItems:'center', margin:'0 auto 12px', fontSize:'1.4rem' }}>🛣️</div>
          <h2 style={{ fontSize:'1.5rem', marginBottom:4 }}>{mode === 'login' ? 'Welcome Back' : 'Join StreetFix'}</h2>
          <p style={{ fontSize:'0.88rem', color:'#6b7280' }}>{mode === 'login' ? 'Sign in to your account' : 'Help make your city safer'}</p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {mode === 'signup' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div><label className="form-label">First Name</label><input className="form-input" placeholder="Rahul" /></div>
              <div><label className="form-label">Last Name</label><input className="form-input" placeholder="Joshi" /></div>
            </div>
          )}
          <div><label className="form-label">Email Address</label><input className="form-input" type="email" placeholder="rahul@email.com" /></div>
          <div><label className="form-label">Password</label><input className="form-input" type="password" placeholder="••••••••" /></div>
          <button className="btn-primary" style={{ width:'100%', justifyContent:'center' }} onClick={mode === 'login' ? handleLogin : handleSignup}>
            {mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </div>
        <p style={{ textAlign:'center', marginTop:16, fontSize:'0.84rem', color:'#6b7280' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span style={{ color:'#ff6b35', cursor:'pointer', fontWeight:600 }} onClick={() => onSwitch(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Create one free' : 'Sign in'}
          </span>
        </p>
      </div>
    </div>
  )
}
