import { getStatusString } from '@/app/_lib/utils/get-relative-date'
import type { POOLSTATUS } from '../_lib/definitions'

interface PoolDetailsHeadingProps {
    name: string
    status: POOLSTATUS | string
    startDate: Date
    endDate: Date
    hostName: string
}

export default function PoolDetailsHeading({ name, status, startDate, endDate, hostName }: PoolDetailsHeadingProps) {
    return (
        <div className='mb-[1.81rem] mt-[0.81rem] flex flex-col gap-[0.38rem]'>
            <h1 className='text-[1.125rem] font-semibold'>{name}</h1>
            <h2 className='text-xs'>{getStatusString({ status, startDate, endDate })}</h2>
            {/*TODO: Needs to show the actual host, get the mainHost address and look for the user name for that address in the database */}
            <h2 className='text-xs font-semibold'>{`Hosted by: ${hostName}`}</h2>
        </div>
    )
}
