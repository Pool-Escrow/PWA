'use client'

import * as React from 'react'
import { useState, useEffect, useRef, useCallback } from 'react'

import BackCircleButton from '@/components/back-circle-button'
import { useParams } from 'next/navigation'
import { QrCodeCheckInData } from '@/types/qr'
import { usePoolCreationStore } from '@/app/_client/stores/pool-creation-store'
import { useRouter } from 'next/navigation'

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
            router.push(`/pool/${qrData.poolId}/participants/${qrData.address}/payout`)
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
        // <PageWrapper topBarProps={{ title: 'Check-in', backButton: true }}>
        //     <div className='container mx-auto max-w-2xl p-4'>
        //         <h1 className='mb-6 text-center text-3xl font-bold'>Participant Check-in Preview</h1>

        //         <Card className='mb-6'>
        //             <CardHeader>
        //                 <CardTitle>QR Scanner</CardTitle>
        //             </CardHeader>
        //             <CardContent>
        //                 <QrScanner
        //                     onDecode={handleDecode}
        //                     onError={handleError}
        //                     startButtonText={isScanning ? 'Scanning...' : 'Start Scanning'}
        //                     stopButtonText='Stop'
        //                 />
        //                 {isScanning && <p className='mt-2 text-center'>Time left: {timeLeft} seconds</p>}
        //             </CardContent>
        //             <CardFooter>
        //                 {result && (
        //                     <div className='flex items-center text-green-600'>
        //                         <CheckCircle2 className='mr-2 h-5 w-5' />
        //                         <span>Result: {result}</span>
        //                     </div>
        //                 )}
        //                 {error && (
        //                     <div className='flex items-center text-red-600'>
        //                         <AlertCircle className='mr-2 h-5 w-5' />
        //                         <span>Error: {error}</span>
        //                     </div>
        //                 )}
        //             </CardFooter>
        //         </Card>
        //     </div>
        // </PageWrapper>
        // <PageWrapper>hello</PageWrapper>
        // <PageWrapper>
        // {/* <QrScanner
        //     onDecode={handleDecode}
        //     onError={handleError}
        //     startButtonText={isScanning ? 'Scanning...' : 'Start Scanning'}
        //     stopButtonText='Stop'
        // /> */}
        // </PageWrapper>
        <div className='absolute left-0 top-0 flex h-full w-full'>
            <QrScanner
                onDecode={handleDecode}
                onError={handleError}
                startButtonText={isScanning ? 'Scanning...' : 'Start Scanning'}
                stopButtonText='Stop'
            />
            <header className='absolute top-4 w-full text-white'>
                <nav className='grid h-24 grid-cols-[1fr_auto_1fr] items-center'>
                    <div className='ml-6 w-6'>
                        <BackCircleButton />
                    </div>
                    <div className='text-center'>
                        <div className='w-full text-center text-sm font-semibold'>Manage Participants</div>
                    </div>
                    <div className='justify-self-end'></div>
                </nav>
            </header>
        </div>
    )
}
