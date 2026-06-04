export default function StatusBadge({ status }) {
  const map = {
    'Pending':     'badge-pending',
    'In Progress': 'badge-progress',
    'Resolved':    'badge-resolved',
  }
  return (
    <span className={`badge ${map[status] || 'badge-pending'}`}>
      <span className="badge-dot"></span>
      {status}
    </span>
  )
}
