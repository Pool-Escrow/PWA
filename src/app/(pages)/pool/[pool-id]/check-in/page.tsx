'use client'

import { useState } from 'react'
import { QrReader } from 'react-qr-reader'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'
import { checkInAction } from './actions'
import { Button } from '@/app/_components/ui/button'
import { Address } from 'viem'

const CheckInPage = () => {
    const [qrData, setQrData] = useState<string>('')
    const params = useParams<{ 'pool-id': string }>()

    const checkInMutation = useMutation({
        mutationFn: (data: { address: Address }) => checkInAction(params['pool-id'], data.address),
        onSuccess: data => {
            if (data.success) {
                toast.success(data.message, {
                    richColors: true,
                })
            } else {
                toast.error(data.message, {
                    richColors: true,
                })
            }
        },
        onError: error => {
            toast.error('An error occurred during check-in', {
                richColors: true,
            })
            console.error('Check-in error:', error)
        },
    })

    const handleScan = (data: string | null) => {
        if (data) {
            setQrData(data)
            try {
                const parsedData = JSON.parse(data)
                console.log('parsedData', parsedData)
                checkInMutation.mutate({ address: parsedData.address })
            } catch (error) {
                console.error('Error parsing QR data:', error)
                toast.error('Invalid QR code')
            }
        }
    }

    return (
        <div className='relative flex h-full w-full flex-col'>
            <h1 className='mb-4 text-2xl font-bold'>Check In</h1>
            <QrReader
                className='h-1/2 w-full bg-blue-200'
                scanDelay={1000}
                onResult={(result, error) => {
                    if (result) {
                        handleScan(result.getText())
                    }
                    if (error) {
                        console.info(error)
                    }
                }}
                constraints={{ facingMode: 'environment' }}
            />
            <Button
                onClick={() => {
                    console.log('check-in qrscan simulation')
                    handleScan('{"address": "0x113D848A30b5eEf4B6Ec0461E846EFf33656e976", "poolId": 90}')
                }}>
                Check In
            </Button>
            <p className='mt-4 break-words'>Scanned Data: {qrData}</p>
        </div>
    )
}

export default CheckInPage
