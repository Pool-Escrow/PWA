'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    const router = useRouter()

    useEffect(() => {
        console.error('Profile edit error:', error)
    }, [error])

    return (
        <div className='flex min-h-screen flex-col items-center justify-center p-4'>
            <h2 className='text-center text-xl font-semibold'>Sorry, there was a problem loading your profile</h2>
            <div className='mt-4 flex gap-4'>
                <button onClick={() => reset()} className='rounded-lg bg-blue-500 px-4 py-2 text-white'>
                    Try again
                </button>
                <button onClick={() => router.push('/pools')} className='rounded-lg bg-gray-500 px-4 py-2 text-white'>
                    Go back
                </button>
            </div>
        </div>
    )
}
