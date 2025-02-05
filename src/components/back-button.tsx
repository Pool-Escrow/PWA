'use client'

import * as React from 'react'
import { Button } from '@/app/_components/ui/button'
import { useRouter } from 'next/navigation'

export default function BackButton() {
    const router = useRouter()

    return (
        <Button onClick={() => router.back()} variant='ghost' className='rounded-full active:bg-gray-100' size='icon'>
            <svg xmlns='http://www.w3.org/2000/svg' className='size-7' viewBox='0 0 24 24' fill='none'>
                <path
                    d='M14.0002 18L15.4102 16.59L10.8302 12L15.4102 7.41L14.0002 6L8.00016 12L14.0002 18Z'
                    fill='#5472E9'
                />
            </svg>
        </Button>
    )
}
