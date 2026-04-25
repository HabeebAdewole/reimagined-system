import axios from 'axios'
import { withRetry } from './retry'

export async function generateRasterImage(prompt: string): Promise<Buffer> {
  const response = await withRetry(() =>
    axios.postForm(
      'https://api.stability.ai/v2beta/stable-image/generate/sd3',
      {
        prompt,
        output_format: 'png',
        mode: 'text-to-image',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
          Accept: 'image/*',
        },
        responseType: 'arraybuffer',
      }
    ),
    { retries: 3, baseDelay: 1000 }
  )

  return Buffer.from(response.data)
}