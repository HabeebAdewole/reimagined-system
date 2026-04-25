'use client'

interface SidebarProps {
  open: boolean
  onClose: () => void
  history: string[]
}

export default function Sidebar({ open, onClose, history }: SidebarProps) {
  return (
    <aside
      style={{
        width: 260,
        minWidth: 260,
        background: 'var(--sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 30,
      }}
    >
      <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', letterSpacing: '0.04em' }}>
          VectoGen
        </p>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6 }}
          aria-label="Close sidebar"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div style={{ padding: '12px 8px 8px' }}>
        <p style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0 8px 8px' }}>
          Recent
        </p>
        {history.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--muted)', padding: '8px 10px' }}>
            No generations yet
          </p>
        )}
        {history.map((item, i) => (
          <div
            key={i}
            style={{
              padding: '9px 10px',
              borderRadius: 8,
              fontSize: 13,
              color: i === 0 ? 'var(--text)' : 'var(--muted)',
              background: i === 0 ? 'var(--surface2)' : 'transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginBottom: 2,
            }}
          >
            {item.length > 38 ? item.slice(0, 38) + '…' : item}
          </div>
        ))}
      </div>
    </aside>
  )
}