import { POOLSTATUS } from '@/app/(pages)/pool/[pool-id]/_lib/definitions'
import { POOL_STATUSES_CONFIGS } from '@/app/_lib/consts/pool.consts'

export default function PoolDetailsBannerStatus({ status }: { status: POOLSTATUS }) {
    return (
        <>
            <div
                style={{ backgroundColor: POOL_STATUSES_CONFIGS[status].color }}
                className={'size-1.5 rounded-full md:size-3'}
            />
            <div className='text-xs text-white md:text-base'>{POOL_STATUSES_CONFIGS[status].name}</div>
        </>
    )
}
