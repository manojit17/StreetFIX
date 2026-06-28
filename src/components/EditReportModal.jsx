// src/components/EditReportModal.jsx
// Modal for editing title, description, severity, and photo of a report
// Opens from the Profile page report list

import { useState } from 'react'
import { X } from 'lucide-react'
import { updateReport } from '../api/profileService'

export default function EditReportModal({ report, onClose, onUpdated }) {
  const [form, setForm] = useState({
    title      : report.title,
    description: report.description,
    severity   : report.severity,
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(report.image || '')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setError('')
    }
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required')
      return
    }
    setLoading(true)
    try {
      // Build FormData to support file upload
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('description', form.description)
      formData.append('severity', form.severity)
      if (imageFile) {
        formData.append('image', imageFile)
      }

      const data = await updateReport(report._id, formData)
      onUpdated(data.data) // pass updated report back to parent
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position  : 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        display   : 'grid', placeItems: 'center',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background  : '#ffffff',
        borderRadius: 16,
        padding     : 32,
        width       : '100%',
        maxWidth    : 480,
        margin      : 16,
        position    : 'relative',
        boxShadow   : '0 20px 48px rgba(0,0,0,0.18)',
        animation   : 'popIn 0.18s ease',
      }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <h2 style={{ fontFamily:'Poppins,sans-serif', fontSize:'1.2rem', margin:0 }}>
            ✏️ Edit Report
          </h2>
          <button
            onClick={onClose}
            style={{ background:'none', border:'none', cursor:'pointer', color:'#6b7280', padding:4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.3)',
            borderRadius:8, padding:'10px 14px', marginBottom:14,
            fontSize:'0.84rem', color:'#ef4444',
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Title */}
          <div>
            <label className="form-label">Title *</label>
            <input
              className="form-input"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Large pothole on MG Road"
            />
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Description *</label>
            <textarea
              className="form-input"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the issue..."
              style={{ resize:'vertical', minHeight:90 }}
            />
          </div>

          {/* Severity */}
          <div>
            <label className="form-label">Severity</label>
            <select
              className="form-input"
              name="severity"
              value={form.severity}
              onChange={handleChange}
              style={{ cursor:'pointer' }}
            >
              {['Low','Medium','High','Critical'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <label className="form-label">Report Photo</label>
            <div style={{ display:'flex', gap:12, alignItems:'center', marginTop:6 }}>
              <div style={{
                width:80, height:80, borderRadius:8, overflow:'hidden',
                background:'#f3f4f6', border:'1px solid #e5e7eb',
                display:'grid', placeItems:'center', fontSize:'1.5rem', flexShrink:0
              }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                ) : (
                  '🛣️'
                )}
              </div>
              <label htmlFor="edit-report-image" className="btn-outline" style={{ cursor:'pointer', padding:'8px 14px', fontSize:'0.84rem' }}>
                Change Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display:'none' }}
                id="edit-report-image"
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:4 }}>
            <button className="btn-outline" onClick={onClose}>Cancel</button>
            <button
              className="btn-accent"
              onClick={handleSave}
              disabled={loading}
              style={{ opacity: loading ? 0.75 : 1 }}
            >
              {loading ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}