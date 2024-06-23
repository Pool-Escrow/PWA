/**
 * @file src/providers/pool-store.provider.tsx
 * @description pool store provider
 */
'use client'

import { usePoolStore } from '@/stores/pool.store'
import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'

export const PoolStoreProvider = ({ children }: PropsWithChildren) => {
    const { fetchPools } = usePoolStore()

    useEffect(() => {
        fetchPools()
    }, [fetchPools])

    return <>{children}</>
}
