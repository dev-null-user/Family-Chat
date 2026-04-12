import { Redis } from 'ioredis'
import { env } from '../config/env.js'

let client: Redis | null = null

export function getRedis(): Redis {
  if (!client) {
    client = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null })
  }
  return client
}

export async function closeRedis(): Promise<void> {
  if (client) {
    await client.quit()
    client = null
  }
}

const REFRESH_PREFIX = 'refresh:'

export async function storeRefreshSession(jti: string, userId: string, ttlSeconds: number): Promise<void> {
  const r = getRedis()
  await r.setex(`${REFRESH_PREFIX}${jti}`, ttlSeconds, userId)
}

export async function getRefreshUserId(jti: string): Promise<string | null> {
  const r = getRedis()
  return r.get(`${REFRESH_PREFIX}${jti}`)
}

export async function revokeRefreshSession(jti: string): Promise<void> {
  const r = getRedis()
  await r.del(`${REFRESH_PREFIX}${jti}`)
}
