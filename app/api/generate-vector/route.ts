import { NextRequest, NextResponse } from 'next/server'
import { generateRasterImage } from '@/lib/stability'
import { vectorizeImage } from '@/lib/vectorizer'
import { MissingEnvError } from '@/lib/env'

// Max duration for the combined API route
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Step 1: Generate Raster Image Buffer Directly
    const imageBuffer = await generateRasterImage(prompt.trim())

    // Step 2: Vectorize Raster Image to SVG
    const svgBuffer = await vectorizeImage(imageBuffer)

    // Return the SVG encoded as Base64 to the client directly
    return NextResponse.json({
      svg: svgBuffer.toString('utf-8'),
    })
  } catch (err) {
    console.error('[/api/generate-vector]', err)

    // Config problems are fixable by the operator, not by retrying — say so.
    if (err instanceof MissingEnvError) {
      return NextResponse.json({ error: err.message }, { status: 500 })
    }

    const status = (err as { response?: { status?: number } })?.response?.status
    if (status === 401 || status === 403) {
      return NextResponse.json(
        { error: 'Upstream API rejected the credentials (HTTP 401/403). Check your API keys in .env.local.' },
        { status: 502 }
      )
    }
    if (status === 402) {
      return NextResponse.json(
        { error: 'Out of upstream API credits. Top up your Stability AI account at https://platform.stability.ai/account/credits.' },
        { status: 502 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate vector image. Please try again.' },
      { status: 500 }
    )
  }
}
