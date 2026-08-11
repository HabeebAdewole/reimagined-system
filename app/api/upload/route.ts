import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  endpoint: process.env.S3_ENDPOINT || undefined,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
})

export const maxDuration = 30 // NFR-04


export async function POST(req: NextRequest) {
  try {
    const { svg, prompt } = await req.json()

    if (!svg || !prompt) {
      return NextResponse.json({ error: 'SVG and prompt are required' }, { status: 400 })
    }

    const svgBuffer = Buffer.from(svg, 'utf-8')
    const fileName = `${crypto.randomUUID()}.svg`
    const filePath = `outputs/${fileName}`
    const fileSize = `${(svgBuffer.byteLength / 1024).toFixed(1)} KB`

    // Upload SVG using standard AWS S3 Client
    const putCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: filePath,
      Body: svgBuffer,
      ContentType: 'image/svg+xml',
    })
    
    await s3Client.send(putCommand)

    // Generate a signed URL valid for 1 hour (NFR-06)
    const getCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: filePath,
    })
    
    const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 })

    // Store metadata in Postgres
    const { error: dbError } = await supabaseAdmin
      .from('generations')
      .insert({
        prompt,
        file_path: filePath,
        file_name: fileName,
        file_size: fileSize,
        created_at: new Date().toISOString(),
      })

    if (dbError) throw dbError

    return NextResponse.json({
      signedUrl,
      fileName,
      fileSize,
      filePath,
    })
  } catch (err) {
    console.error('[/api/upload]', err)

    // Storage misconfiguration is fixable by the operator — retrying never helps.
    const name = (err as { name?: string })?.name
    if (name === 'SignatureDoesNotMatch' || name === 'InvalidAccessKeyId') {
      return NextResponse.json(
        { error: 'S3 credentials rejected. Check S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY / S3_REGION in .env.local.' },
        { status: 502 }
      )
    }
    if (name === 'NoSuchBucket') {
      return NextResponse.json(
        { error: `S3 bucket "${process.env.S3_BUCKET_NAME}" does not exist. Create it in Supabase Storage.` },
        { status: 502 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to upload file. Please try again.' },
      { status: 500 }
    )
  }
}