'use client'

import * as React from 'react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import QrScannerPrimitive from 'qr-scanner'
import { cn } from '@/lib/utils/tailwind'
import { Button } from '@/app/_components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/app/_components/ui/card'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import PageWrapper from '@/components/page-wrapper'
import BackCircleButton from '@/components/back-circle-button'
import { useParams } from 'next/navigation'
import { checkInAction } from './actions'
import { Address } from 'viem'
import { toast } from 'sonner'
import { QrCodeCheckInData } from '@/types/qr'
import { usePoolCreationStore } from '@/app/_client/stores/pool-creation-store'
// Hook useQrScanner
interface UseQrScannerProps {
    onDecode?: (result: string) => void
    onError?: (error: Error) => void
    scannerOptions?: QrScannerOptions
}

function useQrScanner({ onDecode, onError, scannerOptions }: UseQrScannerProps = {}) {
    const [result, setResult] = useState<string | null>(null)
    const [error, setError] = useState<Error | null>(null)
    const [isScanning, setIsScanning] = useState(false)
    const scannerRef = useRef<QrScannerPrimitive | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const isMountedRef = useRef(true)

    const startScanner = useCallback(() => {
        if (videoRef.current && !scannerRef.current) {
            scannerRef.current = new QrScannerPrimitive(
                videoRef.current,
                result => {
                    // console.log('QR Scanner decoded:', result.data)
                    if (isMountedRef.current) {
                        setResult(result.data)
                        onDecode?.(result.data)
                    }
                },
                {
                    onDecodeError: (error: Error | string) => {
                        console.log('onDecodeError', error)
                        if (isMountedRef?.current) {
                            setError(error instanceof Error ? error : new Error(error))
                            onError?.(error instanceof Error ? error : new Error(error))
                        }
                    },
                    ...scannerOptions,
                    returnDetailedScanResult: true,
                },
            )
            scannerRef.current.start().catch((err: Error) => {
                if (isMountedRef.current) {
                    setError(err)
                    onError?.(err)
                }
            })
            setIsScanning(true)
        }
    }, [onDecode, onError, scannerOptions])

    const stopScanner = useCallback(() => {
        if (scannerRef.current) {
            scannerRef.current.stop()
            scannerRef.current.destroy()
            scannerRef.current = null
            setIsScanning(false)
        }
    }, [])

    useEffect(() => {
        // Set mounted to true when component mounts
        isMountedRef.current = true

        return () => {
            isMountedRef.current = false
            stopScanner()
        }
    }, [stopScanner])

    return {
        result,
        error,
        isScanning,
        videoRef,
        startScanner,
        stopScanner,
    }
}

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

// Componente QrScanner
type QrScannerOptions = {
    onDecodeError?: (error: Error | string) => void
    calculateScanRegion?: (video: HTMLVideoElement) => QrScannerPrimitive.ScanRegion
    preferredCamera?: QrScannerPrimitive.FacingMode | QrScannerPrimitive.DeviceId
    maxScansPerSecond?: number
    highlightScanRegion?: boolean
    highlightCodeOutline?: boolean
    overlay?: HTMLDivElement
    /** just a temporary flag until we switch entirely to the new api */
    returnDetailedScanResult?: true
}

interface QrScannerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onError'> {
    onDecode?: (result: string) => void
    onError?: (error: Error | string) => void
    scannerOptions?: QrScannerOptions
    startButtonText?: string
    stopButtonText?: string
}

const QrScanner = React.forwardRef<HTMLDivElement, QrScannerProps>(
    (
        {
            className,
            onDecode,
            onError,
            scannerOptions,
            startButtonText = 'Start Scanning',
            stopButtonText = 'Stop Scanning',
            ...props
        },
        ref,
    ) => {
        const { result, error, isScanning, videoRef, startScanner, stopScanner } = useQrScanner({
            onDecode,
            onError,
            scannerOptions,
        })

        useEffect(() => {
            startScanner()
        }, [])

        return (
            <div className='relative'>
                <video ref={videoRef} className='h-full w-full object-cover' />
                <div className='absolute inset-0'>
                    <div className='relative h-full w-full'>
                        <div className='camera-box absolute left-1/2 top-1/2 aspect-square w-3/4 max-w-[512px] -translate-x-1/2 -translate-y-1/2 before:absolute before:-left-[3px] before:-top-[3px] before:h-8 before:w-8 before:rounded-tl-lg before:border-l-8 before:border-t-8 before:border-[#44DCAF] after:absolute after:-right-[3px] after:-top-[3px] after:h-8 after:w-8 after:rounded-tr-lg after:border-r-8 after:border-t-8 after:border-[#44DCAF] [&>*:nth-child(1)]:absolute [&>*:nth-child(1)]:-bottom-[3px] [&>*:nth-child(1)]:-left-[3px] [&>*:nth-child(1)]:h-8 [&>*:nth-child(1)]:w-8 [&>*:nth-child(1)]:rounded-bl-lg [&>*:nth-child(1)]:border-b-8 [&>*:nth-child(1)]:border-l-8 [&>*:nth-child(1)]:border-[#44DCAF] [&>*:nth-child(2)]:absolute [&>*:nth-child(2)]:-bottom-[3px] [&>*:nth-child(2)]:-right-[3px] [&>*:nth-child(2)]:h-8 [&>*:nth-child(2)]:w-8 [&>*:nth-child(2)]:rounded-br-lg [&>*:nth-child(2)]:border-b-8 [&>*:nth-child(2)]:border-r-8 [&>*:nth-child(2)]:border-[#44DCAF]'>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
                <motion.div
                    className='pointer-events-none absolute'
                    animate={{
                        scale: [1, 1, 1],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        ease: 'easeInOut',
                        times: [0, 0.5, 1],
                        repeat: Infinity,
                    }}
                />
            </div>
        )
    },
)

QrScanner.displayName = 'QrScanner'

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
