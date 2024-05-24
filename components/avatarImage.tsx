import frogImage from '@/public/images/frog.png'
import Image from 'next/image'

import { fetchUserDisplayForAddress } from '@/lib/api/clientAPI'
import { useQuery } from '@tanstack/react-query'
import * as _ from 'lodash'

interface AvatarImageProps {
	address: string
}

const AvatarImage: React.FC<AvatarImageProps> = ({ address }) => {
	const { data: profileData } = useQuery({
		queryKey: ['loadProfileImage', address],
		queryFn: fetchUserDisplayForAddress,
		enabled: !_.isEmpty(address),
	})

	return (
		<Image
			alt='profile image'
			src={`${profileData?.profileImageUrl ?? frogImage.src}`}
			className=' flex size-full rounded-full'
		/>
	)
}

export default AvatarImage
