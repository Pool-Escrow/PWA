'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function SkipButton() {
    const router = useRouter()

    return (
        <Button
            variant='ghost'
            className='self-end text-xs font-medium text-[#2989EC]'
            onClick={() => router.push('/pools')}>
            Skip
        </Button>
    )
}
