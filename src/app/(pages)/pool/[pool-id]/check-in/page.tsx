'use client'

import { usePoolCreationStore } from '@/app/_client/stores/pool-creation-store'
import PageWrapper from '@/components/page-wrapper'
import ScannerPageLayout from '@/components/scanner-page-layout'
import { QrCodeCheckInData } from '@/types/qr'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Address } from 'viem'
import PoolQrScanner from '../_components/qr-scanner'
import { checkInAction } from './actions'

// Participant Check-in Preview
export default function CheckInPage() {
    const [result, setResult] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isScanning, setIsScanning] = useState(true)
    const params = useParams()
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const isProcessing = useRef(false)

    const { showToast } = usePoolCreationStore(state => ({
        showToast: state.showToast,
    }))
    const handleDecode = async (decodedResult: string) => {
        if (isProcessing.current) return

        try {
            // Parse the QR code JSON data
            const qrData: QrCodeCheckInData = JSON.parse(decodedResult)

            setResult(qrData.address)
            setError(null)
            stopScanning()
            isProcessing.current = true

            showToast({ type: 'info', message: 'Processing Check-in' })

            // Verify that the scanned poolId matches the current pool
            if (qrData.poolId !== params?.['pool-id']) {
                showToast({ type: 'error', message: 'This QR code is for a different pool.' })
                return
            }

            const response = await checkInAction(params['pool-id'] as string, qrData.address as Address)

            if (response.success) {
                showToast({
                    type: 'success',
                    message: 'Check-in successful!',
                })
            } else {
                if (response.message.includes('already checked in')) {
                    showToast({
                        type: 'info',
                        message: 'This participant has already been checked in.',
                    })
                } else {
                    showToast({
                        type: 'error',
                        message: response.message,
                    })
                }
            }
        } catch (err) {
            showToast({
                type: 'error',
                message: err instanceof Error ? err.message : 'Invalid QR code format',
            })
        } finally {
            isProcessing.current = false
        }
    }

    const handleError = (err: Error | string) => {
        setError(typeof err === 'string' ? err : err.message)
        setResult(null)
    }

    const startScanning = useCallback(() => {
        setIsScanning(true)
    }, [])

    const stopScanning = useCallback(() => {
        setIsScanning(false)
        if (timerRef.current) {
            clearInterval(timerRef.current)
        }
    }, [])

    useEffect(() => {
        startScanning()
    }, [])

    return (
        <PageWrapper fullScreen>
            <ScannerPageLayout title='Check-in'>
                <PoolQrScanner
                    onDecode={handleDecode}
                    onError={handleError}
                    startButtonText={isScanning ? 'Scanning...' : 'Start Scanning'}
                    stopButtonText='Stop'
                />
            </ScannerPageLayout>
        </PageWrapper>
    )
}
