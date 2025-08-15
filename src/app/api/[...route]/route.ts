import { handle } from 'hono/vercel'
import { app } from '@/lib/api/app'

// Export the Hono app as a Next.js API route handler
export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
export const PATCH = handle(app)
export const OPTIONS = handle(app)
