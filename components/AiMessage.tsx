'use client'

import { useEffect, useState } from 'react'
import type { Message } from '@/app/page'

interface AiMessageProps {
  message: Extract<Message, { role: 'ai' }>
}

const stages = [
  'Generating raster image…',
  'Converting to SVG…',
  'Uploading to storage…',
]

export default function AiMessage({ message }: AiMessageProps) {
  const [stage, setStage] = useState(0)
  const [progress, setProgress] = useState(8)

  useEffect(() => {
    if (message.status !== 'thinking') return

    const interval = setInterval(() => {
      setProgress(prev => {
        const cap = stage === 0 ? 38 : stage === 1 ? 72 : 93
        const next = Math.min(prev + Math.random() * 16, cap)
        if (next >= 35 && stage === 0) setStage(1)
        if (next >= 70 && stage === 1) setStage(2)
        return next
      })
    }, 350)

    return () => clearInterval(interval)
  }, [message.status, stage])

  if (message.status === 'thinking') {
    return (
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '8px 24px' }}>
        <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: 'var(--accent)', display: 'inline-block',
            animation: 'pulse 1.4s infinite'
          }} />
          {stages[stage]}
        </div>
        <div style={{ height: 3, background: 'var(--border)', borderRadius: 4, overflow: 'hidden', maxWidth: 400 }}>
          <div style={{
            height: '100%', background: 'var(--accent)',
            borderRadius: 4, width: `${progress}%`,
            transition: 'width 0.4s ease'
          }} />
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      </div>
    )
  }

  if (message.status === 'done' && message.svgUrl) {
    return (
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '8px 24px' }}>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 12 }}>
          Here&apos;s your SVG for{' '}
          <em style={{ color: 'var(--text)' }}>&quot;{message.prompt}&quot;</em>
        </p>
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          maxWidth: 480,
        }}>
          {/* SVG Preview — renders the actual generated SVG */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 32, minHeight: 200,
            backgroundImage: 'repeating-conic-gradient(#1e1e1e 0% 25%, #161616 0% 50%)',
            backgroundSize: '20px 20px',
          }}>
            <img
              src={message.svgUrl}
              alt={message.prompt}
              style={{ maxWidth: '100%', maxHeight: 240, objectFit: 'contain' }}
            />
          </div>

          {/* Footer */}
          <div style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              {message.fileName} · {message.fileSize} · just now
            </span>
            <a
              href={message.svgUrl}
              onClick={async (e) => {
                e.preventDefault()
                try {
                  const res = await fetch(message.svgUrl!)
                  const blob = await res.blob()
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = message.fileName || 'vector.svg'
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                } catch (err) {
                  console.error('Download failed', err)
                  window.open(message.svgUrl, '_blank')
                }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontWeight: 500,
                padding: '6px 14px', borderRadius: 8,
                border: '1px solid var(--accent)', color: 'var(--accent)',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Download SVG
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '8px 24px' }}>
      <div style={{
        background: '#ef44441a', border: '1px solid #ef444433',
        borderRadius: 'var(--radius)', padding: '12px 16px',
        fontSize: 14, color: '#ef4444', maxWidth: 480,
      }}>
        ⚠️ {message.error || 'Something went wrong. Please try again.'}
      </div>
    </div>
  )
}