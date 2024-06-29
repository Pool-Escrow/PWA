import frogImage from '@/public/images/frog.png'
import Image from 'next/image'

import { useQuery } from '@tanstack/react-query'
import _ from 'lodash'
import { fetchUserDisplayForAddress } from '@/lib/api/clientAPI'

interface AvatarImageProps {
    address: string
}

const AvatarImageOld: React.FC<AvatarImageProps> = ({ address }) => {
    const { data: profileData } = useQuery({
        queryKey: ['loadProfileImage', address],
        queryFn: fetchUserDisplayForAddress,
        enabled: !_.isEmpty(address),
    })

    return (
        <Image
            src={`${profileData?.profileImageUrl ?? frogImage.src}`}
            className='flex h-full w-full rounded-full'
            alt='avatar'
            fill
        />
    )
}

export default AvatarImageOld
