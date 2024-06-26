interface poolStatusProps {
    status: number | undefined
}
const PoolStatus = (poolStatus: poolStatusProps) => {
    return (
        <div className='text-md absolute bottom-0 flex w-full items-center justify-center space-x-3 bg-black bg-opacity-40 py-1 text-center text-white md:py-3 md:text-xl'>
            {poolStatus.status == 0 && (
                <div className='flex flex-row items-center space-x-3'>
                    <div className={`dotBackground h-1.5 w-1.5 rounded-full md:h-3 md:w-3`}></div>
                    <div className='text-xs md:text-2xl'>Unavailable</div>
                </div>
            )}
            {poolStatus.status == 1 && (
                <div className='flex flex-row items-center space-x-3'>
                    <div className={`dotBackground h-1.5 w-1.5 rounded-full md:h-3 md:w-3`}></div>
                    <div className='text-xs md:text-2xl'>Upcoming</div>
                </div>
            )}
            {poolStatus.status == 2 && (
                <div className='flex flex-row items-center space-x-3'>
                    <div className={`liveDotBackground h-1.5 w-1.5 rounded-full md:h-3 md:w-3`}></div>
                    <div className='text-xs md:text-2xl'>Live</div>
                </div>
            )}
            {poolStatus.status == 3 && (
                <div className='flex flex-row items-center space-x-3'>
                    <div className={`dotBackground h-1.5 w-1.5 rounded-full md:h-3 md:w-3`}></div>
                    <div className='text-xs md:text-2xl'>Ended</div>
                </div>
            )}
            {poolStatus.status == 4 && (
                <div className='flex flex-row items-center space-x-3'>
                    <div className={`dotBackground h-1.5 w-1.5 rounded-full md:h-3 md:w-3`}></div>
                    <div className='text-xs md:text-2xl'>Deleted</div>
                </div>
            )}
        </div>
    )
}

export default PoolStatus
