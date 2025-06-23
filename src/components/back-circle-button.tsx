'use client'

import { Button } from '@/components/ui/button'
import { useSafeNavigation } from '@/hooks/use-safe-navigation'

export default function BackCircleButton() {
    const { back } = useSafeNavigation()

    const handleBack = () => {
        const success = back()
        if (!success && process.env.NODE_ENV === 'development') {
            console.warn('[BackCircleButton] Back navigation was blocked')
        }
    }

    return (
        <Button onClick={handleBack} variant='ghost' className='rounded-full' size='icon'>
            <svg width='42' height='42' viewBox='0 0 42 42' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <circle cx='21' cy='21' r='21' fill='black' fillOpacity='0.4' />
                <path d='M24.41 16.41L23 15L17 21L23 27L24.41 25.59L19.83 21L24.41 16.41Z' fill='white' />
            </svg>
        </Button>
    )
}
