'use client'

import { useEffect, useState } from 'react'
import PoolCard from './pool-list-card'
import PoolListSkeleton from './skeleton'

const useMockedPools = () => {
	const [isLoading, setIsLoading] = useState(true)

	const pools: Pool[] = [
		{
			id: 1n,
			name: 'Pool 1',
			status: 'upcoming',
			// it starts in 1 day and ends in 2 days
			startTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
			endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
		},
		{
			id: 2n,
			name: 'Pool 2',
			status: 'upcoming',
			// it starts in 30 minutes and ends in 1 hour
			startTime: new Date(Date.now() + 1000 * 60 * 30),
			endTime: new Date(Date.now() + 1000 * 60 * 60),
		},
		{
			id: 3n,
			name: 'Pool 3',
			status: 'past',
			// it started 1 week ago and ended 40 seconds ago
			startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
			endTime: new Date(Date.now() - 1000 * 40),
		},
		{
			id: 4n,
			name: 'Pool 4',
			status: 'past',
			// it started 2 days ago and ended 1 day ago
			startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
			endTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
		},
		{
			id: 5n,
			name: 'Pool 5',
			status: 'live',
			// it started 1 day ago and ends in 1 day
			startTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
			endTime: new Date(Date.now() + 1000 * 60 * 60 * 24),
		},
		{
			id: 6n,
			name: 'Pool 6',
			status: 'live',
			// it started 2 hours ago and ends in 3 hours
			startTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
			endTime: new Date(Date.now() + 1000 * 60 * 60 * 3),
		},
	]

	const error: { message: string } | null =
		Math.random() > 1 ? { message: 'Error' } : null

	useEffect(() => {
		setTimeout(() => {
			setIsLoading(false)
		}, 600)
	}, [])

	return { pools, isLoading, error }
}

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

function compareValues(
	a: Comparable,
	b: Comparable,
	direction: number,
): number {
	return typeof a === 'string'
		? a.localeCompare(b as string) * direction
		: (Number(a) - Number(b)) * direction
}

function sortPools(
	pools: Pool[],
	{ sortBy = 'status', sortOrder = 'asc' }: SortCriteria<ComparableKeys>,
): Pool[] {
	const direction = sortOrder === 'asc' ? 1 : -1

	return [...pools].sort((a, b) => {
		const valueA = sortBy === 'status' ? statusPriority[a.status] : a[sortBy]
		const valueB = sortBy === 'status' ? statusPriority[b.status] : b[sortBy]

		return compareValues(valueA, valueB, direction)
	})
}

function filterPools<T>(items: T[], criteria: FilterCriteria<T>): T[] {
	return items.filter((item) => {
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

export default function PoolList({
	limit = 7,
	filter,
	sort = { sortBy: 'status', sortOrder: 'asc' },
}: PoolListProps) {
	// const { pools = [], isLoading, error } = usePools()
	const { pools, isLoading, error } = useMockedPools()

	if (isLoading) return <PoolListSkeleton limit={limit} />
	if (error) return <div>Error: {error.message}</div>
	if (pools?.length === 0) return <div>No pools found</div>

	const filteredPools = filter && filterPools(pools, filter)
	const sortedPools = sort && sortPools(filteredPools || pools, sort)
	const visiblePools = (sortedPools || pools).slice(0, limit)

	return (
		<div className='flex flex-col flex-grow mt-3 w-full h-full space-y-4'>
			{visiblePools.map((pool) => {
				if (!pool) return null
				return <PoolCard key={pool.id} {...pool} />
			})}
		</div>
	)
}
