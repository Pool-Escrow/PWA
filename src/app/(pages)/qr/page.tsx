'use client'

import { useState } from 'react'
import PageWrapper from '@/components/page-wrapper'
import QRToggle from './_components/qr-toggle'
import PayMeView from './_components/pay-me-view'

export default function QRPage() {
    const [currentMode, setCurrentMode] = useState<'scan' | 'pay'>('scan')

    const handleToggle = (mode: 'scan' | 'pay') => {
        console.log('QR Page - Current mode:', mode)
        setCurrentMode(mode)
    }

    return (
        <PageWrapper
            topBarProps={{
                backButton: true,
                title: '',
            }}>
            <div className='flex flex-col items-center pt-6'>
                <QRToggle onToggle={handleToggle} />
                <div className='mt-[38px] flex w-full flex-1'>
                    {currentMode === 'scan' ? (
                        <div className='flex flex-1 items-center justify-center'>
                            <div className='text-center text-gray-500'>QR scanner coming soon</div>
                        </div>
                    ) : (
                        <PayMeView />
                    )}
                </div>
            </div>
        </PageWrapper>
    )
}
