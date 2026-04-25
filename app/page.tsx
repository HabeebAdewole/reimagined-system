'use client'

import { useState } from 'react'
import Sidebar from "@/components/Sidebar"
import TopBar from "@/components/TopBar"
import ChatArea from "@/components/ChatArea"
import PromptInput from "@/components/PromptInput"

export type MessageStatus = 'thinking' | 'done' | 'error'

export type Message =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'ai'; status: MessageStatus; prompt?: string; svgUrl?: string; svgContent?: string; fileName?: string; fileSize?: string }

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [history, setHistory] = useState<string[]>([])

  const handleSend = (prompt: string) => {
    const userId = crypto.randomUUID()
    const aiId = crypto.randomUUID()

    setMessages(prev => [
      ...prev,
      { id: userId, role: 'user', text: prompt },
      { id: aiId, role: 'ai', status: 'thinking', prompt },
    ])

    setHistory(prev => [prompt, ...prev])

    const runPipeline = async () => {
      try {
        // 1. Generate Raster image
        const genRes = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        })
        if (!genRes.ok) {
          const errData = await genRes.json().catch(() => ({}));
          throw new Error(errData.error || 'Generation failed');
        }
        const { image } = await genRes.json()

        // 2. Vectorize image
        const vecRes = await fetch('/api/vectorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image }),
        })
        if (!vecRes.ok) {
          const errData = await vecRes.json().catch(() => ({}));
          throw new Error(errData.error || 'Vectorize failed');
        }
        const { svg } = await vecRes.json()

        // 3. Update UI
        const blob = new Blob([svg], { type: 'image/svg+xml' })
        const svgUrl = URL.createObjectURL(blob)

        setMessages(prev =>
          prev.map(m =>
            m.id === aiId
              ? {
                  ...m,
                  status: 'done' as MessageStatus,
                  svgUrl,
                  svgContent: svg,     // add this for ChatArea
                  fileName: 'output.svg',
                  fileSize: `${(svg.length / 1024).toFixed(1)} KB`,
                }
              : m
          )
        )
      } catch (err) {
        console.error(err)
        setMessages(prev => prev.map(m => (m.id === aiId ? { ...m, status: 'error' } : m)))
      }
    }
    
    runPipeline()
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        history={history}
      />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col flex-1 min-w-0 h-screen">
        <TopBar onMenuClick={() => setSidebarOpen(prev => !prev)} />
        <ChatArea messages={messages} />
        <PromptInput onSend={handleSend} disabled={false} />
      </div>
    </div>
  )
}