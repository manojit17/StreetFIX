// src/pages/Profile.jsx — Phase 6 update
// Added 3 new tabs: My Supports, My Verifications, Achievements
// Fixed: removed broken Community import, fixed navigate back button

import { useState, useEffect } from 'react'
import { User, Lock, FileText, Edit3, Trash2, ChevronDown, ChevronUp, Heart, CheckCircle, Award } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { updateProfile, changePassword, getMyReports } from '../api/profileService'
import EditReportModal    from '../components/EditReportModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

const API = import.meta.env.VITE_API_URL

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

// ── Achievements definition ───────────────────────────────────
// Each badge checks a condition against real data — no separate model needed
const getAchievements = (reports, supports, verifications) => [
  {
    id      : 'first_report',
    icon    : '🌱',
    title   : 'First Step',
    desc    : 'Submit your first report',
    unlocked: reports.length >= 1,
  },
  {
    id      : 'photo_evidence',
    icon    : '📸',
    title   : 'Evidence Seeker',
    desc    : 'Upload a photo with a report',
    unlocked: reports.some(r => r.image),
  },
  {
    id      : 'first_verify',
    icon    : '🔍',
    title   : 'Truth Seeker',
    desc    : 'Verify your first report in person',
    unlocked: verifications.length >= 1,
  },
  {
    id      : 'five_reports',
    icon    : '📣',
    title   : 'Voice of the City',
    desc    : 'Submit 5 reports',
    unlocked: reports.length >= 5,
  },
  {
    id      : 'ten_supports',
    icon    : '🦸',
    title   : 'Local Hero',
    desc    : 'Support 10 reports from other citizens',
    unlocked: supports.length >= 10,
  },
  {
    id      : 'five_verifications',
    icon    : '🔎',
    title   : 'Field Inspector',
    desc    : 'Verify 5 reports in person',
    unlocked: verifications.length >= 5,
  },
  {
    id      : 'community_legend',
    icon    : '💎',
    title   : 'Community Legend',
    desc    : 'Reach a Community Score of 100',
    unlocked: (reports.length * 5 + verifications.length * 3 + supports.length) >= 100,
  },
  {
    id      : 'problem_solver',
    icon    : '⚡',
    title   : 'Problem Solver',
    desc    : 'Have 3 of your reports resolved',
    unlocked: reports.filter(r => r.status === 'Resolved').length >= 3,
  },
]

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

const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })
}

export default function Profile({ navigate }) {
  const { user, saveAuth, clearAuth, showToast } = useApp()
  const token = localStorage.getItem('sf-token')

  // ── State ─────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('profile')

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

  // My Reports
  const [reports,        setReports]        = useState([])
  const [reportsLoading, setReportsLoading] = useState(true)
  const [reportsError,   setReportsError]   = useState('')
  const [editingReport,  setEditingReport]  = useState(null)
  const [deletingReport, setDeletingReport] = useState(null)

  // My Supports
  const [supports,        setSupports]        = useState([])
  const [supportsLoading, setSupportsLoading] = useState(false)
  const [supportsFetched, setSupportsFetched] = useState(false)

  // My Verifications
  const [verifications,        setVerifications]        = useState([])
  const [verificationsLoading, setVerificationsLoading] = useState(false)
  const [verificationsFetched, setVerificationsFetched] = useState(false)

  // ── Fetch my reports on mount ─────────────────────────────────
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

  // ── Fetch supports when tab opened ────────────────────────────
  useEffect(() => {
    if (activeTab !== 'supports' || supportsFetched) return
    const fetchSupports = async () => {
      setSupportsLoading(true)
      try {
        // Get all reports and filter to ones the current user supports
        const res  = await fetch(`${API}/reports`)
        const data = await res.json()
        if (data.success) {
          const myId = user?._id || user?.id
          const supported = (data.data || []).filter(r =>
            r.supporters?.some(id =>
              (id?._id || id)?.toString() === myId?.toString()
            )
          )
          setSupports(supported)
        }
      } catch {}
      finally {
        setSupportsLoading(false)
        setSupportsFetched(true)
      }
    }
    fetchSupports()
  }, [activeTab, supportsFetched])

  // ── Fetch verifications when tab opened ───────────────────────
  useEffect(() => {
    if (activeTab !== 'verifications' || verificationsFetched) return
    const fetchVerifications = async () => {
      setVerificationsLoading(true)
      try {
        const res  = await fetch(`${API}/verifications/my`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) setVerifications(data.data || [])
      } catch {}
      finally {
        setVerificationsLoading(false)
        setVerificationsFetched(true)
      }
    }
    fetchVerifications()
  }, [activeTab, verificationsFetched])

  // ── Sync user state ───────────────────────────────────────────
  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name, email: user.email })
      setAvatarPreview(user.avatar || '')
    }
  }, [user])

  // ── Community score ───────────────────────────────────────────
  const communityScore = reports.length * 5 + verifications.length * 3 + supports.length

  // ── Achievements ──────────────────────────────────────────────
  const achievements    = getAchievements(reports, supports, verifications)
  const unlockedCount   = achievements.filter(a => a.unlocked).length

  // ── Handlers ─────────────────────────────────────────────────
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
      if (avatarFile) formData.append('avatar', avatarFile)

      const data = await updateProfile(formData)
      const updatedUser = { ...user, name: data.user.name, email: data.user.email, avatar: data.user.avatar }
      localStorage.setItem('sf-user', JSON.stringify(updatedUser))
      saveAuth(localStorage.getItem('sf-token'), updatedUser)
      setProfileSuccess('Profile updated successfully!')
      setAvatarFile(null)
      showToast('✅', 'Profile Updated', 'Your profile has been saved.')
    } catch (err) { setProfileError(err.message) }
    finally { setProfileLoading(false) }
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
    } catch (err) { setPassError(err.message) }
    finally { setPassLoading(false) }
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

  const TABS = [
    { id:'profile',       label:'Account',        icon:<User size={14}/>         },
    { id:'reports',       label:`Reports (${reports.length})`, icon:<FileText size={14}/> },
    { id:'supports',      label:'My Supports',    icon:<Heart size={14}/>        },
    { id:'verifications', label:'My Verifications',icon:<CheckCircle size={14}/> },
    { id:'achievements',  label:'Achievements',   icon:<Award size={14}/>        },
  ]

  return (
    <div style={{ maxWidth:820, margin:'0 auto', padding:'36px 20px 60px' }}>

      {/* Back button */}
      <button onClick={() => navigate('community')}
        style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280',
                 fontSize:'0.86rem', marginBottom:12, display:'flex', alignItems:'center',
                 gap:6, padding:0 }}>
        ← Back to Community
      </button>

      <h1 style={{ fontFamily:'Poppins,sans-serif', fontSize:'1.8rem', marginBottom:4 }}>My Profile</h1>
      <p style={{ color:'#6b7280', fontSize:'0.9rem', marginBottom:24 }}>
        Manage your account, reports, and community activity
      </p>

      {/* ── Avatar + stats card ── */}
      <div className="card-static" style={{ padding:24, marginBottom:20,
                                             display:'flex', alignItems:'center',
                                             gap:20, flexWrap:'wrap' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', overflow:'hidden',
                      background:'#1e3a5f', border:'2px solid #1e3a5f',
                      display:'grid', placeItems:'center', flexShrink:0 }}>
          {user?.avatar
            ? <img src={user.avatar} alt="Avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            : <div style={{ fontSize:'1.5rem', fontWeight:700, color:'white', fontFamily:'Poppins,sans-serif' }}>{initials}</div>
          }
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700, fontSize:'1.2rem', marginBottom:2 }}>
            {user?.name || 'User'}
          </div>
          <div style={{ fontSize:'0.88rem', color:'#6b7280', marginBottom:8 }}>{user?.email}</div>
          <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
            <span style={{ fontSize:'0.8rem', color:'#9ca3af' }}>
              📋 {reports.length} reports
            </span>
            <span style={{ fontSize:'0.8rem', color:'#9ca3af' }}>
              👍 {supports.length} supports
            </span>
            <span style={{ fontSize:'0.8rem', color:'#9ca3af' }}>
              ✅ {verifications.length} verifications
            </span>
            <span style={{ fontSize:'0.8rem', color:'#ff6b35', fontWeight:700 }}>
              ⚡ {communityScore} pts
            </span>
          </div>
        </div>
        {/* Achievements unlocked badge */}
        <div style={{ textAlign:'center', flexShrink:0 }}>
          <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700,
                        fontSize:'1.6rem', color:'#ff6b35' }}>
            {unlockedCount}/{achievements.length}
          </div>
          <div style={{ fontSize:'0.72rem', color:'#9ca3af' }}>badges</div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="tab-bar" style={{ marginBottom:24, overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t.id}
            className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
            style={{ display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ══ ACCOUNT SETTINGS TAB ══ */}
      {activeTab === 'profile' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          <div className="card-static" style={{ padding:24 }}>
            <SectionTitle icon={<User size={16}/>}>Personal Information</SectionTitle>
            {profileError   && <ErrorBox   msg={profileError}   />}
            {profileSuccess && <SuccessBox msg={profileSuccess} />}

            <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:18 }}>
              <div style={{ width:60, height:60, borderRadius:'50%', overflow:'hidden',
                            background:'#f3f4f6', border:'1px solid #e5e7eb',
                            display:'grid', placeItems:'center', flexShrink:0 }}>
                {avatarPreview
                  ? <img src={avatarPreview} alt="Preview" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  : <div style={{ fontSize:'1.2rem', fontWeight:700, color:'#1e3a5f', fontFamily:'Poppins,sans-serif' }}>{initials}</div>
                }
              </div>
              <label htmlFor="profile-avatar-input" className="btn-outline"
                style={{ cursor:'pointer', padding:'8px 14px', fontSize:'0.82rem' }}>
                Change Photo
              </label>
              <input type="file" accept="image/*" id="profile-avatar-input"
                onChange={handleAvatarChange} style={{ display:'none' }} />
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
                <button className="btn-accent" onClick={handleProfileSave}
                  disabled={profileLoading} style={{ opacity: profileLoading ? 0.75 : 1 }}>
                  {profileLoading ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </div>
          </div>

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
                  {[
                    { label:'Current Password', key:'currentPassword', ph:'Enter current password' },
                    { label:'New Password',      key:'newPassword',     ph:'Min 6 characters' },
                    { label:'Confirm New Password', key:'confirmPassword', ph:'Repeat new password' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="form-label">{f.label}</label>
                      <input className="form-input" type="password" placeholder={f.ph}
                        value={passForm[f.key]}
                        onChange={e => { setPassForm(p => ({ ...p, [f.key]: e.target.value })); setPassError(''); setPassSuccess('') }} />
                    </div>
                  ))}
                  <div style={{ display:'flex', justifyContent:'flex-end' }}>
                    <button className="btn-accent" onClick={handlePasswordChange}
                      disabled={passLoading} style={{ opacity: passLoading ? 0.75 : 1 }}>
                      {passLoading ? '⏳ Updating...' : '🔒 Update Password'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

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

      {/* ══ MY REPORTS TAB ══ */}
      {activeTab === 'reports' && (
        <div>
          {reportsLoading && <div style={{ textAlign:'center', padding:48, color:'#6b7280' }}>⏳ Loading...</div>}
          {reportsError && !reportsLoading && <ErrorBox msg={reportsError} />}

          {!reportsLoading && !reportsError && reports.length === 0 && (
            <div style={{ textAlign:'center', padding:56 }}>
              <div style={{ fontSize:'3rem', marginBottom:14 }}>📋</div>
              <h3 style={{ fontFamily:'Poppins,sans-serif', marginBottom:8 }}>No reports yet</h3>
              <button className="btn-accent" onClick={() => navigate('report')}>📝 Report Your First Issue</button>
            </div>
          )}

          {!reportsLoading && reports.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {reports.map(report => {
                const ss  = STATUS_COLORS[report.status] || STATUS_COLORS['Pending']
                const sev = SEV_COLORS[report.severity]  || SEV_COLORS['Medium']
                return (
                  <div key={report._id} className="card-static" style={{ padding:20 }}>
                    <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
                      <div style={{ width:60, height:60, borderRadius:10, overflow:'hidden',
                                    flexShrink:0, background:'#f3f4f6', display:'grid',
                                    placeItems:'center', fontSize:'1.4rem', border:'1px solid #e5e7eb' }}>
                        {report.image
                          ? <img src={report.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                          : '🛣️'}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
                                      gap:8, flexWrap:'wrap', marginBottom:6 }}>
                          <h4 style={{ fontFamily:'Poppins,sans-serif', fontSize:'0.95rem', fontWeight:700,
                                       margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:300 }}>
                            {report.title}
                          </h4>
                          <span style={{ ...ss, padding:'3px 10px', borderRadius:20, fontSize:'0.72rem',
                                         fontWeight:600, display:'inline-flex', alignItems:'center', gap:5, flexShrink:0 }}>
                            <span style={{ width:6, height:6, borderRadius:'50%', background: ss.dot }}/>
                            {report.status}
                          </span>
                        </div>
                        <p style={{ fontSize:'0.82rem', color:'#6b7280', marginBottom:10, lineHeight:1.5,
                                    display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                          {report.description}
                        </p>
                        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                          <span style={{ ...sev, padding:'2px 9px', borderRadius:20, fontSize:'0.7rem', fontWeight:600 }}>
                            {report.severity}
                          </span>
                          <span style={{ fontSize:'0.76rem', color:'#9ca3af' }}>📅 {formatDate(report.createdAt)}</span>
                          <span style={{ fontSize:'0.76rem', color:'#6b7280' }}>👍 {report.supporters?.length || 0}</span>
                        </div>
                      </div>
                    </div>
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
                <button className="btn-accent" onClick={() => navigate('report')}>+ Report Another Issue</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ MY SUPPORTS TAB ══ */}
      {activeTab === 'supports' && (
        <div>
          {supportsLoading && <div style={{ textAlign:'center', padding:48, color:'#6b7280' }}>⏳ Loading...</div>}

          {!supportsLoading && supports.length === 0 && (
            <div style={{ textAlign:'center', padding:56 }}>
              <div style={{ fontSize:'3rem', marginBottom:14 }}>👍</div>
              <h3 style={{ fontFamily:'Poppins,sans-serif', marginBottom:8 }}>No supports yet</h3>
              <p style={{ color:'#6b7280', fontSize:'0.9rem', marginBottom:20 }}>
                Go to the Community page and support reports from other citizens.
              </p>
              <button className="btn-accent" onClick={() => navigate('community')}>Go to Community</button>
            </div>
          )}

          {!supportsLoading && supports.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <p style={{ fontSize:'0.84rem', color:'#6b7280', marginBottom:4 }}>
                You've supported {supports.length} report{supports.length !== 1 ? 's' : ''}.
              </p>
              {supports.map(r => {
                const ss = STATUS_COLORS[r.status] || STATUS_COLORS['Pending']
                return (
                  <div key={r._id} className="card-static" style={{ padding:16, display:'flex', gap:14, alignItems:'flex-start' }}>
                    <div style={{ width:52, height:52, borderRadius:8, overflow:'hidden',
                                  flexShrink:0, background:'#f3f4f6', display:'grid',
                                  placeItems:'center', fontSize:'1.2rem', border:'1px solid #e5e7eb' }}>
                      {r.image ? <img src={r.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : '🛣️'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                        <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{r.title}</div>
                        <span style={{ ...ss, padding:'2px 8px', borderRadius:20, fontSize:'0.7rem', fontWeight:600, flexShrink:0 }}>
                          {r.status}
                        </span>
                      </div>
                      <p style={{ fontSize:'0.8rem', color:'#6b7280', marginBottom:6,
                                  display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                        {r.description}
                      </p>
                      <div style={{ fontSize:'0.74rem', color:'#9ca3af' }}>
                        👍 {r.supporters?.length || 0} total supports • 📅 {formatDate(r.createdAt)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ══ MY VERIFICATIONS TAB ══ */}
      {activeTab === 'verifications' && (
        <div>
          {verificationsLoading && <div style={{ textAlign:'center', padding:48, color:'#6b7280' }}>⏳ Loading...</div>}

          {!verificationsLoading && verifications.length === 0 && (
            <div style={{ textAlign:'center', padding:56 }}>
              <div style={{ fontSize:'3rem', marginBottom:14 }}>✅</div>
              <h3 style={{ fontFamily:'Poppins,sans-serif', marginBottom:8 }}>No verifications yet</h3>
              <p style={{ color:'#6b7280', fontSize:'0.9rem', marginBottom:20 }}>
                Go to Verify Issues and confirm reports in your area.
              </p>
              <button className="btn-accent" onClick={() => navigate('verify')}>Go to Verify Issues</button>
            </div>
          )}

          {!verificationsLoading && verifications.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <p style={{ fontSize:'0.84rem', color:'#6b7280', marginBottom:4 }}>
                You've verified {verifications.length} report{verifications.length !== 1 ? 's' : ''} in person.
              </p>
              {verifications.map(v => (
                <div key={v._id} className="card-static" style={{ padding:16 }}>
                  <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                    {/* Verification photo if uploaded */}
                    <div style={{ width:52, height:52, borderRadius:8, overflow:'hidden',
                                  flexShrink:0, background:'#f3f4f6', display:'grid',
                                  placeItems:'center', fontSize:'1.2rem', border:'1px solid #e5e7eb' }}>
                      {v.photo
                        ? <img src={v.photo} alt="Verification" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                        : v.type === 'resolved' ? '🛠️' : '✅'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:'0.9rem', marginBottom:4 }}>
                        {v.reportId?.title || 'Report'}
                      </div>
                      <div style={{ display:'flex', gap:10, flexWrap:'wrap', fontSize:'0.78rem', color:'#6b7280' }}>
                        <span style={{
                          padding:'2px 8px', borderRadius:20, fontSize:'0.72rem', fontWeight:600,
                          background: v.type === 'resolved' ? '#d1fae5' : '#dbeafe',
                          color:      v.type === 'resolved' ? '#065f46' : '#1e40af',
                        }}>
                          {v.type === 'resolved' ? '🛠️ Marked as Fixed' : '✅ Confirmed Still Here'}
                        </span>
                        <span>📅 {formatDate(v.createdAt)}</span>
                      </div>
                      {v.reportId?.status && (
                        <div style={{ fontSize:'0.74rem', color:'#9ca3af', marginTop:4 }}>
                          Report status: {v.reportId.status}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ ACHIEVEMENTS TAB ══ */}
      {activeTab === 'achievements' && (
        <div>
          {/* Community score card */}
          <div className="card-static" style={{ padding:20, marginBottom:16,
                                                 display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ textAlign:'center', flexShrink:0 }}>
              <div style={{ fontFamily:'Poppins,sans-serif', fontWeight:700,
                            fontSize:'2rem', color:'#ff6b35' }}>
                {communityScore}
              </div>
              <div style={{ fontSize:'0.74rem', color:'#9ca3af' }}>Community Score</div>
            </div>
            <div style={{ flex:1, height:1, background:'#e5e7eb' }}/>
            <div style={{ fontSize:'0.82rem', color:'#6b7280', maxWidth:260 }}>
              Score = Reports×5 + Verifications×3 + Supports×1
            </div>
          </div>

          {/* Achievement badges grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:12 }}>
            {achievements.map(a => (
              <div key={a.id}
                style={{
                  background: a.unlocked ? '#fff' : '#f9fafb',
                  border: `1px solid ${a.unlocked ? '#e5e7eb' : '#f3f4f6'}`,
                  borderRadius:12, padding:18,
                  opacity: a.unlocked ? 1 : 0.55,
                  transition:'all 0.2s',
                }}>
                <div style={{ fontSize:'2rem', marginBottom:8 }}>{a.unlocked ? a.icon : '🔒'}</div>
                <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:4,
                              color: a.unlocked ? '#111827' : '#9ca3af' }}>
                  {a.title}
                </div>
                <div style={{ fontSize:'0.78rem', color:'#6b7280', lineHeight:1.4 }}>{a.desc}</div>
                {a.unlocked && (
                  <div style={{ marginTop:10, fontSize:'0.72rem', fontWeight:600, color:'#10b981' }}>
                    ✓ Unlocked
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {editingReport && (
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