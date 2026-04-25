'use client'

import { useEffect, useRef } from 'react'
import type { Message } from '@/app/page'
import AiMessage from "@/components/AiMessage"

interface ChatAreaProps {
  messages: Message[]
}

export default function ChatArea({ messages }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: 'var(--text)', textAlign: 'center' }}>
          Welcome to VectoGen
        </h1>
        <p style={{ fontSize: 15, color: 'var(--muted)', textAlign: 'center', maxWidth: 400, lineHeight: 1.65 }}>
          Describe the image you&apos;d like to create, and I&apos;ll generate a scalable vector graphic for you.
        </p>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 0' }}>
      {messages.map(msg => {
        if (msg.role === 'user') {
          return (
            <div key={msg.id} style={{ maxWidth: 760, margin: '0 auto', padding: '8px 24px', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{
                background: 'var(--surface2)',
                borderRadius: '18px 18px 4px 18px',
                padding: '10px 16px',
                fontSize: 14,
                lineHeight: 1.65,
                color: 'var(--text)',
                maxWidth: 480,
              }}>
                {msg.text}
              </div>
            </div>
          )
        }
        return <AiMessage key={msg.id} message={msg} />
      })}
      <div ref={bottomRef} />
    </div>
  )
}