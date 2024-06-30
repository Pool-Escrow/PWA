// src/stores/create-pool.store.ts

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface PoolDraft {
    bannerImage: string
    name: string
    dateRange: { start: string; end: string }
    description: string
    price: string
    softCap: string
    termsURL: string
}

type CreatePoolStoreState = {
    draftPool: PoolDraft
    error: Error | null
    isHydrated: boolean
}

type CreatePoolStoreActions = {
    setDraftPool: (field: keyof PoolDraft, value: any) => void
    setError: (error: Error | null) => void
    resetDraftPool: () => void
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

const initialDraftPool: PoolDraft = {
    bannerImage: '',
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
                draftPool: initialDraftPool,
                error: null,
                isHydrated: false,
                setDraftPool: (field, value) =>
                    set(state => ({
                        draftPool: {
                            ...state.draftPool,
                            [field]: value,
                        },
                    })),
                setError: (error: Error | null) => set({ error }),
                resetDraftPool: () => set({ draftPool: initialDraftPool }),
                setHydrated: (state: boolean) => set({ isHydrated: state }),
            }),
            { name: 'create-pool-store' },
        ),
    ),
)
