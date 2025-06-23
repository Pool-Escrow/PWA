interface poolStatusProps {
    status: number | undefined
}
const PoolStatus = (poolStatus: poolStatusProps) => {
    return (
        <div className='absolute bottom-0 flex w-full items-center justify-center space-x-3 bg-black/40 py-1 text-center text-base text-white md:py-3 md:text-xl'>
            {poolStatus.status == 0 && (
                <div className='flex flex-row items-center space-x-3'>
                    <div className={`size-1.5 rounded-full md:size-3`} />
                    <div className='text-base md:text-base'>Unavailable</div>
                </div>
            )}
            {poolStatus.status == 1 && (
                <div className='flex flex-row items-center space-x-3'>
                    <div className={`size-1.5 rounded-full md:size-3`} />
                    <div className='text-xs md:text-base'>Upcoming</div>
                </div>
            )}
            {poolStatus.status == 2 && (
                <div className='flex flex-row items-center space-x-3'>
                    <div className={`size-1.5 rounded-full md:size-3`} />
                    <div className='text-xs md:text-base'>Live</div>
                </div>
            )}
            {poolStatus.status == 3 && (
                <div className='flex flex-row items-center space-x-3'>
                    <div className={`size-1.5 rounded-full md:size-3`} />
                    <div className='text-xs md:text-base'>Ended</div>
                </div>
            )}
            {poolStatus.status == 4 && (
                <div className='flex flex-row items-center space-x-3'>
                    <div className={`size-1.5 rounded-full md:size-3`} />
                    <div className='text-xs md:text-2xl'>Deleted</div>
                </div>
            )}
        </div>
    )
}

export default PoolStatus
