'use client'

interface TopBarProps {
  onMenuClick: () => void
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 24px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}
    >
      <button
        onClick={onMenuClick}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', display: 'flex', alignItems: 'center', padding: 4 }}
        aria-label="Toggle sidebar"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>
      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>VectoGen</span>
    </header>
  )
}