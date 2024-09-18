'use client'

import { QrCode, EditIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import ShareDialog from './share.dialog'

interface PoolDetailsBannerButtonProps {
    isAdmin?: boolean | null
}

export default function PoolDetailsBannerButtons({ isAdmin }: PoolDetailsBannerButtonProps) {
    const pathname = usePathname()
    const router = useRouter()

    const buttons = [
        { element: QrCode, adminOnly: true, onClick: () => router.push(`${pathname}/check-in`) },
        { element: ShareDialog, adminOnly: false, onClick: () => console.log('Share Dialog') },
        { element: EditIcon, adminOnly: true, onClick: () => router.push(`${pathname}/edit`) },
    ]

    // Filter buttons based on admin status
    const visibleButtons = buttons.filter(button => !button.adminOnly || isAdmin)

    return (
        <div className='absolute right-4 top-4 flex h-full flex-col gap-2'>
            {visibleButtons.map((Button, index) => (
                <div key={index} className='cursor-pointer items-center justify-center rounded-full bg-black/40 p-2'>
                    <Button.element className='size-5 text-white' onClick={Button.onClick} />
                </div>
            ))}
        </div>
    )
}
