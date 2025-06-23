'use client'

export function Modal({ children }: { children: React.ReactNode }) {
    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
            <div className='relative h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6'>{children}</div>
        </div>
    )
}
