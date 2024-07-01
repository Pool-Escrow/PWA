import editIcon from '@/../public/images/edit_icon.svg'
import qrIcon from '@/../public/images/qr_code_icon.svg'

import frog from '@/../public/images/frog.png'

import { StaticImport } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import Link from 'next/link'
import ShareDialog from '../common/dialogs/share.dialog'
import PoolStatus from '../common/other/poolStatus'

interface PoolImageRowProps {
    poolStatus?: number
    poolImage?: string | null
    admin: boolean
    poolId: string
}
const PoolImageRow = (props: PoolImageRowProps) => {
    return (
        <div className={`cardBackground mb-4 flex w-full flex-col space-y-4 rounded-3xl md:space-y-10 md:p-10`}>
            <div className='relative h-full w-full overflow-hidden rounded-3xl bg-black'>
                <div className='relative h-full w-full object-contain object-center'>
                    <Image src={props?.poolImage ?? frog.src} alt='Pool Image' width={500} height={400} />
                </div>
                {/* <div className='absolute bottom-0 flex h-full w-full flex-col items-center justify-center space-y-3 bg-black bg-opacity-60 text-white backdrop-blur-sm backdrop-filter md:space-y-6'>
                                {timeLeft != undefined && timeLeft > 0 && (
                                    <div>
                                        <h4 className='text-xs md:text-2xl'>Starts in</h4>
                                        <h3 className='text-4xl font-semibold md:text-7xl'>
                                            {<CountdownTimer timeleft={timeLeft} />}
                                        </h3>
                                    </div>
                                )}
                            </div> */}
                <div className='absolute right-2 top-0 flex h-full w-10 flex-col items-center space-y-3 py-4 text-white md:right-0 md:w-20 md:space-y-5 md:py-6'>
                    {props.admin && (
                        <Link
                            href={`/pwa/pool/${props.poolId}/check-in`}
                            type='button'
                            title='Scan QR'
                            className='flex size-8 items-center justify-center rounded-full bg-black/40 p-2 md:size-10 md:p-3'>
                            <Image className='flex h-6 w-6' src={qrIcon as StaticImport} alt='Share with Friends' />
                        </Link>
                    )}
                    <ShareDialog />
                    {props.admin && (
                        <Link
                            href={`/pwa/pool/${props.poolId}/edit`}
                            type='button'
                            title='Edit Pool'
                            className='flex size-8 items-center justify-center rounded-full bg-black/40 p-2 md:size-10 md:p-3'>
                            <Image className='flex h-6 w-6' src={editIcon as StaticImport} alt='Share with Friends' />
                        </Link>
                    )}
                </div>
                <PoolStatus status={props.poolStatus} />
            </div>
        </div>
    )
}

export default PoolImageRow
