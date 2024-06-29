import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
    return (
        <header className='fixed left-0 top-0 z-10 h-20 w-full bg-white'>
            <nav className='flex h-full max-w-screen-md px-6 *:flex *:flex-1 *:items-center'>
                <div className='justify-start'>
                    <Skeleton className='w-[48px] max-w-full' />
                </div>
                <div className='justify-center'>
                    <Skeleton className='w-[64px] max-w-full' />
                </div>
                <div className='justify-end'>
                    <Skeleton className='w-[56px] max-w-full' />
                </div>
            </nav>
        </header>
    )
}
