'use client'

import LoadingAnimation from '../pool/[pool-id]/admin/_components/loading-animation'

export default function PoolsLoading() {
    return (
        <div className='flex size-full flex-col items-center justify-center gap-8 overflow-hidden'>
            <LoadingAnimation />
            <h1 className='text-2xl font-bold'>Loading pools...</h1>

            {/* Ripple effect */}
            <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
                <div
                    className='size-32 animate-ping rounded-full border border-primary/10'
                    style={{ animationDuration: '3s' }}
                />
                <div
                    className='absolute size-48 animate-ping rounded-full border border-primary/5'
                    style={{ animationDuration: '4s', animationDelay: '1s' }}
                />
            </div>
        </div>
    )
}
