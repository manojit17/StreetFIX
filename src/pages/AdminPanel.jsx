// ─────────────────────────────────────────────────────────────
//  pages/AdminPanel.jsx
//  PURPOSE : Admin-only page — manage all reports and users
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react'
import {
  getAllReports,
  updateReportAdmin,
  deleteReportAdmin,
  getAllUsers,
  banUser,
  warnUser,
} from '../api/admin'

const STATUS_STYLES = {
  Pending:      'bg-slate-700 text-slate-200',
  Verified:     'bg-amber-500/20 text-amber-400',
  'In Progress': 'bg-blue-500/20 text-blue-400',
  Resolved:     'bg-emerald-500/20 text-emerald-400',
}

export default function AdminPanel() {
  const [tab, setTab] = useState('reports') // 'reports' | 'users'
  const [reports, setReports] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')

  const loadReports = async () => {
    try {
      setLoading(true)
      const data = await getAllReports(statusFilter ? { status: statusFilter } : {})
      setReports(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await getAllUsers()
      setUsers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 'reports') loadReports()
    else loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, statusFilter])

  const handleStatusChange = async (id, status) => {
    try {
      const updated = await updateReportAdmin(id, { status })
      setReports((prev) => prev.map((r) => (r._id === id ? updated : r)))
      if (selectedReport?._id === id) setSelectedReport(updated)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this report permanently?')) return
    try {
      await deleteReportAdmin(id)
      setReports((prev) => prev.filter((r) => r._id !== id))
      setSelectedReport(null)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleBan = async (id, isBanned) => {
    try {
      const updated = await banUser(id, isBanned)
      setUsers((prev) => prev.map((u) => (u._id === id ? updated : u)))
    } catch (err) {
      alert(err.message)
    }
  }

  const handleWarn = async (id) => {
    try {
      const updated = await warnUser(id)
      setUsers((prev) => prev.map((u) => (u._id === id ? updated : u)))
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Admin panel</h1>
        <p className="text-slate-400 text-sm mb-6">Manage reports and users across StreetFix</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-800">
          {['reports', 'users'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition ${
                tab === t
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-slate-400 text-sm">Loading…</p>
        ) : tab === 'reports' ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              <span className="text-slate-500 text-sm">{reports.length} reports</span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/60 text-slate-400 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Severity</th>
                    <th className="px-4 py-3 font-medium">Reporter</th>
                    <th className="px-4 py-3 font-medium">Verifications</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {reports.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3 max-w-xs truncate">{r.title}</td>
                      <td className="px-4 py-3">
                        <select
                          value={r.status}
                          onChange={(e) => handleStatusChange(r._id, e.target.value)}
                          className={`text-xs font-medium px-2 py-1 rounded-md border-0 ${STATUS_STYLES[r.status]}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Verified">Verified</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{r.severity}</td>
                      <td className="px-4 py-3 text-slate-400">{r.userId?.name || '—'}</td>
                      <td className="px-4 py-3 text-slate-400">{r.verifications?.length || 0}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => setSelectedReport(r)}
                          className="text-amber-400 hover:text-amber-300 text-xs font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(r._id)}
                          className="text-red-400 hover:text-red-300 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        No reports match this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/60 text-slate-400 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Warnings</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3 text-slate-400">{u.email}</td>
                    <td className="px-4 py-3 text-slate-400">{u.warnings}</td>
                    <td className="px-4 py-3">
                      {u.isBanned ? (
                        <span className="text-red-400 text-xs font-medium">Banned</span>
                      ) : (
                        <span className="text-emerald-400 text-xs font-medium">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleWarn(u._id)}
                        className="text-amber-400 hover:text-amber-300 text-xs font-medium"
                      >
                        Warn
                      </button>
                      <button
                        onClick={() => handleBan(u._id, !u.isBanned)}
                        className="text-red-400 hover:text-red-300 text-xs font-medium"
                      >
                        {u.isBanned ? 'Unban' : 'Ban'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="bg-slate-800 rounded-xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold">{selectedReport.title}</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {selectedReport.image && (
              <img
                src={selectedReport.image}
                alt={selectedReport.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}

            <p className="text-slate-300 text-sm mb-4">{selectedReport.description}</p>

            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div>
                <span className="text-slate-500">Severity</span>
                <p>{selectedReport.severity}</p>
              </div>
              <div>
                <span className="text-slate-500">Reporter</span>
                <p>{selectedReport.userId?.name || '—'}</p>
              </div>
              <div>
                <span className="text-slate-500">Location</span>
                <p>{selectedReport.latitude?.toFixed(4)}, {selectedReport.longitude?.toFixed(4)}</p>
              </div>
              <div>
                <span className="text-slate-500">Status</span>
                <select
                  value={selectedReport.status}
                  onChange={(e) => handleStatusChange(selectedReport._id, e.target.value)}
                  className={`text-xs font-medium px-2 py-1 rounded-md border-0 mt-1 ${STATUS_STYLES[selectedReport.status]}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <h3 className="text-sm font-medium text-slate-400 mb-2">
                Verifications ({selectedReport.verifications?.length || 0})
              </h3>
              {selectedReport.verifications?.length > 0 ? (
                <ul className="space-y-2">
                  {selectedReport.verifications.map((v, i) => (
                    <li key={i} className="text-xs text-slate-400 flex justify-between">
                      <span>{v.userId?.name || 'Unknown user'} — {v.type}</span>
                      <span>{new Date(v.createdAt).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">No verifications yet.</p>
              )}
            </div>

            <button
              onClick={() => handleDelete(selectedReport._id)}
              className="mt-4 text-red-400 hover:text-red-300 text-sm font-medium"
            >
              Delete report
            </button>
          </div>
        </div>
      )}
    </div>
  )
}