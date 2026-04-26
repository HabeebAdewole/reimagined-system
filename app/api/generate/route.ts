import { NextRequest, NextResponse } from 'next/server'
import { generateRasterImage } from '@/lib/stability'

export const maxDuration = 60 // Vercel function timeout (NFR-04)

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const imageBuffer = await generateRasterImage(prompt.trim())

    // Return the raster image as base64 so the next route can use it
    return NextResponse.json({
      image: imageBuffer.toString('base64'),
      mimeType: 'image/png',
    })
  } catch (err) {
    console.error('[/api/generate]', err)
    return NextResponse.json(
      { error: 'Failed to generate image. Please try again.' },
      { status: 500 }
    )
  }
}