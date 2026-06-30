// src/pages/Profile.jsx
import { useState, useEffect } from 'react'
import { User, Lock, FileText, Edit3, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { updateProfile, changePassword, getMyReports } from '../api/profileService'
import EditReportModal    from '../components/EditReportModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import SupportButton from '../components/SupportButton'
const SEV_COLORS = {
  Low     : { bg:'rgba(16,185,129,0.1)',  color:'#065f46' },
  Medium  : { bg:'rgba(245,158,11,0.1)',  color:'#92400e' },
  High    : { bg:'rgba(239,68,68,0.1)',   color:'#991b1b' },
  Critical: { bg:'rgba(127,0,0,0.12)',    color:'#7f0000' },
}
const STATUS_COLORS = {
  'Pending'    : { bg:'rgba(245,158,11,0.12)',  color:'#92400e', dot:'#f59e0b' },
  'In Progress': { bg:'rgba(59,130,246,0.12)',  color:'#1e40af', dot:'#3b82f6' },
  'Resolved'   : { bg:'rgba(16,185,129,0.12)', color:'#065f46', dot:'#10b981' },
}

function SectionTitle({ icon, children, noLine }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom: noLine ? 0 : 16 }}>
      <span style={{ color:'#1e3a5f' }}>{icon}</span>
      <span style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'0.95rem' }}>
        {children}
      </span>
      {!noLine && <div style={{ flex:1, height:1, background:'#e5e7eb' }}/>}
    </div>
  )
}
function ErrorBox({ msg }) {
  return (
    <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.3)',
                  borderRadius:8, padding:'10px 14px', marginBottom:14,
                  fontSize:'0.84rem', color:'#ef4444', display:'flex', alignItems:'center', gap:8 }}>
      ⚠️ {msg}
    </div>
  )
}
function SuccessBox({ msg }) {
  return (
    <div style={{ background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.3)',
                  borderRadius:8, padding:'10px 14px', marginBottom:14,
                  fontSize:'0.84rem', color:'#065f46', display:'flex', alignItems:'center', gap:8 }}>
      ✅ {msg}
    </div>
  )
}

export default function Profile({ navigate }) {
  const { user, saveAuth, clearAuth, showToast } = useApp()

  // Profile edit
  const [profileForm,    setProfileForm]    = useState({ name: user?.name || '', email: user?.email || '' })
  const [avatarFile,     setAvatarFile]     = useState(null)
  const [avatarPreview,  setAvatarPreview]  = useState(user?.avatar || '')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError,   setProfileError]   = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  // Password
  const [passForm,    setPassForm]    = useState({ currentPassword:'', newPassword:'', confirmPassword:'' })
  const [passLoading, setPassLoading] = useState(false)
  const [passError,   setPassError]   = useState('')
  const [passSuccess, setPassSuccess] = useState('')
  const [showPass,    setShowPass]    = useState(false)

  // Reports
  const [reports,        setReports]        = useState([])
  const [reportsLoading, setReportsLoading] = useState(true)
  const [reportsError,   setReportsError]   = useState('')
  const [editingReport,  setEditingReport]  = useState(null)
  const [deletingReport, setDeletingReport] = useState(null)

  // Tab
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setReportsLoading(true)
        const data = await getMyReports()
        setReports(data.data || [])
      } catch (err) {
        setReportsError(err.message)
      } finally {
        setReportsLoading(false)
      }
    }
    fetchReports()
  }, [])

  // Sync state if user loads later
  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name, email: user.email })
      setAvatarPreview(user.avatar || '')
    }
  }, [user])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
      setProfileError('')
      setProfileSuccess('')
    }
  }

  const handleProfileSave = async () => {
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setProfileError('Name and email are required'); return
    }
    setProfileLoading(true); setProfileError(''); setProfileSuccess('')
    try {
      const formData = new FormData()
      formData.append('name', profileForm.name)
      formData.append('email', profileForm.email)
      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }

      const data = await updateProfile(formData)
      const updatedUser = { 
        ...user, 
        name: data.user.name, 
        email: data.user.email, 
        avatar: data.user.avatar 
      }
      localStorage.setItem('sf-user', JSON.stringify(updatedUser))
      saveAuth(localStorage.getItem('sf-token'), updatedUser)
      setProfileSuccess('Profile updated successfully!')
      setAvatarFile(null)
      showToast('✅', 'Profile Updated', 'Your profile details and photo have been saved.')
    } catch (err) {
      setProfileError(err.message)
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!passForm.currentPassword || !passForm.newPassword || !passForm.confirmPassword) {
      setPassError('All fields are required'); return
    }
    if (passForm.newPassword.length < 6) { setPassError('New password must be at least 6 characters'); return }
    if (passForm.newPassword !== passForm.confirmPassword) { setPassError('New passwords do not match'); return }
    setPassLoading(true); setPassError(''); setPassSuccess('')
    try {
      await changePassword(passForm.currentPassword, passForm.newPassword)
      setPassSuccess('Password changed successfully!')
      setPassForm({ currentPassword:'', newPassword:'', confirmPassword:'' })
      showToast('🔒', 'Password Changed', 'Your password has been updated.')
    } catch (err) {
      setPassError(err.message)
    } finally {
      setPassLoading(false)
    }
  }

  const handleReportUpdated = (updatedReport) => {
    setReports(prev => prev.map(r => r._id === updatedReport._id ? updatedReport : r))
    showToast('✅', 'Report Updated', 'Your changes are now live everywhere.')
  }

  const handleReportDeleted = (deletedId) => {
    setReports(prev => prev.filter(r => r._id !== deletedId))
    showToast('🗑️', 'Report Deleted', 'The report has been permanently removed.')
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div style={{ maxWidth:800, margin:'0 auto', padding:'36px 20px 60px' }}>

      {/* Back button */}
      <button onClick={() => navigate('home')}
        style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280',
                 fontSize:'0.86rem', marginBottom:12, display:'flex', alignItems:'center',
                 gap:6, padding:0, fontFamily:'Inter,sans-serif' }}>
        ← Back to Overview
      </button>

      <h1 style={{ fontFamily:'Poppins,sans-serif', fontSize:'1.8rem', marginBottom:4 }}>My Profile</h1>
      <p style={{ color:'#6b7280', fontSize:'0.9rem', marginBottom:24 }}>
        Manage your account details and your road reports
      </p>

      {/* Avatar card */}
      <div className="card-static" style={{ padding:24, marginBottom:20, display:'flex', alignItems:'center', gap:20 }}>
        <div style={{ width:72, height:72, borderRadius:'50%', overflow:'hidden',
                      background:'#1e3a5f', border:'2px solid #1e3a5f', display:'grid', 
                      placeItems:'center', flexShrink:0 }}>
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
          ) : (
            <div style={{ fontSize:'1.5rem', fontWeight:700, color:'white', fontFamily:'Poppins,sans-serif' }}>
              {initials}
            </div>
          )}
        </div>
        <div>
          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'1.2rem', marginBottom:2 }}>
            {user?.name || 'User'}
          </div>
          <div style={{ fontSize:'0.88rem', color:'#6b7280' }}>{user?.email}</div>
          <div style={{ marginTop:8, display:'flex', gap:16 }}>
            <span style={{ fontSize:'0.8rem', color:'#9ca3af' }}>
              📋 {reports.length} report{reports.length !== 1 ? 's' : ''} submitted
            </span>
            <span style={{ fontSize:'0.8rem', color:'#10b981', fontWeight:600 }}>
              ✅ {reports.filter(r => r.status === 'Resolved').length} resolved
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom:24 }}>
        <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}>
          <User size={14} style={{ display:'inline', marginRight:6 }}/>
          Account Settings
        </button>
        <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}>
          <FileText size={14} style={{ display:'inline', marginRight:6 }}/>
          My Reports ({reports.length})
        </button>
      </div>

      {/* ── ACCOUNT SETTINGS TAB ── */}
      {activeTab === 'profile' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Edit name + email */}
          <div className="card-static" style={{ padding:24 }}>
            <SectionTitle icon={<User size={16}/>}>Personal Information</SectionTitle>
            {profileError   && <ErrorBox   msg={profileError}   />}
            {profileSuccess && <SuccessBox msg={profileSuccess} />}

            {/* Profile Photo Upload Field */}
            <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:18 }}>
              <div style={{ width:60, height:60, borderRadius:'50%', overflow:'hidden',
                            background:'#f3f4f6', border:'1px solid #e5e7eb',
                            display:'grid', placeItems:'center', flexShrink:0 }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                ) : (
                  <div style={{ fontSize:'1.2rem', fontWeight:700, color:'#1e3a5f', fontFamily:'Poppins,sans-serif' }}>
                    {initials}
                  </div>
                )}
              </div>
              <label htmlFor="profile-avatar-input" className="btn-outline" style={{ cursor:'pointer', padding:'8px 14px', fontSize:'0.82rem' }}>
                Change Photo
              </label>
              <input
                type="file"
                accept="image/*"
                id="profile-avatar-input"
                onChange={handleAvatarChange}
                style={{ display:'none' }}
              />
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label className="form-label">Full Name</label>
                <input className="form-input" value={profileForm.name}
                  onChange={e => { setProfileForm(p => ({ ...p, name: e.target.value })); setProfileError(''); setProfileSuccess('') }}
                  placeholder="Your full name" />
              </div>
              <div>
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" value={profileForm.email}
                  onChange={e => { setProfileForm(p => ({ ...p, email: e.target.value })); setProfileError(''); setProfileSuccess('') }}
                  placeholder="your@email.com" />
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button className="btn-primary" onClick={handleProfileSave}
                  disabled={profileLoading} style={{ opacity: profileLoading ? 0.75 : 1 }}>
                  {profileLoading ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </div>
          </div>

          {/* Change password */}
          <div className="card-static" style={{ padding:24 }}>
            <button onClick={() => setShowPass(p => !p)}
              style={{ width:'100%', background:'none', border:'none', cursor:'pointer',
                       display:'flex', alignItems:'center', justifyContent:'space-between', padding:0 }}>
              <SectionTitle icon={<Lock size={16}/>} noLine>Change Password</SectionTitle>
              {showPass ? <ChevronUp size={18} color="#6b7280"/> : <ChevronDown size={18} color="#6b7280"/>}
            </button>
            {showPass && (
              <div style={{ marginTop:16 }}>
                <div style={{ height:1, background:'#e5e7eb', marginBottom:16 }}/>
                {passError   && <ErrorBox   msg={passError}   />}
                {passSuccess && <SuccessBox msg={passSuccess} />}
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <div>
                    <label className="form-label">Current Password</label>
                    <input className="form-input" type="password" placeholder="Enter current password"
                      value={passForm.currentPassword}
                      onChange={e => { setPassForm(p => ({ ...p, currentPassword: e.target.value })); setPassError(''); setPassSuccess('') }} />
                  </div>
                  <div>
                    <label className="form-label">New Password</label>
                    <input className="form-input" type="password" placeholder="Min 6 characters"
                      value={passForm.newPassword}
                      onChange={e => { setPassForm(p => ({ ...p, newPassword: e.target.value })); setPassError(''); setPassSuccess('') }} />
                  </div>
                  <div>
                    <label className="form-label">Confirm New Password</label>
                    <input className="form-input" type="password" placeholder="Repeat new password"
                      value={passForm.confirmPassword}
                      onChange={e => { setPassForm(p => ({ ...p, confirmPassword: e.target.value })); setPassError(''); setPassSuccess('') }} />
                  </div>
                  <div style={{ display:'flex', justifyContent:'flex-end' }}>
                    <button className="btn-primary" onClick={handlePasswordChange}
                      disabled={passLoading} style={{ opacity: passLoading ? 0.75 : 1 }}>
                      {passLoading ? '⏳ Updating...' : '🔒 Update Password'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div className="card-static" style={{ padding:24, border:'1px solid rgba(239,68,68,0.2)' }}>
            <SectionTitle icon={<span>⚠️</span>}>Danger Zone</SectionTitle>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
              <div>
                <div style={{ fontSize:'0.9rem', fontWeight:600, marginBottom:2 }}>Sign out of StreetFix</div>
                <div style={{ fontSize:'0.82rem', color:'#6b7280' }}>You will need to login again to access your account</div>
              </div>
              <button className="btn-danger" style={{ padding:'9px 18px', fontSize:'0.88rem' }}
                onClick={() => { clearAuth(); navigate('landing'); showToast('👋', 'Signed Out', 'You have been logged out.') }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MY REPORTS TAB ── */}
      {activeTab === 'reports' && (
        <div>
          {reportsLoading && (
            <div style={{ textAlign:'center', padding:48, color:'#6b7280' }}>
              <div style={{ fontSize:'2rem', marginBottom:12 }}>⏳</div>
              <p>Loading your reports...</p>
            </div>
          )}
          {reportsError && !reportsLoading && <ErrorBox msg={reportsError} />}

          {!reportsLoading && !reportsError && reports.length === 0 && (
            <div style={{ textAlign:'center', padding:56 }}>
              <div style={{ fontSize:'3rem', marginBottom:14 }}>📋</div>
              <h3 style={{ fontFamily:'Poppins,sans-serif', marginBottom:8 }}>No reports yet</h3>
              <p style={{ color:'#6b7280', fontSize:'0.9rem', marginBottom:20 }}>
                You haven't submitted any road issue reports yet.
              </p>
              <button className="btn-accent" onClick={() => navigate('report')}>
                📝 Report Your First Issue
              </button>
            </div>
          )}

          {!reportsLoading && reports.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {reports.map(report => {
                const statusStyle = STATUS_COLORS[report.status] || STATUS_COLORS['Pending']
                const sevStyle    = SEV_COLORS[report.severity]  || SEV_COLORS['Medium']
                const date = new Date(report.createdAt).toLocaleDateString('en-IN', {
                  day:'numeric', month:'short', year:'numeric'
                })
                return (
                  <div key={report._id} className="card-static" style={{ padding:20 }}>
                    <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>

                      {/* Thumbnail */}
                      <div style={{ width:60, height:60, borderRadius:10, overflow:'hidden',
                                    flexShrink:0, background:'#f3f4f6', display:'grid',
                                    placeItems:'center', fontSize:'1.4rem', border:'1px solid #e5e7eb' }}>
                        {report.image
                          ? <img src={report.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                          : '🛣️'
                        }
                      </div>

                      {/* Info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
                                      gap:8, flexWrap:'wrap', marginBottom:6 }}>
                          <h4 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.95rem', fontWeight:700,
                                       margin:0, whiteSpace:'nowrap', overflow:'hidden',
                                       textOverflow:'ellipsis', maxWidth:300 }}>
                            {report.title}
                          </h4>
                          <span style={{ background: statusStyle.bg, color: statusStyle.color,
                                         padding:'3px 10px', borderRadius:20, fontSize:'0.72rem',
                                         fontWeight:600, display:'inline-flex', alignItems:'center',
                                         gap:5, flexShrink:0 }}>
                            <span style={{ width:6, height:6, borderRadius:'50%', background: statusStyle.dot }}/>
                            {report.status}
                          </span>
                        </div>

                        <p style={{ fontSize:'0.82rem', color:'#6b7280', marginBottom:10, lineHeight:1.5,
                                    display:'-webkit-box', WebkitLineClamp:2,
                                    WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                          {report.description}
                        </p>

                        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                          <span style={{ background: sevStyle.bg, color: sevStyle.color,
                                         padding:'2px 9px', borderRadius:20, fontSize:'0.7rem', fontWeight:600 }}>
                            {report.severity}
                          </span>
                          <span style={{ fontSize:'0.76rem', color:'#9ca3af' }}>📅 {date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:14,
                                  paddingTop:14, borderTop:'1px solid #f3f4f6' }}>
                      <button className="btn-outline btn-sm"
                        style={{ display:'flex', alignItems:'center', gap:5 }}
                        onClick={() => setEditingReport(report)}>
                        <Edit3 size={13}/> Edit
                      </button>
                      <button className="btn-danger"
                        style={{ display:'flex', alignItems:'center', gap:5 }}
                        onClick={() => setDeletingReport(report)}>
                        <Trash2 size={13}/> Delete
                      </button>
                    </div>
                  </div>
                )
              })}

              <div style={{ textAlign:'center', marginTop:16 }}>
                <button className="btn-accent" onClick={() => navigate('report')}>
                  + Report Another Issue
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {editingReport  && (
        <EditReportModal report={editingReport} onClose={() => setEditingReport(null)}
          onUpdated={handleReportUpdated} />
      )}
      {deletingReport && (
        <DeleteConfirmModal report={deletingReport} onClose={() => setDeletingReport(null)}
          onDeleted={handleReportDeleted} />
      )}
    </div>
  )
}