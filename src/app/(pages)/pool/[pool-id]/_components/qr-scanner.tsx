import * as React from 'react'
import { useState, useEffect, useRef, useCallback } from 'react'
import QrScannerPrimitive from 'qr-scanner'
import { motion } from 'framer-motion'

interface QrScannerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onError'> {
    onDecode?: (result: string) => void
    onError?: (error: Error | string) => void
    scannerOptions?: QrScannerOptions
    startButtonText?: string
    stopButtonText?: string
}

interface UseQrScannerProps {
    onDecode?: (result: string) => void
    onError?: (error: Error) => void
    scannerOptions?: QrScannerOptions
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
                    maxScansPerSecond: 5,
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

const PoolQrScanner = React.forwardRef<HTMLDivElement, QrScannerProps>(
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

PoolQrScanner.displayName = 'QrScanner'

export default PoolQrScanner
