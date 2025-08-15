import type { ApiResponse } from './types'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { timing } from 'hono/timing'
import { chainLogger } from '@/lib/backend/logger'
import { env } from '@/lib/env/server'

// Import route handlers
import { health } from './routes/health'
import { participants } from './routes/participants'
import { pools } from './routes/pools'
import { users } from './routes/users'

// Create the main Hono app
export const app = new Hono()

// Global middleware
app.use('*', logger())
app.use('*', timing())
app.use('*', secureHeaders())

// CORS configuration
app.use('*', cors({
  origin: env.NODE_ENV === 'production'
    ? ['https://your-production-domain.com'] // Update with your production domains
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
}))

// Global error handler
app.onError((err, c) => {
  chainLogger.error('API Error', err, 0, {
    path: c.req.path,
    method: c.req.method,
    userAgent: c.req.header('user-agent'),
  })

  if (err instanceof HTTPException) {
    return c.json({
      success: false,
      error: {
        code: 'HTTP_ERROR',
        message: err.message,
      },
      meta: {
        timestamp: Date.now(),
        chainId: 0,
      },
    } satisfies ApiResponse, err.status)
  }

  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    },
    meta: {
      timestamp: Date.now(),
      chainId: 0,
    },
  } satisfies ApiResponse, 500)
})

// Mount route handlers
app.route('/api/health', health)
app.route('/api/pools', pools)
app.route('/api/participants', participants)
app.route('/api/users', users)

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
    meta: {
      timestamp: Date.now(),
      chainId: 0,
    },
  } satisfies ApiResponse, 404)
})

// API info endpoint
app.get('/', async (c) => {
  return c.json({
    success: true,
    data: {
      name: 'Pool API',
      version: '1.0.0',
      description: 'REST API for Pool smart contract interactions',
      endpoints: {
        health: '/health',
        pools: '/pools/:chainId/:poolId',
        poolDetails: '/pools/:chainId/:poolId/details',
        participants: '/participants/:chainId/:poolId/:address',
        userRoles: '/users/:address/roles',
        userBalances: '/users/:address/balances',
      },
    },
    meta: {
      timestamp: Date.now(),
      chainId: 0,
    },
  } satisfies ApiResponse)
})

// Export the app for use in other files
export default app
