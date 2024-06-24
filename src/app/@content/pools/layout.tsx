'use client'

export default function PoolsLayout({ yours, upcoming }: LayoutWithSlots<'yours' | 'upcoming'>) {
    return (
        <div className='flex min-h-dvh scroll-py-6 flex-col gap-6'>
            {yours}
            {upcoming}
        </div>
    )
}
