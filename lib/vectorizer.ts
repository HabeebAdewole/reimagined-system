import axios from 'axios'
import FormData from 'form-data'
import { withRetry } from './retry'
import { requireEnv } from './env'

export async function vectorizeImage(imageBuffer: Buffer): Promise<Buffer> {
  const apiId = requireEnv('VECTORIZER_API_ID')
  const apiSecret = requireEnv('VECTORIZER_API_SECRET')

  const form = new FormData()
  form.append('image', imageBuffer, {
    filename: 'input.png',
    contentType: 'image/png',
  })
  form.append('mode', 'test')

  const response = await withRetry(() =>
    axios.post('https://vectorizer.ai/api/v1/vectorize', form, {
      auth: {
        username: apiId,
        password: apiSecret,
      },
      headers: form.getHeaders(),
      responseType: 'arraybuffer',
    }),
    { retries: 3, baseDelay: 1000 }
  )

  return Buffer.from(response.data)
}