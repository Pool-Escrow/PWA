export default function ClaimablePoolRow() {
	return <div>ClaimablePoolRow</div>
}

// import circleTick from '@/public/images/circle-tick.svg'
// import frogImage from '@/public/images/frog.png'
// import Image from 'next/image'

// import {
// 	fetchAllPoolDataFromDB,
// 	fetchWinnersDetailsFromSC,
// } from '@/lib/api/clientAPI'
// import {
// 	getAllIndicesMatching,
// 	getRowsByColumnValue,
// 	getValuesFromIndices,
// } from '@/lib/utils'
// import { useQuery } from '@tanstack/react-query'
// import { ethers } from 'ethers'
// import * as _ from 'lodash'

// import { useWallets } from '@privy-io/react-auth'

// interface ClaimablePoolRowProps {
// 	poolId: string
// }

// const ClaimablePoolRow: React.FC<ClaimablePoolRowProps> = ({ poolId }) => {
// 	const { wallets } = useWallets()

// 	const { data: poolData } = useQuery({
// 		queryKey: ['fetchAllPoolDataFromDB', poolId],
// 		queryFn: fetchAllPoolDataFromDB,
// 		enabled: !_.isEmpty(poolId),
// 	})

// 	const { data: poolWinnersDetails } = useQuery({
// 		queryKey: ['fetchWinnersDetailsFromSC', poolId?.toString() ?? ' '],
// 		queryFn: fetchWinnersDetailsFromSC,
// 		enabled: !!poolId,
// 	})
// 	const matchingAddressIndices = getAllIndicesMatching(
// 		poolWinnersDetails?.[0],
// 		wallets?.[0]?.address,
// 	)
// 	const userWonDetails = getValuesFromIndices(
// 		poolWinnersDetails?.[1],
// 		matchingAddressIndices,
// 	)

// 	const claimableDetails = getRowsByColumnValue(userWonDetails, 3, false)
// 	const totalWinningAmount = userWonDetails?.reduce(
// 		(acc: number, curr: any) => acc + curr[0],
// 		BigInt(0),
// 	)

// 	return (
// 		<div className='flex flex-row space-x-4 py-4'>
// 			<Image
// 				src={`${poolData?.poolImageUrl ?? frogImage.src}`}
// 				className=' flex rounded-xl w-14 h-14 object-cover'
// 				alt='avatar'
// 				width={56}
// 				height={56}
// 			/>
// 			<div className='flex flex-1 flex-col '>
// 				<h4 className='font-medium text-lg '>
// 					{poolData?.poolDBInfo?.['pool_name'] ?? ` Pool Id ${poolId}`}
// 				</h4>
// 				<p className={`fontCheckedIn font-semibold`}>Winner</p>
// 			</div>
// 			{
// 				<div className='flex flex-row items-center justify-center space-x-2'>
// 					<div>
// 						<Image
// 							className='w-6 h-6'
// 							src={circleTick.src}
// 							alt='circle-tick'
// 							height={24}
// 							width={24}
// 						/>
// 					</div>
// 					<div className='rounded-2xl paidBackground px-6 py-4 fontCheckedIn font-medium'>
// 						{ethers.formatEther(totalWinningAmount ?? 0).toString()} USD
// 					</div>
// 				</div>
// 			}
// 		</div>
// 	)
// }

// export default ClaimablePoolRow
