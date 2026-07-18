const BASE = 'https://streetfix-backend-1u4c.onrender.com/api'
const getToken = () => localStorage.getItem('sf-token')
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
})

export const getAllReports = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString()
  const res  = await fetch(`${BASE}/admin/reports${params ? `?${params}` : ''}`, {
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to fetch reports')
  return data
}

export const updateReportAdmin = async (id, updates) => {
  const res  = await fetch(`${BASE}/admin/reports/${id}`, {
    method : 'PATCH',
    headers: authHeaders(),
    body   : JSON.stringify(updates),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to update report')
  return data
}

export const deleteReportAdmin = async (id) => {
  const res  = await fetch(`${BASE}/admin/reports/${id}`, {
    method : 'DELETE',
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to delete report')
  return data
}

export const getAllUsers = async () => {
  const res  = await fetch(`${BASE}/admin/users`, {
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to fetch users')
  return data
}

export const banUser = async (id, isBanned) => {
  const res  = await fetch(`${BASE}/admin/users/${id}/ban`, {
    method : 'PATCH',
    headers: authHeaders(),
    body   : JSON.stringify({ isBanned }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to update ban status')
  return data
}

export const warnUser = async (id) => {
  const res  = await fetch(`${BASE}/admin/users/${id}/warn`, {
    method : 'PATCH',
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to warn user')
  return data
}