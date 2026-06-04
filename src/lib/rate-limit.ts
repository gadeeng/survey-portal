interface RateLimitRecord {
  count: number
  resetTime: number
}

// Store map globally to prevent resetting during development HMR
const globalForRateLimit = global as unknown as {
  rateLimitMap?: Map<string, RateLimitRecord>
}

if (!globalForRateLimit.rateLimitMap) {
  globalForRateLimit.rateLimitMap = new Map()
}

const rateLimitMap = globalForRateLimit.rateLimitMap

/**
 * Basic in-memory rate limiter.
 * 
 * @param ip IP address of the requester
 * @param limit Maximum number of requests allowed in the window
 * @param windowMs Time window in milliseconds
 */
export function rateLimit(ip: string, limit: number, windowMs: number) {
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
