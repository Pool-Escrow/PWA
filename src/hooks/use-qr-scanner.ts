import { useState, useEffect, useRef, useCallback } from 'react'
import QrScanner from 'qr-scanner'

type QrScannerOptions = {
    onDecodeError?: (error: Error | string) => void
    calculateScanRegion?: (video: HTMLVideoElement) => QrScanner.ScanRegion
    preferredCamera?: QrScanner.FacingMode | QrScanner.DeviceId
    maxScansPerSecond?: number
    highlightScanRegion?: boolean
    highlightCodeOutline?: boolean
    overlay?: HTMLDivElement
    /** just a temporary flag until we switch entirely to the new api */
    returnDetailedScanResult?: true
}

interface QrScannerHookOptions {
    onDecode: (result: QrScanner.ScanResult) => void
    onError?: (error: Error) => void
    scannerOptions?: QrScannerOptions
}

export function useQrScanner({ onDecode, onError, scannerOptions }: QrScannerHookOptions) {
    const [isScanning, setIsScanning] = useState(false)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const scannerRef = useRef<QrScanner | null>(null)

    const startScanner = useCallback(async () => {
        if (!videoRef.current || scannerRef.current) return

        try {
            const scanner = new QrScanner(
                videoRef.current,
                result => {
                    onDecode(result)
                },
                {
                    ...scannerOptions,
                    returnDetailedScanResult: true,
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                },
            )

            await scanner.start()
            scannerRef.current = scanner
            setIsScanning(true)
        } catch (error) {
            console.error('Error starting scanner:', error)
            if (onError) onError(error as Error)
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
            stopScanner()
        }
    }, [stopScanner])

    return { videoRef, isScanning, startScanner, stopScanner }
}
