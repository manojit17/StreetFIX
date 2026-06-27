const BASE = 'https://streetfix-backend-1u4c.onrender.com/api'
const getToken = () => localStorage.getItem('sf-token')
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
})

export const updateProfile = async (name, email) => {
  const res  = await fetch(`${BASE}/auth/profile`, {
    method : 'PUT',
    headers: authHeaders(),
    body   : JSON.stringify({ name, email }),
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

export const updateReport = async (id, fields) => {
  const res  = await fetch(`${BASE}/reports/${id}`, {
    method : 'PUT',
    headers: authHeaders(),
    body   : JSON.stringify(fields),
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