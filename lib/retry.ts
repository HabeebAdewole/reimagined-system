// Retry/backoff utility (NFR-01)
export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, delayMs * (2 ** i))); // Exponential backoff
    }
  }
  throw new Error('Retry failed');
};
