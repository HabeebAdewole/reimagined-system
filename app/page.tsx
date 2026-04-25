'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import ChatArea from '@/components/ChatArea'
import PromptInput from '@/components/PromptInput'

export type MessageStatus = 'thinking' | 'done' | 'error'

export type Message =
  | { id: string; role: 'user'; text: string }
  | {
      id: string
      role: 'ai'
      status: MessageStatus
      prompt?: string
      svgUrl?: string
      fileName?: string
      fileSize?: string
      error?: string
    }

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const updateAiMessage = (id: string, patch: Partial<Extract<Message, { role: 'ai' }>>) => {
    setMessages(prev =>
      prev.map(m => (m.id === id && m.role === 'ai' ? { ...m, ...patch } : m))
    )
  }

  const handleSend = async (prompt: string) => {
    if (isGenerating) return

    const userId = crypto.randomUUID()
    const aiId = crypto.randomUUID()

    setIsGenerating(true)
    setHistory(prev => [prompt, ...prev])
    setMessages(prev => [
      ...prev,
      { id: userId, role: 'user', text: prompt },
      { id: aiId, role: 'ai', status: 'thinking', prompt },
    ])

    try {
      // Step 1 — Generate raster image via Stability AI
      const generateRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!generateRes.ok) {
        const { error } = await generateRes.json()
        throw new Error(error || 'Failed to generate image')
      }

      const { image } = await generateRes.json()

      // Step 2 — Vectorize raster to SVG
      const vectorizeRes = await fetch('/api/vectorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      })

      if (!vectorizeRes.ok) {
        const { error } = await vectorizeRes.json()
        throw new Error(error || 'Failed to vectorize image')
      }

      const { svg } = await vectorizeRes.json()

      // Step 3 — Upload SVG + metadata to Supabase
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ svg, prompt }),
      })

      if (!uploadRes.ok) {
        const { error } = await uploadRes.json()
        throw new Error(error || 'Failed to upload file')
      }

      const { signedUrl, fileName, fileSize } = await uploadRes.json()

      updateAiMessage(aiId, {
        status: 'done',
        svgUrl: signedUrl,
        fileName,
        fileSize,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      updateAiMessage(aiId, { status: 'error', error: message })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        history={history}
      />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col flex-1 min-w-0 h-screen">
        <TopBar onMenuClick={() => setSidebarOpen(prev => !prev)} />
        <ChatArea messages={messages} />
        <PromptInput onSend={handleSend} disabled={isGenerating} />
      </div>
    </div>
  )
}