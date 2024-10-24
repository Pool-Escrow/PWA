'use client'

import Lottie from 'react-lottie'
import animationData from '@/public/app/animations/loading.json'
import { DrawerContent, DrawerHeader, Drawer, DrawerTrigger, DrawerTitle } from '../_components/ui/drawer'
import { useAppStore } from '../_client/providers/app-store.provider'

export default function Default() {
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
            <DrawerTrigger asChild></DrawerTrigger>
            <DrawerContent className='bg-white'>
                <DrawerHeader className='text-left'>
                    <DrawerTitle className='mb-6 text-center text-xl'>Transaction in Progress</DrawerTitle>

                    <div className='mb-6 flex w-full flex-row items-center justify-center'>
                        <div className='max-w-96'>
                            <Lottie options={defaultOptions} width={'100%'} isClickToPauseDisabled={true} />
                        </div>
                    </div>
                </DrawerHeader>
            </DrawerContent>
        </Drawer>
    )
}
