// components/CommentSection.jsx
// Reusable comment thread — drop this into any report card.
// Shows existing comments + a text input to add new ones.
// Delete button appears only on your own comments.

import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

const API = import.meta.env.VITE_API_URL

// "2h ago" style relative time
const timeAgo = (iso) => {
  if (!iso) return ''
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins   = Math.floor(diffMs / 60000)
  if (mins < 60)  return `${mins}m ago`
  const hours  = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

/**
 * Props:
 *  reportId      → the _id of the report this comment section belongs to
 *  isOpen        → boolean — whether the comment section is expanded or collapsed
 *  onCountChange → optional callback(count) — fired whenever the comment
 *                  list changes, so the parent card's badge stays in sync
 */
export default function CommentSection({ reportId, isOpen, onCountChange }) {
  const { user, isLoggedIn, showToast } = useApp()

  const [comments,     setComments]     = useState([])
  const [loading,      setLoading]      = useState(false)
  const [text,         setText]         = useState('')
  const [posting,      setPosting]      = useState(false)
  const [deletingId,   setDeletingId]   = useState(null)
  const [fetched,      setFetched]      = useState(false) // only fetch once per open

  // Fetch comments when the section is opened for the first time
  useEffect(() => {
    if (!isOpen || fetched) return

    const fetchComments = async () => {
      setLoading(true)
      try {
        const res  = await fetch(`${API}/comments/${reportId}`)
        const data = await res.json()
        if (data.success) {
          const list = data.data || []
          setComments(list)
          onCountChange?.(list.length)
        }
      } catch {
        showToast('❌', 'Error', 'Could not load comments.')
      } finally {
        setLoading(false)
        setFetched(true)
      }
    }

    fetchComments()
  }, [isOpen, fetched, reportId])

  // Post a new comment
  const handlePost = async () => {
    if (!isLoggedIn) {
      showToast('🔒', 'Login Required', 'Please sign in to comment.')
      return
    }
    if (!text.trim()) return

    setPosting(true)
    try {
      const token = localStorage.getItem('sf-token')
      const res   = await fetch(`${API}/comments/${reportId}`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body   : JSON.stringify({ text: text.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to post comment')

      // Add new comment to top of local list instantly
      setComments(prev => {
        const updated = [...prev, data.data]
        onCountChange?.(updated.length)
        return updated
      })
      setText('')
    } catch (err) {
      showToast('❌', 'Error', err.message)
    } finally {
      setPosting(false)
    }
  }

  // Delete a comment
  const handleDelete = async (commentId) => {
    setDeletingId(commentId)
    try {
      const token = localStorage.getItem('sf-token')
      const res   = await fetch(`${API}/comments/${commentId}`, {
        method : 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to delete comment')

      setComments(prev => {
        const updated = prev.filter(c => c._id !== commentId)
        onCountChange?.(updated.length)
        return updated
      })
      showToast('🗑️', 'Deleted', 'Comment removed.')
    } catch (err) {
      showToast('❌', 'Error', err.message)
    } finally {
      setDeletingId(null)
    }
  }

  // Handle Enter key to post (Shift+Enter for new line)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handlePost()
    }
  }

  if (!isOpen) return null

  return (
    <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px 14px 14px' }}>

      {/* Loading state */}
      {loading && (
        <p style={{ fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center', padding: '8px 0' }}>
          Loading comments...
        </p>
      )}

      {/* Comment list */}
      {!loading && comments.length === 0 && (
        <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: 10 }}>
          No comments yet. Be the first!
        </p>
      )}

      {!loading && comments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
          {comments.map(c => {
            const isOwn = user && (user._id === c.userId?._id || user.id === c.userId?._id)
            return (
              <div key={c._id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                {/* Avatar */}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: '#1e3a5f', display: 'grid', placeItems: 'center',
                  fontSize: '0.65rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                }}>
                  {c.userId?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>

                {/* Comment bubble */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    background: '#f9fafb', borderRadius: 8, padding: '7px 10px',
                    fontSize: '0.82rem', color: '#111827', lineHeight: 1.5,
                  }}>
                    <span style={{ fontWeight: 600, color: '#1e3a5f', marginRight: 6 }}>
                      {c.userId?.name || 'User'}
                    </span>
                    {c.text}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 3 }}>
                    <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{timeAgo(c.createdAt)}</span>
                    {isOwn && (
                      <button
                        onClick={() => handleDelete(c._id)}
                        disabled={deletingId === c._id}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: '0.72rem', color: '#ef4444', padding: 0,
                          opacity: deletingId === c._id ? 0.5 : 1,
                        }}>
                        {deletingId === c._id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Input row */}
      {isLoggedIn ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          {/* Current user avatar */}
          <div style={{
            width: 28, height: 28, borderRadius: '50%', background: '#ff6b35',
            display: 'grid', placeItems: 'center', fontSize: '0.65rem',
            fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a comment... (Enter to post)"
            rows={1}
            style={{
              flex: 1, borderRadius: 8, border: '1px solid #e5e7eb',
              padding: '7px 10px', fontSize: '0.82rem', resize: 'none',
              fontFamily: 'inherit', outline: 'none', lineHeight: 1.5,
            }}
          />
          <button
            onClick={handlePost}
            disabled={posting || !text.trim()}
            style={{
              padding: '7px 14px', borderRadius: 8, border: 'none',
              background: posting || !text.trim() ? '#e5e7eb' : '#1e3a5f',
              color: posting || !text.trim() ? '#9ca3af' : '#fff',
              fontWeight: 600, fontSize: '0.82rem', cursor: posting ? 'default' : 'pointer',
              flexShrink: 0,
            }}>
            {posting ? '...' : 'Post'}
          </button>
        </div>
      ) : (
        <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
          <span style={{ color: '#1e3a5f', fontWeight: 600, cursor: 'pointer' }}>Sign in</span> to leave a comment.
        </p>
      )}
    </div>
  )
}