// export default function ParticipantRow() {
// 	return (
// 		<div>
// 			<h1>Participant Row</h1>
// 		</div>
// 	)
// }

import frog from '@/../public/images/frog.png'
import { useUserDetailsDB } from '@/lib/hooks/use-user-details-db'
import { formatAddress } from '@/lib/utils/addresses'

import Image from 'next/image'

import Link from 'next/link'

interface ParticipantRowProps {
    address: string
    poolId: string
}

const ParticipantRow: React.FC<ParticipantRowProps> = (props: ParticipantRowProps) => {
    const { userDetailsDB } = useUserDetailsDB(props.address)

    return (
        <Link
            className='bottomDivider flex flex-row space-x-4 py-4'
            href={`/pool/${props.poolId}/participants/${props.address}`}>
            <Image
                src={`${userDetailsDB?.userDetail?.avatar ?? frog.src}`}
                className='flex h-14 w-14 rounded-full object-cover'
                alt='avatar'
                width={56}
                height={56}
            />
            <div className='flex flex-1 flex-col'>
                <h4 className='overflow-hidden text-lg font-medium'>
                    {userDetailsDB?.userDetail?.displayName ?? formatAddress(props.address)}
                </h4>
                <p className={`fontRegistered`}>Registered</p>
            </div>
        </Link>
    )
}

export default ParticipantRow

export enum ParticipantStatus {
    Unregistered = 0,
    Registered = 1,
    'Checked In' = 2,
}
