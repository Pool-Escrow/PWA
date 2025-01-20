'use client'

import * as React from 'react'
import { useState, useEffect, useRef, useCallback } from 'react'

import BackCircleButton from '@/components/back-circle-button'
import { useParams } from 'next/navigation'
import { QrCodeCheckInData } from '@/types/qr'
import { usePoolCreationStore } from '@/app/_client/stores/pool-creation-store'
import { useRouter } from 'next/navigation'
import PoolQrScanner from '../../_components/qr-scanner'
import PageWrapper from '@/components/page-wrapper'
import ScannerPageLayout from '@/components/scanner-page-layout'

const useCanvasContextOverride = () => {
    useEffect(() => {
        const originalGetContext = HTMLCanvasElement.prototype.getContext

        const customGetContext = function (
            this: HTMLCanvasElement,
            contextId: string,
            options?: any,
        ): RenderingContext | null {
            if (contextId === '2d') {
                options = options || {}
                options.willReadFrequently = true
            }
            return originalGetContext.call(this, contextId, options)
        }

        // @ts-expect-error ts(2322) - This is a temporary fix to enable willReadFrequently for 2d context
        HTMLCanvasElement.prototype.getContext = customGetContext

        // Cleanup when unmounting the component
        return () => {
            HTMLCanvasElement.prototype.getContext = originalGetContext
        }
    }, [])
}

// Participant Check-in Preview
export default function CheckInPage() {
    const [result, setResult] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isScanning, setIsScanning] = useState(true)
    const [timeLeft, setTimeLeft] = useState(20)
    const [checkInStatus, setCheckInStatus] = useState<{ success: boolean; message: string } | null>(null)
    const params = useParams()
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const isProcessing = useRef(false)
    useCanvasContextOverride()

    const router = useRouter()

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

            showToast({ type: 'info', message: 'Directing to user payout' })
            router.push(`/pool/${qrData.poolId}/participants/${qrData.address}`)
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
        setTimeLeft(20)
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

    useEffect(() => {
        if (isScanning) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        stopScanning()
                        return 0
                    }
                    return prevTime - 1
                })
            }, 1000)
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [isScanning, stopScanning])

    return (
        <PageWrapper fullScreen>
            <ScannerPageLayout title='Manage Participants'>
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
