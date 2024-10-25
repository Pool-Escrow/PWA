import Image from 'next/image'

interface PoolDetailsCardBannerProps {
    imageUrl: string
    name: string
    buttons?: React.ReactNode
    status?: React.ReactNode
}
export default async function PoolDetailsBanner({ imageUrl, name, buttons, status }: PoolDetailsCardBannerProps) {
    return (
        <div className='detail_card_banner relative overflow-hidden'>
            <Image src={imageUrl} alt={name} fill className='object-cover' priority />
            {buttons}
            {/* <div className='detail_card_banner_status'>{status}</div> */}
        </div>
    )
}
