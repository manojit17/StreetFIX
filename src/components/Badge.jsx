export default function Badge({ status }) {
  const map = {
    Pending: 'badge badge-pending',
    'In Progress': 'badge badge-progress',
    Resolved: 'badge badge-resolved',
  }
  return (
    <span className={map[status] || 'badge badge-pending'}>
      <span className="badge-dot" />
      {status}
    </span>
  )
}
