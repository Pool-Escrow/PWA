/**
 * @file src/components/pool-list/pool-list.tsx
 * @description component for displaying a list of pools
 */
'use client'

import { usePools } from '@/lib/hooks/use-pools'
import { usePoolStore } from '@/stores/pool.store'
import { useEffect, useState } from 'react'
import PoolListSkeleton from './skeleton'
import dynamic from 'next/dynamic'

const DynamicPoolCard = dynamic(() => import('./pool-list-card'), { ssr: false })

type FilterCriteria<T> = {
    [Key in keyof T]?: T[Key] | T[Key][] | ((value: T[Key]) => boolean)
}

type SortCriteria<K extends keyof Pool> = {
    sortBy: K
    sortOrder?: 'asc' | 'desc'
}

type Comparable = string | number | bigint | Date

type ComparableKeys = {
    [Key in keyof Pool]: Pool[Key] extends Comparable ? Key : never
}[keyof Pool]

const statusPriority: { [key in Pool['status']]: number } = {
    live: 1,
    upcoming: 2,
    past: 3,
}

function compareValues(a: Comparable, b: Comparable, direction: number): number {
    return typeof a === 'string' ? a.localeCompare(b as string) * direction : (Number(a) - Number(b)) * direction
}

function sortPools(pools: Pool[], { sortBy = 'status', sortOrder = 'asc' }: SortCriteria<ComparableKeys>): Pool[] {
    const direction = sortOrder === 'asc' ? 1 : -1

    return [...pools].sort((a, b) => {
        const valueA = sortBy === 'status' ? statusPriority[a.status] : a[sortBy]
        const valueB = sortBy === 'status' ? statusPriority[b.status] : b[sortBy]

        return compareValues(valueA, valueB, direction)
    })
}

function filterPools<T>(items: T[], criteria: FilterCriteria<T>): T[] {
    return items.filter(item => {
        return Object.entries(criteria).every(([key, criterion]) => {
            const value = item[key as keyof T]
            if (Array.isArray(criterion)) {
                return criterion.includes(value)
            } else if (criterion instanceof Function) {
                return criterion(value)
            } else {
                return value === criterion
            }
        })
    })
}

interface PoolListProps {
    limit?: number
    filter?: FilterCriteria<Pool>
    sort?: SortCriteria<ComparableKeys>
}

export default function PoolList({ limit = 7, filter, sort = { sortBy: 'status', sortOrder: 'asc' } }: PoolListProps) {
    const { pools, isLoading, error } = usePoolStore()
    const { data: fetchedPools, isLoading: isFetching, error: fetchError } = usePools()
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)

        if (fetchedPools !== undefined) {
            usePoolStore.getState().setPools(fetchedPools)
        }
        if (fetchError) {
            usePoolStore.getState().setError(fetchError as Error)
        }
    }, [fetchedPools, fetchError])

    if (!isClient || isLoading || isFetching) return <PoolListSkeleton limit={limit} />
    if (error) return <div suppressHydrationWarning>Error: {error.message}</div>
    if (pools.length === 0) return <div>No pools found</div>

    const filteredPools = filter && filterPools(pools, filter)
    const sortedPools = sort && sortPools(filteredPools || pools, sort)
    const visiblePools = (sortedPools || pools).slice(0, limit)

    return (
        <div className='flex flex-col gap-4'>
            {visiblePools.map(pool => {
                return <DynamicPoolCard key={pool.id} {...pool} />
            })}
        </div>
    )
}
