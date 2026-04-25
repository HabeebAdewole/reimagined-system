import axios from 'axios'
import FormData from 'form-data'
import { withRetry } from './retry'

export async function vectorizeImage(imageBuffer: Buffer): Promise<Buffer> {
  const form = new FormData()
  form.append('image', imageBuffer, {
    filename: 'input.png',
    contentType: 'image/png',
  })
  form.append('mode', 'test')

  const response = await withRetry(() =>
    axios.post('https://vectorizer.ai/api/v1/vectorize', form, {
      auth: {
        username: process.env.VECTORIZER_API_ID!,
        password: process.env.VECTORIZER_API_SECRET!,
      },
      headers: form.getHeaders(),
      responseType: 'arraybuffer',
    }),
    { retries: 3, baseDelay: 1000 }
  )

  return Buffer.from(response.data)
}