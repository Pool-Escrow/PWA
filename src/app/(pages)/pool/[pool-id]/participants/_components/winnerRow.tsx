export default function WinnerRow() {
    return (
        <div>
            <h1>Winner Row</h1>
        </div>
    )
}

// import circleTick from '@/public/images/circle-tick.svg'

// import { fetchUserDisplayForAddress } from '@/lib/api/clientAPI'
// import { useQuery } from '@tanstack/react-query'
// import { ethers } from 'ethers'
// import Image from 'next/image'
// import Link from 'next/link'
// import { ParticipantStatus } from './participantRow'

// interface WinnerRowProps {
// 	name?: string
// 	imageUrl?: string
// 	participantStatus: number
// 	address: string
// 	routeUrl?: string
// 	hasClaimed?: boolean
// 	prizeAmount?: string
// 	setWinner: boolean
// }

// const WinnerRow: React.FC<WinnerRowProps> = ({
// 	name,
// 	participantStatus,
// 	address,
// 	routeUrl,
// 	prizeAmount,
// 	setWinner,
// }) => {
// 	const { data: profileData } = useQuery({
// 		queryKey: ['loadProfileImage', address],
// 		queryFn: fetchUserDisplayForAddress,
// 		enabled: !_.isEmpty(address),
// 	})

// 	return (
// 		<Link
// 			className='flex flex-row space-x-4 bottomDivider py-4'
// 			href={routeUrl ?? '/'}
// 		>
// 			<Image
// 				alt='profile image'
// 				height={56}
// 				width={56}
// 				src={`${profileData?.profileImageUrl ?? blo(address)}`}
// 				className=' flex rounded-full w-14 h-14 object-cover'
// 			/>
// 			<div className='flex flex-1 flex-col '>
// 				<h4 className='font-medium text-lg'>{name}</h4>
// 				<p
// 					className={`${
// 						participantStatus == ParticipantStatus.Registered
// 							? 'fontRegistered'
// 							: ' '
// 					}
// 					${participantStatus == ParticipantStatus['Checked In'] ? 'fontCheckedIn' : ' '}
// 					`}
// 				>
// 					{ParticipantStatus[participantStatus]}
// 				</p>
// 			</div>
// 			{setWinner ? (
// 				<div className='flex flex-row items-center justify-center space-x-2'>
// 					<div>
// 						<Image
// 							className='w-6 h-6'
// 							src={circleTick.src}
// 							alt='circle tick'
// 							height={24}
// 							width={24}
// 						/>
// 					</div>
// 					<div className='rounded-2xl paidBackground px-6 py-4 fontCheckedIn font-medium'>
// 						{ethers.formatEther(prizeAmount ?? 0).toString()} USD
// 					</div>
// 				</div>
// 			) : (
// 				<div className='flex flex-row items-center justify-center space-x-2'>
// 					<div className='rounded-2xl px-6 py-4 fontUnpaid backgroundUnpaid font-medium'>
// 						{ethers.formatEther(prizeAmount ?? 0).toString()} USD
// 					</div>
// 				</div>
// 			)}
// 		</Link>
// 	)
// }

// export default WinnerRow
