import { NextRequest, NextResponse } from 'next/server'
import { vectorizeImage } from '@/lib/vectorizer'

export const maxDuration = 60 // NFR-04

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json()

    if (!image) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 })
    }

    const imageBuffer = Buffer.from(image, 'base64')
    const svgBuffer = await vectorizeImage(imageBuffer)

    return NextResponse.json({
      svg: svgBuffer.toString('base64'),
    })
  } catch (err) {
    console.error('[/api/vectorize]', err)
    return NextResponse.json(
      { error: 'Failed to vectorize image. Please try again.' },
      { status: 500 }
    )
  }
}