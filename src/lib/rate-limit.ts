import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

interface RateLimitRecord {
  count: number
  resetTime: number
}

// Store map globally to prevent resetting during development HMR
const globalForRateLimit = global as unknown as {
  rateLimitMap?: Map<string, RateLimitRecord>
  redisClient?: Redis
  ratelimiters?: Map<string, Ratelimit>
}

if (!globalForRateLimit.rateLimitMap) {
  globalForRateLimit.rateLimitMap = new Map()
}

const rateLimitMap = globalForRateLimit.rateLimitMap

// Initialize Redis client once and store globally for HMR in dev
if (!globalForRateLimit.redisClient && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  globalForRateLimit.redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

if (!globalForRateLimit.ratelimiters) {
  globalForRateLimit.ratelimiters = new Map()
}

const redis = globalForRateLimit.redisClient
const ratelimiters = globalForRateLimit.ratelimiters

function getRatelimiter(limit: number, windowMs: number): Ratelimit | null {
  if (!redis) return null
  const key = `${limit}-${windowMs}`
  if (!ratelimiters.has(key)) {
    // Convert windowMs to string representation like "300s"
    const windowSeconds = Math.ceil(windowMs / 1000)
    ratelimiters.set(
      key,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
        analytics: true,
        prefix: '@upstash/ratelimit/pelindo-survey',
      })
    )
  }
  return ratelimiters.get(key)!
}

/**
 * Basic in-memory rate limiter fallback.
 */
function localRateLimit(ip: string, limit: number, windowMs: number) {
  const now = Date.now()

  // Clean up expired records to prevent memory leak when map grows large
  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetTime) {
        rateLimitMap.delete(key)
      }
    }
  }

  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    const newRecord = {
      count: 1,
      resetTime: now + windowMs,
    }
    rateLimitMap.set(ip, newRecord)
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: newRecord.resetTime,
    }
  }

  record.count += 1
  const remaining = Math.max(0, limit - record.count)

  if (record.count > limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: record.resetTime,
    }
  }

  return {
    success: true,
    limit,
    remaining,
    reset: record.resetTime,
  }
}

/**
 * Rate limiter supporting both Upstash Redis (serverless safe) and in-memory fallback.
 * 
 * @param ip IP address of the requester
 * @param limit Maximum number of requests allowed in the window
 * @param windowMs Time window in milliseconds
 */
export async function rateLimit(ip: string, limit: number, windowMs: number) {
  const limiter = getRatelimiter(limit, windowMs)
  
  if (limiter) {
    try {
      const result = await limiter.limit(ip)
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      }
    } catch (error) {
      console.error('[Rate Limit] Upstash Redis error, falling back to local memory limit:', error)
      // Fall through to in-memory rate limit
    }
  }

  return localRateLimit(ip, limit, windowMs)
}
