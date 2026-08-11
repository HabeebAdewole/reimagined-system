/**
 * Thrown when a required environment variable is missing.
 * Callers can distinguish this from a genuine upstream failure so the UI
 * shows a fixable message instead of "please try again".
 */
export class MissingEnvError extends Error {
  constructor(public readonly key: string) {
    super(`${key} is not set. Add it to .env.local and restart the dev server.`)
    this.name = 'MissingEnvError'
  }
}

export function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new MissingEnvError(key)
  return value
}
