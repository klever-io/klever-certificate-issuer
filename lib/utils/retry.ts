export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  let attempt = 0
  while (attempt < retries) {
    try {
      return await fn()
    } catch {
      attempt++
      if (attempt === retries) {
        throw new Error('All retries failed')
      }
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error('Retry failed')
}
