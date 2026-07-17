import RateLimit from "../models/RateLimit";

/**
 * Atomic MongoDB-based rate limiter.
 * @param {string} ip Client IP address
 * @param {string} action Action identifier (e.g. 'login', 'register')
 * @param {number} maxPoints Maximum request attempts allowed in the window
 * @param {number} durationSeconds Duration of the rate limiting window in seconds
 * @returns {Promise<{allowed: boolean, remaining: number, resetTime: Date}>}
 */
export async function limitRate(ip, action, maxPoints, durationSeconds) {
  const key = `${ip}:${action}`;
  const now = new Date();

  // Look up existing rate limit record
  let record = await RateLimit.findOne({ key });

  if (!record) {
    const expireAt = new Date(now.getTime() + durationSeconds * 1000);
    try {
      record = await RateLimit.create({
        key,
        points: 1,
        expireAt,
      });
      return {
        allowed: true,
        remaining: maxPoints - 1,
        resetTime: expireAt,
      };
    } catch (err) {
      // In case of parallel request collision, find the record created by the other request
      if (err.code === 11000) {
        record = await RateLimit.findOne({ key });
      } else {
        throw err;
      }
    }
  }

  // Safe fallback if TTL index has not deleted expired record yet
  if (record.expireAt < now) {
    const expireAt = new Date(now.getTime() + durationSeconds * 1000);
    await RateLimit.updateOne(
      { key },
      { $set: { points: 1, expireAt } }
    );
    return {
      allowed: true,
      remaining: maxPoints - 1,
      resetTime: expireAt,
    };
  }

  // Check if limit is exceeded
  if (record.points >= maxPoints) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.expireAt,
    };
  }

  // Increment points atomically
  await RateLimit.updateOne(
    { key },
    { $inc: { points: 1 } }
  );

  return {
    allowed: true,
    remaining: maxPoints - (record.points + 1),
    resetTime: record.expireAt,
  };
}

/**
 * Nuxt Nitro route helper to check rate limits.
 * Throws H3 error if limits are exceeded.
 */
export async function checkRateLimit(event, action, maxPoints, durationSeconds) {
  const req = event.node.req;
  const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
             req.headers["x-real-ip"] ||
             req.socket.remoteAddress ||
             "127.0.0.1";

  const rate = await limitRate(ip, action, maxPoints, durationSeconds);

  if (!rate.allowed) {
    throw createError({
      statusCode: 429,
      statusMessage: "Too Many Requests",
      message: `Too many attempts for ${action}. Please try again after ${rate.resetTime.toLocaleTimeString()}`,
    });
  }

  return rate;
}
