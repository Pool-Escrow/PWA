export default function ParticipantRow() {
	return (
		<div>
			<h1>Participant Row</h1>
		</div>
	)
}

// import frogImage from '@/public/images/frog.png'
// import Image from 'next/image'

// import { fetchUserDisplayForAddress } from '@/lib/api/clientAPI'
// import { useQuery } from '@tanstack/react-query'
// import * as _ from 'lodash'
// import Link from 'next/link'

// interface ParticipantRowProps {
// 	name: string
// 	imageUrl: string
// 	participantStatus: number
// 	address: string
// 	routeUrl?: string
// }

// const ParticipantRow: React.FC<ParticipantRowProps> = ({
// 	name,
// 	imageUrl,
// 	participantStatus,
// 	address,
// 	routeUrl,
// }) => {
// 	const { data: profileData } = useQuery({
// 		queryKey: ['loadProfileImage', address],
// 		queryFn: fetchUserDisplayForAddress,
// 		enabled: !_.isEmpty(address),
// 	})

// 	return (
// 		<Link
// 			className='flex flex-row space-x-4 bottomDivider py-4'
// 			href={routeUrl ?? window.location.href}
// 		>
// 			<Image
// 				src={`${profileData?.profileImageUrl ?? frogImage.src}`}
// 				className=' flex rounded-full w-14 h-14 object-cover'
// 				alt='avatar'
// 				width={56}
// 				height={56}
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
// 		</Link>
// 	)
// }

// export default ParticipantRow

// export enum ParticipantStatus {
// 	Unregistered = 0,
// 	Registered = 1,
// 	'Checked In' = 2,
// }
