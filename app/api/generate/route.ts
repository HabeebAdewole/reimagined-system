import { NextResponse } from 'next/server'
import { generateImage } from '@/lib/stability'
import { withRetry } from '@/lib/retry'

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 })
    }

    const imageBuffer = await withRetry(() => generateImage(prompt))
    const base64 = imageBuffer.toString('base64')

    return NextResponse.json({ image: base64 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/generate]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
