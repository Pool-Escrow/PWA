'use client'

import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function BottomBar() {
    const handleClick = () => {
        // reload the page
        toast.message('Creating Pool', {
            description: 'Please wait...',
            duration: 1450,
        })
        setTimeout(() => {
            window.location.reload()
        }, 1500)
    }

    return (
        <footer className='flex-center fixed bottom-0 left-0 min-w-full'>
            <nav className='flex-center my-auto h-bottom-bar max-w-screen-md rounded-t-3xl bg-neutral-100/50 shadow shadow-black/25 backdrop-blur-[32.10px] px-safe-or-6'>
                <Button
                    className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'
                    onClick={handleClick}>
                    Create Pool
                </Button>
            </nav>
        </footer>
    )
}
