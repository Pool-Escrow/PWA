'use client'

import * as React from 'react'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import QrScannerPrimitive from 'qr-scanner'
import { cn } from '@/lib/utils/tailwind'
import { Button } from '@/app/_components/ui/button'
// import { Switch } from '@/components/ui/switch'
// import { Label } from '@/app/_components/ui/label'
// import { Input } from '@/app/_components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/app/_components/ui/card'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import PageWrapper from '@/components/page-wrapper'

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

        return (
            <Card ref={ref} className={cn('mx-auto w-full max-w-sm overflow-hidden', className)} {...props}>
                <div className='relative aspect-square'>
                    <video ref={videoRef} className='size-full object-cover' />
                    <motion.div
                        className='pointer-events-none absolute inset-0 border-4 border-blue-500'
                        animate={{
                            scale: [1, 1.05, 1],
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
                <div className='p-4'>
                    <Button onClick={isScanning ? stopScanner : startScanner} className='w-full'>
                        {isScanning ? stopButtonText : startButtonText}
                    </Button>
                    {result && <p className='mt-2 text-sm text-gray-600'>Result: {result}</p>}
                    {error && <p className='mt-2 text-sm text-red-600'>Error: {error.message}</p>}
                </div>
            </Card>
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
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    useCanvasContextOverride()

    const handleDecode = (decodedResult: string) => {
        setResult(decodedResult)
        setError(null)
        stopScanning()
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
        <PageWrapper topBarProps={{ title: 'Check-in', backButton: true }}>
            <div className='container mx-auto max-w-2xl p-4'>
                <h1 className='mb-6 text-center text-3xl font-bold'>Participant Check-in Preview</h1>

                <Card className='mb-6'>
                    <CardHeader>
                        <CardTitle>QR Scanner</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <QrScanner
                            onDecode={handleDecode}
                            onError={handleError}
                            startButtonText={isScanning ? 'Scanning...' : 'Start Scanning'}
                            stopButtonText='Stop'
                        />
                        {isScanning ? (
                            <p className='mt-2 text-center'>Time left: {timeLeft} seconds</p>
                        ) : (
                            <Button onClick={startScanning} className='mt-2 w-full'>
                                Resume Scanning
                            </Button>
                        )}
                    </CardContent>
                    <CardFooter>
                        {result && (
                            <div className='flex items-center text-green-600'>
                                <CheckCircle2 className='mr-2 size-5' />
                                <span>Result: {result}</span>
                            </div>
                        )}
                        {error && (
                            <div className='flex items-center text-red-600'>
                                <AlertCircle className='mr-2 size-5' />
                                <span>Error: {error}</span>
                            </div>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </PageWrapper>
    )
}
