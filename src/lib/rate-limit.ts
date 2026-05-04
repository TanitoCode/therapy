import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// In-memory fallback when Redis isn't configured (dev / test)
const memStore = new Map<string, { count: number; resetAt: number }>()

// Lazy singleton limiters keyed by "requests:windowMs"
const limiters = new Map<string, Ratelimit>()

function getLimiter(requests: number, windowMs: number): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }

  const key = `${requests}:${windowMs}`
  if (!limiters.has(key)) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    limiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(requests, `${windowMs / 1000} s`),
        prefix: `rl:${requests}:${windowMs}`,
      }),
    )
  }

  return limiters.get(key)!
}

export async function checkRateLimit(
  identifier: string,
  requests: number,
  windowMs: number,
): Promise<{ success: boolean; remaining: number }> {
  const limiter = getLimiter(requests, windowMs)

  if (limiter) {
    const result = await limiter.limit(identifier)
    return { success: result.success, remaining: result.remaining }
  }

  // In-memory fallback
  const storeKey = `${requests}:${windowMs}:${identifier}`
  const now = Date.now()
  const entry = memStore.get(storeKey)

  if (!entry || now > entry.resetAt) {
    memStore.set(storeKey, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: requests - 1 }
  }

  if (entry.count >= requests) return { success: false, remaining: 0 }

  entry.count++
  return { success: true, remaining: requests - entry.count }
}
