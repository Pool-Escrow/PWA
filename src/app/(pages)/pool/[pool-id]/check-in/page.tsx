'use client'

import { usePoolCreationStore } from '@/app/_client/stores/pool-creation-store'
import { Avatar, AvatarImage } from '@/app/_components/ui/avatar'
import { Button } from '@/app/_components/ui/button'
import { formatAddress } from '@/app/_lib/utils/addresses'
import PageWrapper from '@/components/page-wrapper'
import ScannerPageLayout from '@/components/scanner-page-layout'
import circleErrorIcon from '@/public/app/icons/svg/circle-error-icon.svg'
import circleTickIcon from '@/public/app/icons/svg/circle-tick-icon.svg'
import type { QrCodeCheckInData } from '@/types/qr'
import { blo } from 'blo'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Address } from 'viem'
import PoolQrScanner from '../_components/qr-scanner'
import { checkInAction, checkParticipantStatusAction } from '../check-in/actions'
import { useUserDetails } from '../participants/_components/use-user-details'
import { DialogContent } from './_components/DialogContent'
import { QrScanDialog } from './_components/qrScanDialog'

enum CheckInState {
    REGISTERED = 'REGISTERED',
    PROCESSING_CHECK_IN = 'PROCESSING_CHECK_IN',
    PROCESSING_PAYOUT = 'PROCESSING_PAYOUT',
    SUCCESS = 'SUCCESS',
    ALREADY_CHECKED_IN = 'ALREADY_CHECKED_IN',
    ERROR = 'ERROR',
}

export default function PayoutScanPage() {
    const [result, setResult] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isScanning, setIsScanning] = useState(true)
    const [showDialog, setShowDialog] = useState(false)
    const [scannedAddress, setScannedAddress] = useState<Address | null>(null)
    const [checkInState, setCheckInState] = useState<CheckInState>(CheckInState.REGISTERED)
    const [checkInStatus, setCheckInStatus] = useState<{ success?: boolean; message?: string } | null>(null)
    const [qrData, setQrData] = useState<QrCodeCheckInData | null>(null)
    const params = useParams()
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const isProcessing = useRef(false)
    const router = useRouter()

    // Fetch user details using the hook
    const { data: userDetails } = useUserDetails(scannedAddress as Address)

    const { showToast } = usePoolCreationStore(state => ({
        showToast: state.showToast,
    }))

    const resetQrDialog = () => {
        setShowDialog(false)
        setCheckInState(CheckInState.PROCESSING_CHECK_IN)
        setCheckInStatus(null)
    }
    const handleDecode = async (decodedResult: string) => {
        if (isProcessing.current || showDialog) return

        try {
            isProcessing.current = true
            const parsedQrData: QrCodeCheckInData = JSON.parse(decodedResult)
            if (parsedQrData.poolId !== params?.['pool-id']) {
                setCheckInStatus({ success: false, message: 'This QR code is for a different pool' })
                setCheckInState(CheckInState.ERROR)
                setShowDialog(true)

                return
            }

            // Store QR data in state
            setQrData(parsedQrData)
            setResult(parsedQrData.address)
            setError(null)
            stopScanning()

            // Check participant status first
            const statusResponse = await checkParticipantStatusAction(
                params['pool-id'] as string,
                parsedQrData.address as Address,
            )

            if (!statusResponse.success || statusResponse.status === 'NOT_REGISTERED') {
                setCheckInStatus({
                    success: false,
                    message: statusResponse.message || 'User is not registered for this pool',
                })
                setCheckInState(CheckInState.ERROR)
            } else if (statusResponse.status === 'CHECKED_IN') {
                setCheckInStatus({
                    success: true,
                    message: statusResponse.message || 'User is already checked in',
                })
                setCheckInState(CheckInState.ALREADY_CHECKED_IN)
            } else if (statusResponse.status === 'REGISTERED') {
                setCheckInState(CheckInState.REGISTERED)
            }

            setScannedAddress(parsedQrData.address as Address)
            setShowDialog(true)
        } catch (err) {
            console.error(err)
            setCheckInStatus({
                success: false,
                message: err instanceof Error ? err.message : 'Failed to process QR code',
            })
            setCheckInState(CheckInState.ERROR)
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

    const handleCheckIn = async () => {
        if (!scannedAddress || !params?.['pool-id']) return

        setCheckInState(CheckInState.PROCESSING_CHECK_IN)
        setCheckInStatus(null)

        try {
            const response = await checkInAction(params['pool-id'] as string, scannedAddress)
            setCheckInStatus({
                success: response.success,
                message: response.message as string,
            })
            if ((response.message as string).includes('already checked in')) {
                setCheckInState(CheckInState.ALREADY_CHECKED_IN)
            } else if (response.success) {
                setCheckInState(CheckInState.SUCCESS)
            } else {
                setCheckInState(CheckInState.ERROR)
            }
        } catch (err) {
            setCheckInState(CheckInState.ERROR)
            setCheckInStatus({
                success: false,
                message: err instanceof Error ? err.message : 'Failed to check in',
            })
        }
    }

    const handlePayout = async () => {
        if (!qrData || !params?.['pool-id']) return

        setCheckInState(CheckInState.PROCESSING_PAYOUT)
        router.push(`/pool/${qrData.poolId}/participants/${qrData.address}`)
    }

    const avatar = userDetails?.avatar ?? (scannedAddress ? blo(scannedAddress) : '')
    const displayName = userDetails?.displayName ?? (scannedAddress ? formatAddress(scannedAddress) : '')
    const truncatedAddress = scannedAddress ? `${scannedAddress.slice(0, 5)}...${scannedAddress.slice(-6)}` : ''

    const getDialogContent = () => {
        switch (checkInState) {
            case CheckInState.ERROR:
                return (
                    <DialogContent
                        avatar={
                            <div className='relative size-16 rounded-full border-2 border-white bg-white md:size-24'>
                                <Image src={circleErrorIcon} alt='Error Image' fill />
                            </div>
                        }
                        title='Check in failed'
                        subtitle={checkInStatus?.message}
                        titleColor='error'
                        italicSubtitle={false}
                        footer={
                            <Button
                                className='size-full rounded-full bg-[#EEEFF0] text-[16px] font-semibold text-[#787878] hover:bg-[#EEEFF0] active:bg-[#EEEFF0] md:text-[24px]'
                                onClick={resetQrDialog}
                                disabled={false}
                                style={{
                                    backgroundColor: '#EEEFF0',
                                    color: '#787878',
                                }}>
                                Ok
                            </Button>
                        }
                    />
                )

            case CheckInState.REGISTERED:
                return (
                    <DialogContent
                        avatar={
                            <Avatar
                                className='size-16 rounded-full border-2 border-white bg-white md:size-24'
                                aria-label='User Avatar'>
                                <AvatarImage alt={`Avatar Image`} src={avatar} />
                            </Avatar>
                        }
                        title={displayName}
                        subtitle={truncatedAddress}
                        footer={
                            <>
                                <Button
                                    className='h-full w-1/2 rounded-full bg-[#EEEFF0] text-[16px] font-semibold text-[#787878] hover:bg-[#EEEFF0] active:bg-[#EEEFF0] md:text-[24px]'
                                    onClick={resetQrDialog}>
                                    Cancel
                                </Button>
                                <Button
                                    className='h-full w-1/2 rounded-full bg-[#6993FF] text-[16px] font-semibold text-white hover:bg-[#6993FF] active:bg-[#6993FF] md:text-[24px]'
                                    onClick={handleCheckIn}>
                                    Check In
                                </Button>
                            </>
                        }
                    />
                )

            case CheckInState.PROCESSING_CHECK_IN:
                return (
                    <DialogContent
                        avatar={
                            <Avatar
                                className='size-16 rounded-full border-2 border-white bg-white md:size-24'
                                aria-label='User Avatar'>
                                <AvatarImage alt={`Avatar Image`} src={avatar} />
                            </Avatar>
                        }
                        title='Processing Check in'
                        subtitle='Please do not close'
                        footer={
                            <Button
                                className='size-full rounded-full bg-[#EEEFF0] text-[16px] font-semibold text-[#787878] hover:bg-[#EEEFF0] active:bg-[#EEEFF0] md:text-[24px]'
                                onClick={() => {}}
                                disabled={true}>
                                Processing...
                            </Button>
                        }
                    />
                )

            case CheckInState.SUCCESS:
                return (
                    <DialogContent
                        avatar={
                            <div className='relative size-16 rounded-full border-2 border-white bg-white md:size-24'>
                                <Image src={circleTickIcon} alt='Checked In Image' fill />
                            </div>
                        }
                        title='Checked in'
                        subtitle={`${displayName} has been successfully checked in`}
                        titleColor='primary'
                        footer={
                            <Button
                                className='size-full rounded-full bg-[#6993FF] text-[16px] font-semibold text-white hover:bg-[#6993FF] active:bg-[#6993FF] md:text-[24px]'
                                onClick={resetQrDialog}>
                                Continue
                            </Button>
                        }
                        italicSubtitle={false}
                    />
                )

            case CheckInState.ALREADY_CHECKED_IN:
                return (
                    <DialogContent
                        avatar={
                            <Avatar
                                className='size-16 rounded-full border-2 border-white bg-white md:size-24'
                                aria-label='User Avatar'>
                                <AvatarImage alt={`Avatar Image`} src={avatar} />
                            </Avatar>
                        }
                        title={`${displayName} is already checked in.\nWould you like to go to Payout?`}
                        footer={
                            <>
                                <Button
                                    className='h-full w-1/2 rounded-full bg-[#EEEFF0] text-[16px] font-semibold text-[#787878] hover:bg-[#EEEFF0] active:bg-[#EEEFF0] md:text-[24px]'
                                    onClick={resetQrDialog}>
                                    Cancel
                                </Button>
                                <Button
                                    className='h-full w-1/2 rounded-full bg-[#6993FF] text-[16px] font-semibold text-white hover:bg-[#6993FF] active:bg-[#6993FF] md:text-[24px]'
                                    onClick={handlePayout}>
                                    Payout
                                </Button>
                            </>
                        }
                    />
                )

            case CheckInState.PROCESSING_PAYOUT:
                return (
                    <DialogContent
                        avatar={
                            <Avatar
                                className='size-16 rounded-full border-2 border-white bg-white md:size-24'
                                aria-label='User Avatar'>
                                <AvatarImage alt={`Avatar Image`} src={avatar} />
                            </Avatar>
                        }
                        title='Redirecting to payout'
                        subtitle='Please do not close'
                        footer={
                            <Button
                                className='size-full rounded-full bg-[#EEEFF0] text-[16px] font-semibold text-[#787878] hover:bg-[#EEEFF0] active:bg-[#EEEFF0] md:text-[24px]'
                                onClick={() => {}}
                                disabled={true}>
                                Processing...
                            </Button>
                        }
                    />
                )

            default:
                return null
        }
    }

    return (
        <PageWrapper fullScreen>
            <ScannerPageLayout title='Manage Participants'>
                <PoolQrScanner
                    onDecode={handleDecode}
                    onError={handleError}
                    enableCallback={!showDialog}
                    startButtonText={isScanning ? 'Scanning...' : 'Start Scanning'}
                    stopButtonText='Stop'
                />
            </ScannerPageLayout>

            <QrScanDialog isOpen={showDialog} onClose={() => resetQrDialog()}>
                {getDialogContent()}
            </QrScanDialog>
        </PageWrapper>
    )
}
