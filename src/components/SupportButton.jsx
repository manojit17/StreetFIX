
// components/SupportButton.jsx
// Reusable upvote/support button — drop this into any report card.
// Handles the toggle API call, optimistic UI update, and shows
// the current support count + whether the logged-in user supports it.

import { useState } from 'react'
import { useApp } from '../context/AppContext'

const API = import.meta.env.VITE_API_URL

/**
 * Props:
 *  report      → the full report object (must include `supporters` array of user IDs)
 *  onUpdate    → optional callback(updatedReport) called after a successful toggle,
 *                so the PARENT page can update its own local state too
 *                (e.g. Dashboard's reports list) without needing a full re-fetch
 */
export default function SupportButton({ report, onUpdate }) {
  const { user, isLoggedIn, showToast } = useApp()
  const [loading, setLoading] = useState(false)

  // Determine current state from the report's supporters array
  const supportersCount = report.supporters?.length || 0
  const isSupportedByMe = isLoggedIn && user
    ? report.supporters?.some(id => id === user.id || id === user._id) 
    : false

  const handleToggle = async (e) => {
    e.stopPropagation() // prevent triggering a parent card's onClick (e.g. navigate to detail page)

    if (!isLoggedIn) {
      showToast('🔒', 'Login Required', 'Please sign in to support a report.')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('sf-token')
      const res = await fetch(`${API}/reports/${report._id}/support`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update support')

      // Build the updated report locally (optimistic-style update)
      // so the parent page doesn't need to re-fetch the whole list
      const userId = user.id || user._id
      const updatedSupporters = data.isSupportedByMe
        ? [...(report.supporters || []), userId]
        : (report.supporters || []).filter(id => id !== userId)

      const updatedReport = { ...report, supporters: updatedSupporters }
      onUpdate?.(updatedReport)

    } catch (err) {
      showToast('❌', 'Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 20,
        border: `1px solid ${isSupportedByMe ? '#1e3a5f' : '#e5e7eb'}`,
        background: isSupportedByMe ? '#1e3a5f' : '#ffffff',
        color: isSupportedByMe ? '#ffffff' : '#6b7280',
        fontSize: '0.82rem',
        fontWeight: 600,
        cursor: loading ? 'default' : 'pointer',
        opacity: loading ? 0.6 : 1,
        transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: '0.9rem' }}>{isSupportedByMe ? '👍' : '🤍'}</span>
      <span>{supportersCount}</span>
    </button>
  )
}