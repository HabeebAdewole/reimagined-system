export interface RetryOptions {
  retries?: number
  baseDelay?: number
  maxDelay?: number
}

/**
 * A 4xx means the request itself is wrong (bad key, bad payload) — replaying it
 * unchanged always fails, so retrying just delays the error. 408 and 429 are the
 * exceptions: those genuinely do clear on a later attempt.
 */
function isRetryable(err: unknown): boolean {
  const status = (err as { response?: { status?: number } })?.response?.status
  if (typeof status !== 'number') return true // network/timeout — worth retrying
  if (status === 408 || status === 429) return true
  return status < 400 || status >= 500
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
      if (attempt === retries || !isRetryable(err)) break

      // Exponential backoff with jitter
      const delay = Math.min(baseDelay * 2 ** attempt + Math.random() * 200, maxDelay)
      console.warn(`Attempt ${attempt + 1} failed. Retrying in ${Math.round(delay)}ms…`)
      await new Promise(res => setTimeout(res, delay))
    }
  }

  throw lastError
}