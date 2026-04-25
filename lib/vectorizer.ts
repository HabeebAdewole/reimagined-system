/**
 * Vectorizer.AI — Raster PNG → SVG
 * Sends the PNG buffer and returns the SVG as a string
 */
export async function vectorizeImage(imageBuffer: Buffer): Promise<string> {
  const apiId = process.env.VECTORIZER_API_ID
  const apiSecret = process.env.VECTORIZER_API_SECRET
  if (!apiId || !apiSecret) throw new Error('VECTORIZER_API_ID or VECTORIZER_API_SECRET is not set')

  const form = new FormData()
  const blob = new Blob([new Uint8Array(imageBuffer)], { type: 'image/png' })
  form.append('image', blob, 'input.png')
  form.append('output.file_format', 'svg')

  const credentials = Buffer.from(`${apiId}:${apiSecret}`).toString('base64')

  const res = await fetch('https://api.vectorizer.ai/api/v1/vectorize', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
    },
    body: form,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Vectorizer.AI error ${res.status}: ${text}`)
  }

  return res.text()
}
