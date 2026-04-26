export interface RetryOptions {
  retries?: number
  baseDelay?: number
  maxDelay?: number
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { retries = 3, baseDelay = 500, maxDelay = 5000 } = options
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt === retries) break

      // Exponential backoff with jitter
      const delay = Math.min(baseDelay * 2 ** attempt + Math.random() * 200, maxDelay)
      console.warn(`Attempt ${attempt + 1} failed. Retrying in ${Math.round(delay)}ms…`)
      await new Promise(res => setTimeout(res, delay))
    }
  }

  throw lastError
}