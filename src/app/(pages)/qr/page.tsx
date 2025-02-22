'use client'

import BackCircleButton from '@/components/back-circle-button'
import PageWrapper from '@/components/page-wrapper'
import ScannerPageLayout from '@/components/scanner-page-layout'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { isAddress } from 'viem'
import PoolQrScanner from '../pool/[pool-id]/_components/qr-scanner'
import PayMeView from './_components/pay-me-view'
import QRToggle from './_components/qr-toggle'

export default function QRPage() {
    const [currentMode, setCurrentMode] = useState<'scan' | 'pay'>('scan')
    const router = useRouter()

    const handleToggle = (mode: 'scan' | 'pay') => {
        console.log('QR Page - Current mode:', mode)
        setCurrentMode(mode)
    }

    const handleDecode = useCallback(
        (result: string) => {
            console.log('Scanned result:', result)
            if (!isAddress(result)) {
                console.error('Not a valid address')
                return
            }
            router.push(`/pay-other-player?address=${result}`)
        },
        [router],
    )

    const handleError = useCallback((error: Error | string) => {
        console.error('Scan error:', error)
    }, [])

    return (
        <PageWrapper fullScreen>
            {currentMode === 'scan' ? (
                <ScannerPageLayout title='' className='top-0'>
                    <PoolQrScanner
                        onDecode={handleDecode}
                        onError={handleError}
                        enableCallback={true}
                        startButtonText='Scanning...'
                        stopButtonText='Stop'
                    />
                </ScannerPageLayout>
            ) : (
                <div className='flex flex-col items-center pt-6'>
                    <div className='ml-2 w-4 self-start sm:ml-4 sm:w-6'>
                        <BackCircleButton />
                    </div>
                    <div className='mt-[84px] flex w-full flex-1'>
                        <PayMeView />
                    </div>
                </div>
            )}

            <div className='absolute left-0 right-0 top-20 w-full'>
                <QRToggle onToggle={handleToggle} />
            </div>
        </PageWrapper>
    )
}
