'use client'

import { useEffect, useState } from 'react'
import type { Message } from '@/app/page'

interface AiMessageProps {
  message: Extract<Message, { role: 'ai' }>
}

const stages = [
  'Generating raster image…',
  'Converting vector artwork…',
  'Finalizing storage layer…',
]

export default function AiMessage({ message }: AiMessageProps) {
  const [stage, setStage] = useState(0)
  const [progress, setProgress] = useState(8)

  useEffect(() => {
    if (message.status !== 'thinking') return

    const interval = setInterval(() => {
      setProgress(prev => {
        // Slow down progress after certain caps
        const cap = stage === 0 ? 38 : stage === 1 ? 72 : 93
        const next = Math.min(prev + Math.random() * 16, cap)
        if (next >= 35 && stage === 0) setStage(1)
        if (next >= 70 && stage === 1) setStage(2)
        return next
      })
    }, 450) // slightly slower to match the new combined wait time

    return () => clearInterval(interval)
  }, [message.status, stage])

  if (message.status === 'thinking') {
    return (
      <div className="max-w-[760px] mx-auto px-6 py-2">
        <div className="text-sm text-[#8e8ea0] mb-3 flex items-center gap-3 font-medium tracking-wide">
          <span className="w-2 h-2 rounded-full bg-[#1a7f3c] inline-block animate-pulse shadow-[0_0_8px_#1a7f3c]" />
          <span className="animate-pulse">{stages[stage]}</span>
        </div>
        <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden max-w-[400px] shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-[#1a7f3c] to-[#22c55e] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>
    )
  }

  if (message.status === 'done' && message.svgUrl) {
    return (
      <div className="max-w-[760px] mx-auto px-6 py-3 font-sans">
        <p className="text-[14px] text-[#8e8ea0]">
          Here&apos;s your SVG for <span className="text-[#ececec]">&quot;{message.prompt}&quot;</span>
        </p>

        <div className="mt-[12px] max-w-[560px] w-full bg-[#1a1a1a] rounded-[16px] overflow-hidden flex flex-col border border-[#2a2a2a]">
          
          {/* SVG Preview Area */}
          <div 
             className="w-full min-h-[260px] flex items-center justify-center p-[32px]"
             style={{
               backgroundImage: 'repeating-conic-gradient(#1e1e1e 0% 25%, #161616 0% 50%)',
               backgroundSize: '40px 40px',
             }}
          >
            <img
              src={message.svgUrl}
              alt={message.prompt || 'Generated SVG'}
              className="max-w-full max-h-[240px] object-contain"
            />
          </div>

          {/* Divider */}
          <div className="h-[1px] w-full bg-[#2a2a2a]" />

          {/* Footer Row */}
          <div className="h-[52px] px-[16px] flex items-center justify-between bg-[#1a1a1a]">
            {/* Left side */}
            <div className="flex flex-col justify-center">
              <span className="text-[#ececec] text-[13px] font-medium leading-[1.2]">
                {message.fileName || 'output.svg'}
              </span>
              <span className="text-[#8e8ea0] text-[12px] font-normal leading-[1.2] mt-[2px]">
                {message.fileSize ? `${message.fileSize}` : '14.2 KB'} &middot; just now
              </span>
            </div>

            {/* Right side */}
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
                  a.download = message.fileName || 'output.svg'
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                } catch (err) {
                  console.error('Download failed', err)
                  window.open(message.svgUrl, '_blank')
                }
              }}
              className="flex items-center gap-[6px] bg-[#166832] hover:bg-[#1a7f3c] text-[13px] font-medium rounded-full px-[16px] py-[8px] transition-colors shrink-0"
              style={{ color: '#ffffff', textDecoration: 'none' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  return (
    <div className="max-w-[760px] mx-auto px-6 py-2">
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-500 max-w-[480px] flex items-center gap-3">
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <span>{message.error || 'Something went wrong. Please try again.'}</span>
      </div>
    </div>
  )
}