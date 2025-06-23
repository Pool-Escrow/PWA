// src/stores/create-pool.store.ts

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface PoolDraft {
    bannerImage: string | null
    name: string
    dateRange: { start: string; end: string }
    description: string
    price: string
    softCap: string
    termsURL: string
}

type CreatePoolStoreState = {
    poolDraft: PoolDraft
    error: Error | null
    isHydrated: boolean
}

type DateRange = {
    start: string
    end: string
}

type CreatePoolStoreActions = {
    setPoolDraft: (field: keyof PoolDraft, value: string | DateRange | null | undefined) => void
    setError: (error: Error | null) => void
    resetPoolDraft: () => void
    setHydrated: (state: boolean) => void
}

const getDefaultDateTimeValue = () => {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    return {
        start: now.toISOString().split('.')[0],
        end: tomorrow.toISOString().split('.')[0],
    }
}

const initialPoolDraft: PoolDraft = {
    bannerImage: null,
    name: '',
    dateRange: getDefaultDateTimeValue(),
    description: '',
    price: '',
    softCap: '',
    termsURL: '',
}

export const useCreatePoolStore = create<CreatePoolStoreState & CreatePoolStoreActions>()(
    devtools(
        persist(
            set => ({
                poolDraft: initialPoolDraft,
                error: null,
                isHydrated: false,
                setPoolDraft: (field, value) =>
                    set(state => ({
                        poolDraft: {
                            ...state.poolDraft,
                            [field]: value,
                        },
                    })),
                setError: (error: Error | null) => set({ error }),
                resetPoolDraft: () => set({ poolDraft: initialPoolDraft }),
                setHydrated: (state: boolean) => set({ isHydrated: state }),
            }),
            { name: 'create-pool-store' },
        ),
    ),
)
