const BASE = 'https://streetfix-backend-1u4c.onrender.com/api'
const getToken = () => localStorage.getItem('sf-token')
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
})

// ✅ UPDATED: Now receives a FormData object instead of JSON to support profile photo uploads
export const updateProfile = async (formData) => {
  const res  = await fetch(`${BASE}/auth/profile`, {
    method : 'PUT',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      // Note: Do NOT set Content-Type header when sending FormData!
    },
    body   : formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to update profile')
  return data
}

export const changePassword = async (currentPassword, newPassword) => {
  const res  = await fetch(`${BASE}/auth/password`, {
    method : 'PUT',
    headers: authHeaders(),
    body   : JSON.stringify({ currentPassword, newPassword }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to change password')
  return data
}

export const getMyReports = async () => {
  const res  = await fetch(`${BASE}/reports/my`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to fetch reports')
  return data
}

// ✅ UPDATED: Now receives a FormData object instead of JSON to support report photo updates
export const updateReport = async (id, formData) => {
  const res  = await fetch(`${BASE}/reports/${id}`, {
    method : 'PUT',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      // Note: Do NOT set Content-Type header when sending FormData!
    },
    body   : formData,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to update report')
  return data
}

export const deleteReport = async (id) => {
  const res  = await fetch(`${BASE}/reports/${id}`, {
    method : 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to delete report')
  return data
}