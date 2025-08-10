'use client'

import { useCallback, useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { API_ROUTES, COOKIE_KEYS } from '@/lib/constants'

interface PrivacyStore {
  hidden: boolean
  toggle: () => void
  show: () => void
  hide: () => void
}

const usePrivacyStore = create<PrivacyStore>()(
  persist(
    set => ({
      hidden: false,
      toggle: () => set(state => ({ hidden: !state.hidden })),
      show: () => set({ hidden: false }),
      hide: () => set({ hidden: true }),
    }),
    {
      name: 'privacy-store',
    },
  ),
)

async function fetchPrivacyCookie(): Promise<boolean> {
  const response = await fetch(API_ROUTES.USER_COOKIES, {
    credentials: 'include',
    cache: 'no-store',
  })
  if (!response.ok)
    throw new Error(`GET ${response.status}`)
  const data = (await response.json()) as Record<string, boolean>
  return Boolean(data[COOKIE_KEYS.PRIVACY_COOKIE_KEY])
}

async function postPrivacyCookie(value: boolean): Promise<boolean> {
  const response = await fetch(API_ROUTES.USER_COOKIES, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: COOKIE_KEYS.PRIVACY_COOKIE_KEY,
      value,
    }),
  })
  if (!response.ok)
    throw new Error(`POST ${response.status}`)
  return value
}

export default function usePrivacy() {
  const store = usePrivacyStore()

  // Initialize from cookie on mount
  useEffect(() => {
    let isMounted = true
    const init = async () => {
      try {
        const cookieHidden = await fetchPrivacyCookie()
        if (!isMounted)
          return
        const { hide, show } = usePrivacyStore.getState()
        if (cookieHidden)
          hide()
        else show()
      }
      catch {
        // ignore network errors; keep persisted state
      }
    }
    void init()
    return () => {
      isMounted = false
    }
  }, [])

  // Wrap actions to also persist cookie state
  const toggle = useCallback(() => {
    const nextHidden = !store.hidden
    store.toggle()
    void postPrivacyCookie(nextHidden)
  }, [store])

  const show = useCallback(() => {
    store.show()
    void postPrivacyCookie(false)
  }, [store])

  const hide = useCallback(() => {
    store.hide()
    void postPrivacyCookie(true)
  }, [store])

  return { hidden: store.hidden, toggle, show, hide }
}
