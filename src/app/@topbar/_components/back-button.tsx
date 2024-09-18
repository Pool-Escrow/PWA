'use client'

import { Button } from '@/app/_components/ui/button'
import { usePathname, useRouter } from 'next/navigation'

export default function BackButton() {
    const router = useRouter()
    const pathname = usePathname()

    const visible = !['/pools', '/'].includes(pathname)

    return (
        <div className='w-6'>
            {visible && (
                <Button onClick={() => router.back()} variant='ghost' className='rounded-full' size='icon'>
                    <svg xmlns='http://www.w3.org/2000/svg' className='size-7' viewBox='0 0 24 24' fill='none'>
                        <path
                            d='M14.0002 18L15.4102 16.59L10.8302 12L15.4102 7.41L14.0002 6L8.00016 12L14.0002 18Z'
                            fill='#5472E9'
                        />
                    </svg>
                </Button>
            )}
        </div>
    )
}
