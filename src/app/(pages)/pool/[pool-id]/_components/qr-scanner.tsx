'use client'

import { motion } from 'motion/react'
import QrScannerPrimitive from 'qr-scanner'
import * as React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface QrScannerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onError'> {
    onDecode?: (result: string) => void
    onError?: (error: Error | string) => void
    scannerOptions?: QrScannerOptions
    startButtonText?: string
    stopButtonText?: string
    enableCallback?: boolean
}

interface UseQrScannerProps {
    onDecode?: (result: string) => void
    onError?: (error: Error) => void
    scannerOptions?: QrScannerOptions
    enableCallback?: boolean
}

// Componente QrScanner
type QrScannerOptions = {
    onDecodeError?: (error: Error | string) => void
    calculateScanRegion?: (video: HTMLVideoElement) => QrScannerPrimitive.ScanRegion
    preferredCamera?: QrScannerPrimitive.FacingMode
    maxScansPerSecond?: number
    highlightScanRegion?: boolean
    highlightCodeOutline?: boolean
    overlay?: HTMLDivElement
    /** just a temporary flag until we switch entirely to the new api */
    returnDetailedScanResult?: true
}

function useQrScanner({ onDecode, onError, scannerOptions, enableCallback = true }: UseQrScannerProps = {}) {
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
                    if (isMountedRef.current && enableCallback) {
                        setResult(result.data)
                        onDecode?.(result.data)
                    }
                },
                {
                    onDecodeError: (error: Error | string) => {
                        if (isMountedRef?.current && enableCallback) {
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
    }, [onDecode, onError, scannerOptions, enableCallback])

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
        const originalGetContext = HTMLCanvasElement.prototype.getContext.bind(HTMLCanvasElement.prototype)

        const customGetContext = function (
            this: HTMLCanvasElement,
            contextId: string,
            options?: { willReadFrequently?: boolean },
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

const PoolQrScanner = React.forwardRef<HTMLDivElement, QrScannerProps>(
    (
        {
            // className,
            onDecode,
            onError,
            scannerOptions,
            // startButtonText = 'Start Scanning',
            // stopButtonText = 'Stop Scanning',
            enableCallback = true,
            // ...props
        },
        // ref,
    ) => {
        const {
            // result,
            // error,
            // isScanning,
            videoRef,
            startScanner,
            // stopScanner,
        } = useQrScanner({
            onDecode,
            onError,
            scannerOptions,
            enableCallback,
        })

        useEffect(() => {
            startScanner()
        }, [startScanner])

        useCanvasContextOverride()

        return (
            <div className='relative'>
                <video ref={videoRef} className='h-full w-full object-cover' />
                <div className='absolute inset-0'>
                    {enableCallback ? (
                        <div className='relative h-full w-full'>
                            <div className='camera-box absolute left-1/2 top-1/2 aspect-square w-3/4 max-w-[512px] -translate-x-1/2 -translate-y-1/2 before:absolute before:-left-[3px] before:-top-[3px] before:h-8 before:w-8 before:rounded-tl-lg before:border-l-8 before:border-t-8 before:border-[#44DCAF] after:absolute after:-right-[3px] after:-top-[3px] after:h-8 after:w-8 after:rounded-tr-lg after:border-r-8 after:border-t-8 after:border-[#44DCAF] [&>*:nth-child(1)]:absolute [&>*:nth-child(1)]:-bottom-[3px] [&>*:nth-child(1)]:-left-[3px] [&>*:nth-child(1)]:h-8 [&>*:nth-child(1)]:w-8 [&>*:nth-child(1)]:rounded-bl-lg [&>*:nth-child(1)]:border-b-8 [&>*:nth-child(1)]:border-l-8 [&>*:nth-child(1)]:border-[#44DCAF] [&>*:nth-child(2)]:absolute [&>*:nth-child(2)]:-bottom-[3px] [&>*:nth-child(2)]:-right-[3px] [&>*:nth-child(2)]:h-8 [&>*:nth-child(2)]:w-8 [&>*:nth-child(2)]:rounded-br-lg [&>*:nth-child(2)]:border-b-8 [&>*:nth-child(2)]:border-r-8 [&>*:nth-child(2)]:border-[#44DCAF]'>
                                <span />
                                <span />
                            </div>
                        </div>
                    ) : (
                        <div className='camera-scanned-overlay relative h-full w-full' />
                    )}
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
                        type: 'tween',
                    }}
                />
            </div>
        )
    },
)

PoolQrScanner.displayName = 'QrScanner'

export default PoolQrScanner
