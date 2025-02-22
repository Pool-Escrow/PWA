import editIcon from '@/public/app/icons/svg/edit-icon.svg'
import qrIcon from '@/public/app/icons/svg/qr-code-icon.svg'
import frog from '@/public/app/images/frog.png'
import type { StaticImport } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import Link from 'next/link'
import PoolStatus from './pool-status'
import ShareDialog from '@/features/pools/components/dialogs/share'

interface PoolImageRowProps {
    poolStatus?: number
    poolImage?: string | null
    admin: boolean
    poolId: string
}
const PoolImageRow = (props: PoolImageRowProps) => {
    return (
        <div className={`cardBackground mb-4 flex w-full flex-col space-y-4 rounded-3xl md:space-y-10 md:p-10`}>
            <div className='relative size-full overflow-hidden rounded-3xl bg-black'>
                <div className='relative size-full object-contain object-center'>
                    <Image src={props?.poolImage ?? frog.src} alt='Pool Image' width={500} height={400} />
                </div>
                {/* <div className='absolute bottom-0 flex h-full w-full flex-col items-center justify-center space-y-3 bg-black bg-opacity/60 text-white backdrop-blur-xs backdrop-filter md:space-y-6'>
                                {timeLeft != undefined && timeLeft > 0 && (
                                    <div>
                                        <h4 className='text-xs md:text-2xl'>Starts in</h4>
                                        <h3 className='text-4xl font-semibold md:text-7xl'>
                                            {<CountdownTimer timeleft={timeLeft} />}
                                        </h3>
                                    </div>
                                )}
                            </div> */}
                <div className='absolute top-0 right-2 flex h-full w-10 flex-col items-center space-y-3 py-4 text-white md:right-0 md:w-20 md:space-y-5 md:py-6'>
                    {props.admin && (
                        <Link
                            href={`/pool/${props.poolId}/check-in`}
                            type='button'
                            title='Scan QR'
                            className='flex size-8 items-center justify-center rounded-full bg-black/40 p-2 md:size-10 md:p-3'>
                            <Image className='flex size-6' src={qrIcon as StaticImport} alt='Share with Friends' />
                        </Link>
                    )}
                    <ShareDialog />
                    {props.admin && (
                        <Link
                            href={`/pool/${props.poolId}/edit`}
                            type='button'
                            title='Edit Pool'
                            className='flex size-8 items-center justify-center rounded-full bg-black/40 p-2 md:size-10 md:p-3'>
                            <Image className='flex size-6' src={editIcon as StaticImport} alt='Share with Friends' />
                        </Link>
                    )}
                </div>
                <PoolStatus status={props.poolStatus} />
            </div>
        </div>
    )
}

export default PoolImageRow
