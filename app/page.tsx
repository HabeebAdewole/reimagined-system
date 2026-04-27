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
      // Step 1 & 2 — Generate raster image and vectorize
      const generateVectorRes = await fetch('/api/generate-vector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!generateVectorRes.ok) {
        const { error } = await generateVectorRes.json()
        throw new Error(error || 'Failed to generate vector image')
      }

      let { svg } = await generateVectorRes.json()


      // Create local blob URL for immediate display
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const localSvgUrl = URL.createObjectURL(blob)

      const tempFileName = `vectogen-${Date.now()}.svg`
      const tempFileSize = `${(svg.length / 1024).toFixed(2)} KB`

      // Show immediately
      updateAiMessage(aiId, {
        status: 'done',
        svgUrl: localSvgUrl,
        fileName: tempFileName,
        fileSize: tempFileSize,
      })

      // Step 3 — Upload SVG + metadata to Supabase in the background
      fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ svg, prompt }),
      })
        .then(async (uploadRes) => {
          if (!uploadRes.ok) {
            console.error('Failed to upload file to database in background')
            return
          }
          const { signedUrl, fileName, fileSize } = await uploadRes.json()
          // Update the message with the permanent URL and actual metadata
          updateAiMessage(aiId, {
            svgUrl: signedUrl,
            fileName,
            fileSize,
          })
        })
        .catch((err) => console.error('Background upload error:', err))
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