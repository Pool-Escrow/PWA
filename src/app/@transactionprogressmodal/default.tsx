'use client'

import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer'
import { useAppStore } from '@/providers/app-store.provider'
import animationData from '@/public/app/animations/loading.json'
import Lottie from 'lottie-react'

export default function TransactionProgressModal() {
    const open = useAppStore(s => s.transactionInProgress)

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice',
        },
    }

    return (
        <Drawer open={open}>
            <DrawerTrigger asChild />
            <DrawerContent className='bg-white'>
                <DrawerHeader className='text-left'>
                    <DrawerTitle className='mb-6 text-center text-xl'>Transaction in Progress</DrawerTitle>
                    <DrawerDescription>
                        Please wait while we process your transaction. This may take a few seconds.
                    </DrawerDescription>

                    <div className='mb-6 flex w-full flex-row items-center justify-center'>
                        <div className='max-w-96'>
                            <Lottie {...defaultOptions} width='100%' />
                        </div>
                    </div>
                </DrawerHeader>
            </DrawerContent>
        </Drawer>
    )
}
