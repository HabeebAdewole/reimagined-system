/**
 * Stability AI — Text-to-Image (Stable Diffusion 3)
 * Returns a PNG as a Buffer ready to pipe to Vectorizer.AI
 */
export async function generateImage(prompt: string): Promise<Buffer> {
  const apiKey = process.env.STABILITY_API_KEY
  if (!apiKey) throw new Error('STABILITY_API_KEY is not set')

  const form = new FormData()
  form.append('prompt', prompt)
  form.append('output_format', 'png')
  form.append('model', 'sd3.5-large-turbo')
  form.append('aspect_ratio', '1:1')

  const res = await fetch(
    'https://api.stability.ai/v2beta/stable-image/generate/sd3',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'image/*',
      },
      body: form,
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Stability AI error ${res.status}: ${text}`)
  }

  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
