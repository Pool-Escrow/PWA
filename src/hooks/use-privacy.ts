'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

export default function usePrivacy() {
  return usePrivacyStore()
}
