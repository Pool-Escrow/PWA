import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { COOKIE_KEYS } from '@/lib/constants'

// Ensure this handler is never cached, so it always reflects the current state of the cookies
export const dynamic = 'force-dynamic' // Next.js 15: disables HTTP cache in GET

const COOKIE_NAMES = [COOKIE_KEYS.ONBOARDING_COOKIE_KEY, COOKIE_KEYS.PRIVACY_COOKIE_KEY] as const

// Recommended: options consistent with HTTPS domain and SameSite 'lax'
const DEFAULT_OPTS = {
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  httpOnly: false,
} as const

interface TogglePayload { name: (typeof COOKIE_NAMES)[number], value: boolean }

export async function GET() {
  // Synchronous reading is no longer guaranteed: async function new design
  const store = await cookies()
  const result: Record<string, boolean> = {}
  for (const key of COOKIE_NAMES) {
    result[key] = store.has(key)
  }

  return NextResponse.json(result, { status: 200 })
}

export async function POST(request: Request) {
  let body: TogglePayload
  try {
    body = (await request.json()) as TogglePayload
  }
  catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 })
  }

  if (!COOKIE_NAMES.includes(body.name)) {
    return NextResponse.json({ error: 'invalid-cookie-name' }, { status: 400 })
  }

  const res = NextResponse.json({ success: true, name: body.name, value: body.value })
  if (body.value) {
    res.cookies.set(body.name, '1', DEFAULT_OPTS)
  }
  else {
    res.cookies.delete(body.name)
  }
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, cleared: COOKIE_NAMES })
  for (const key of COOKIE_NAMES) {
    res.cookies.delete(key)
  }
  return Promise.resolve(res)
}
