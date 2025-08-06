// hooks/useOnboardingToggle.ts
'use client'
import { useCallback, useEffect, useState } from 'react'
import { API_ROUTES, COOKIE_KEYS } from '@/lib/constants'

async function fetchOnboarding() {
  const r = await fetch(API_ROUTES.USER_COOKIES, {
    credentials: 'include',
    cache: 'no-store',
  })
  if (!r.ok)
    throw new Error(`GET ${r.status}`)
  const data = (await r.json()) as Record<string, boolean>
  return data[COOKIE_KEYS.ONBOARDING_COOKIE_KEY]
}

async function postOnboarding(value: boolean): Promise<boolean> {
  const r = await fetch(API_ROUTES.USER_COOKIES, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: COOKIE_KEYS.ONBOARDING_COOKIE_KEY,
      value,
    }),
  })
  if (!r.ok)
    throw new Error(`POST ${r.status}`)
  return value
}

export default function useOnboarding(): {
  completed: boolean
  setCompleted: () => Promise<void>
  loading: boolean
  error?: Error
} {
  const [completed, setCompletedState] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | undefined>()

  // Fetch initial state on mount
  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const initialValue = await fetchOnboarding()
        setCompletedState(initialValue)
      }
      catch (e: unknown) {
        setError(e as Error)
      }
    }

    void fetchInitialState()
  }, [])

  const setCompleted = useCallback(async () => {
    setLoading(true)
    setError(undefined)
    try {
      const val = await postOnboarding(true)
      setCompletedState(val)
    }
    catch (e: unknown) {
      setError(e as Error)
      throw e
    }
    finally {
      setLoading(false)
    }
  }, [])

  return { completed, setCompleted, loading, error }
}
