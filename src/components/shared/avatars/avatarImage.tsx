export default function AvatarImage() {
	return (
		<div>
			<h1>Avatar Image</h1>
		</div>
	)
}

// import frogImage from '@/public/images/frog.png'
// import Image from 'next/image'

// import { useQuery } from '@tanstack/react-query'
// import * as _ from 'lodash'

// interface AvatarImageProps {
// 	address: string
// }

// const AvatarImage: React.FC<AvatarImageProps> = ({ address }) => {
// 	const { data: profileData } = useQuery({
// 		queryKey: ['loadProfileImage', address],
// 		queryFn: fetchUserDisplayForAddress,
// 		enabled: !_.isEmpty(address),
// 	})

// 	return (
// 		<Image
// 			src={`${profileData?.profileImageUrl ?? frogImage.src}`}
// 			className=' flex rounded-full w-full h-full'
// 			alt='avatar'
// 			fill
// 		/>
// 	)
// }

// export default AvatarImage
