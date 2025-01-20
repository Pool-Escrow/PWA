'use client'

import { Button } from '@/app/_components/ui/button'
import { useRouter } from 'next/navigation'

export default function BackCircleButton() {
    const router = useRouter()

    return (
        <Button onClick={() => router.back()} variant='ghost' className='rounded-full' size='icon'>
            <svg width='42' height='42' viewBox='0 0 42 42' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <circle cx='21' cy='21' r='21' fill='black' fillOpacity='0.4' />
                <path d='M24.41 16.41L23 15L17 21L23 27L24.41 25.59L19.83 21L24.41 16.41Z' fill='white' />
            </svg>
        </Button>
    )
}
