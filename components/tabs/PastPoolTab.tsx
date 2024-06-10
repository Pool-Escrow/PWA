import React, { useEffect, useState } from 'react'
import rightArrow from '@/public/images/right_arrow.svg'
import PoolRow from '../poolRow'
import { getSupabaseBrowserClient } from '@/utils/supabase/client'
import { fetchPastPools } from '@/lib/api/clientAPI'
import router from 'next/router'
import { poolData } from '@/types/types'

const supabase = getSupabaseBrowserClient()

const PastPoolTab: React.FC = () => {
	const [poolsData, setPoolsData] = useState<poolData[] | undefined>([])

	const fetchPoolsData = async () => {
		const retrievedPoolsData = await fetchPastPools()
		console.log('poolData', retrievedPoolsData)
		setPoolsData(retrievedPoolsData)
	}

	useEffect(() => {
		fetchPoolsData()
	}, [])

	return (
		<div className='flex flex-col flex-grow mt-8 w-full h-full space-y-4'>
			{poolsData?.map((pool) => {
				return (
					<PoolRow
						key={pool.pool_id}
						title={pool.pool_name}
						poolImagePath={pool.pool_image_url}
						registered={pool.participant_count}
						capacity={pool.soft_cap}
						startTime={pool.event_timestamp}
						poolId={pool.pool_id}
					/>
				)
			})}
		</div>
	)
}

export default PastPoolTab
