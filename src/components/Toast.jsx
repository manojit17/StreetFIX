import { useApp } from '../context/AppContext'
export default function Toast() {
  const { toast } = useApp()
  return (
    <div className={`toast ${toast.show ? 'show' : ''}`} key={toast.key}>
      <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{toast.icon}</span>
      <div>
        <h5 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: 2 }}>{toast.title}</h5>
        <p style={{ fontSize: '0.78rem', color: '#6b7280' }}>{toast.msg}</p>
      </div>
      {toast.show && <div className="toast-bar" key={toast.key + '-bar'} />}
    </div>
  )
}
