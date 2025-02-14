'use client'

import { QrCode, EditIcon } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import ShareDialog from '../dialogs/share'
import { Button } from '@/app/_components/ui/button'
import { motion } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type BannerButtonProps = {
    onClick?: () => void
    icon?: typeof QrCode
    tooltip?: string
}

function BannerButton({ onClick, icon: Icon, tooltip }: BannerButtonProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        onClick={onClick}
                        size='icon'
                        className='rounded-full bg-black/40 transition-colors duration-200 hover:bg-black/60 focus:ring-2 focus:ring-white/50 active:bg-black/80'>
                        {Icon && <Icon className='size-5 text-white' />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

interface PoolDetailsBannerButtonProps {
    isAdmin?: boolean | null
}
export default function PoolDetailsBannerButtons({ isAdmin }: PoolDetailsBannerButtonProps) {
    const params = useParams<{ 'pool-id': string }>()
    const poolId = params?.['pool-id']
    const router = useRouter()

    const buttons = [
        {
            element: BannerButton,
            adminOnly: true,
            props: {
                onClick: () => router.push(`/pool/${poolId}/check-in`),
                tooltip: 'Check-in QR',
                icon: QrCode,
            },
        },
        {
            element: ShareDialog,
            adminOnly: false,
            props: {},
        },
        {
            element: BannerButton,
            adminOnly: true,
            props: {
                onClick: () => router.push(`/pool/${poolId}/edit`),
                tooltip: 'Edit Pool',
                icon: EditIcon,
            },
        },
    ]

    // Filter buttons based on admin status
    const visibleButtons = buttons.filter(button => !button.adminOnly || isAdmin)

    return (
        <div className='absolute right-4 top-4 flex h-full flex-col gap-2'>
            {visibleButtons.map((ButtonData, index) => (
                <motion.div
                    key={index}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                    <ButtonData.element {...ButtonData.props} />
                </motion.div>
            ))}
        </div>
    )
}
