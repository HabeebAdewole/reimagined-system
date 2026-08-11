import axios from 'axios'
import { withRetry } from './retry'
import { requireEnv } from './env'

/**
 * Accepted by the /generate/sd3 endpoint, cheapest to most expensive per image.
 * Omitting `model` makes Stability default to sd3.5-large, the priciest one.
 */
export const STABILITY_MODELS = [
  'sd3.5-flash',
  'sd3.5-medium',
  'sd3.5-large-turbo',
  'sd3.5-large',
] as const

const DEFAULT_MODEL = 'sd3.5-flash'

export async function generateRasterImage(prompt: string): Promise<Buffer> {
  const apiKey = requireEnv('STABILITY_API_KEY')
  const model = process.env.STABILITY_MODEL?.trim() || DEFAULT_MODEL

  if (!STABILITY_MODELS.includes(model as (typeof STABILITY_MODELS)[number])) {
    throw new Error(
      `STABILITY_MODEL="${model}" is not valid. Expected one of: ${STABILITY_MODELS.join(', ')}.`
    )
  }

  const response = await withRetry(() =>
    axios.postForm(
      'https://api.stability.ai/v2beta/stable-image/generate/sd3',
      {
        prompt,
        model,
        output_format: 'png',
        mode: 'text-to-image',
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'image/*',
        },
        responseType: 'arraybuffer',
      }
    ),
    { retries: 3, baseDelay: 1000 }
  )

  return Buffer.from(response.data)
}