'use client'

import { useState, useRef } from 'react'

interface PromptInputProps {
  onSend: (prompt: string) => void
  disabled: boolean
}

export default function PromptInput({ onSend, disabled }: PromptInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  const canSend = value.trim().length > 0 && !disabled

  return (
    <div style={{ padding: '12px 24px 24px', flexShrink: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 10,
        background: 'var(--input-bg)',
        border: '1px solid var(--border)',
        borderRadius: 28,
        padding: '10px 10px 10px 20px',
        maxWidth: 760,
        margin: '0 auto',
        transition: 'border-color 0.15s',
      }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Describe your image... e.g. a minimal fox logo, flat design"
          rows={1}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text)', fontFamily: 'Sora, sans-serif',
            fontSize: 14, lineHeight: 1.6, resize: 'none',
            minHeight: 24, maxHeight: 160,
          }}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: canSend ? 'var(--accent)' : 'var(--border)',
            border: 'none', cursor: canSend ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'background 0.15s',
          }}
        >
          <svg width="15" height="15" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
      <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 8 }}>
        VectoGen uses Stability AI + Vectorizer.AI · Files stored in Supabase
      </p>
    </div>
  )
}