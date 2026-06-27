// src/components/DeleteConfirmModal.jsx
// Simple confirmation dialog before deleting a report

import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { deleteReport } from '../api/profileService'

export default function DeleteConfirmModal({ report, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteReport(report._id)
      onDeleted(report._id) // tell parent to remove from list
      onClose()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position:'fixed', inset:0, zIndex:200,
        background:'rgba(0,0,0,0.5)',
        backdropFilter:'blur(4px)',
        display:'grid', placeItems:'center',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background:'#ffffff', borderRadius:16,
        padding:32, width:'100%', maxWidth:400,
        margin:16, position:'relative',
        boxShadow:'0 20px 48px rgba(0,0,0,0.18)',
        textAlign:'center',
      }}>
        <button
          onClick={onClose}
          style={{ position:'absolute', top:14, right:16, background:'none', border:'none', cursor:'pointer', color:'#6b7280' }}
        >
          <X size={20}/>
        </button>

        {/* Icon */}
        <div style={{
          width:56, height:56, background:'rgba(239,68,68,0.1)',
          borderRadius:'50%', display:'grid', placeItems:'center',
          margin:'0 auto 16px', fontSize:'1.5rem',
        }}>
          🗑️
        </div>

        <h2 style={{ fontFamily:'Poppins,sans-serif', fontSize:'1.2rem', marginBottom:8 }}>
          Delete Report?
        </h2>
        <p style={{ fontSize:'0.88rem', color:'#6b7280', marginBottom:6 }}>
          You are about to delete:
        </p>
        <p style={{ fontSize:'0.9rem', fontWeight:600, color:'#1f2937', marginBottom:20 }}>
          "{report.title}"
        </p>
        <p style={{ fontSize:'0.82rem', color:'#9ca3af', marginBottom:24 }}>
          This action cannot be undone. The report will be removed from all pages.
        </p>

        {error && (
          <div style={{
            background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.3)',
            borderRadius:8, padding:'10px 14px', marginBottom:14,
            fontSize:'0.84rem', color:'#ef4444',
          }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button
            className="btn-danger"
            onClick={handleDelete}
            disabled={loading}
            style={{
              padding:'9px 20px', fontSize:'0.88rem',
              opacity: loading ? 0.75 : 1,
              display:'flex', alignItems:'center', gap:6,
            }}
          >
            {loading ? '⏳ Deleting...' : <><Trash2 size={14}/> Delete Report</>}
          </button>
        </div>
      </div>
    </div>
  )
}