'use client'

import { usePoolCreationStore } from '@/app/_client/stores/pool-creation-store'
import { Avatar, AvatarImage } from '@/app/_components/ui/avatar'
import { Button } from '@/app/_components/ui/button'
import { formatAddress } from '@/app/_lib/utils/addresses'
import PageWrapper from '@/components/page-wrapper'
import ScannerPageLayout from '@/components/scanner-page-layout'
import { QrCodeCheckInData } from '@/types/qr'
import { blo } from 'blo'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Address } from 'viem'
import PoolQrScanner from '../../_components/qr-scanner'
import { useUserDetails } from '../_components/use-user-details'
import { QrScanDialog } from './_components/qrScanDialog'

export default function PayoutScanPage() {
    const [result, setResult] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isScanning, setIsScanning] = useState(true)
    const [showDialog, setShowDialog] = useState(false)
    const [scannedAddress, setScannedAddress] = useState<Address | null>(null)
    const params = useParams()
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const isProcessing = useRef(false)
    const router = useRouter()

    // Fetch user details using the hook
    const { data: userDetails } = useUserDetails(scannedAddress as Address)

    const { showToast } = usePoolCreationStore(state => ({
        showToast: state.showToast,
    }))

    const handleDecode = async (decodedResult: string) => {
        if (isProcessing.current) return
        setIsScanning(false)
        try {
            isProcessing.current = true
            const qrData: QrCodeCheckInData = JSON.parse(decodedResult)

            if (qrData.poolId !== params?.['pool-id']) {
                // showToast({ type: 'error', message: 'This QR code is for a different pool.' })
                return
            }

            setResult(qrData.address)
            setError(null)
            stopScanning()

            // Set the scanned address to trigger userDetails fetch
            setScannedAddress(qrData.address as Address)
            setShowDialog(true)

            // showToast({ type: 'info', message: 'Directing to user payout' })

            setTimeout(() => {
                // router.push(`/pool/${qrData.poolId}/participants/${qrData.address}`)
            }, 1500)
        } catch (err) {
            // showToast({
            //     type: 'error',
            //     message: err instanceof Error ? err.message : 'Invalid QR code format',
            // })
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
    }, [startScanning])

    const avatar = userDetails?.avatar ?? (scannedAddress ? blo(scannedAddress) : '')
    const displayName = userDetails?.displayName ?? (scannedAddress ? formatAddress(scannedAddress) : '')
    const truncatedAddress = scannedAddress ? `${scannedAddress.slice(0, 5)}...${scannedAddress.slice(-6)}` : ''

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

            <QrScanDialog isOpen={showDialog} onClose={() => setShowDialog(false)}>
                <div className='flex h-full w-full flex-col'>
                    <div className='flex h-full w-full flex-col items-center justify-center gap-1 pt-[9px] md:gap-2'>
                        {avatar && (
                            <Avatar
                                className='size-16 rounded-full border-2 border-white bg-white lg:size-24'
                                aria-label='User Avatar'>
                                <AvatarImage alt={`Avatar Image`} src={avatar} />
                            </Avatar>
                        )}
                        <h2 className='text-[15px] font-medium md:text-[24px]'>{displayName}</h2>
                        <p className='text-[12px] font-medium italic md:text-[20px]'>{truncatedAddress}</p>
                    </div>
                    <div className='flex h-12 w-full flex-row items-end justify-between gap-[10px] align-bottom md:h-[100px]'>
                        <Button
                            className='h-full w-1/2 rounded-full bg-[#EEEFF0] text-[16px] font-semibold text-[#787878] hover:bg-[#EEEFF0] focus:bg-[#EEEFF0] active:bg-[#EEEFF0] md:text-[24px]'
                            onClick={() => setShowDialog(false)}>
                            Cancel
                        </Button>
                        <Button className='h-full w-1/2 rounded-full bg-[#6993FF] text-[16px] font-semibold text-white hover:bg-[#6993FF] focus:bg-[#6993FF] active:bg-[#6993FF] md:text-[24px]'>
                            Check-in
                        </Button>
                    </div>
                </div>
            </QrScanDialog>
        </PageWrapper>
    )
}
