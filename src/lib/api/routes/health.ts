import type { ApiResponse, HealthResponse } from '../types'
import { Hono } from 'hono'

const health = new Hono()

// Health check endpoint
health.get('/', async (c) => {
  const startTime = process.hrtime.bigint()

  const response: ApiResponse<HealthResponse> = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: Date.now(),
      version: '1.0.0',
      uptime: process.uptime(),
    },
    meta: {
      timestamp: Date.now(),
      chainId: 0, // Health check is chain-agnostic
    },
  }

  const endTime = process.hrtime.bigint()
  const duration = Number(endTime - startTime) / 1000000 // Convert to ms

  c.res.headers.set('X-Response-Time', `${duration}ms`)

  return c.json(response)
})

export { health }
