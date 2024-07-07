'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/tailwind'
import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'
import Divider from '../other/divider'
import { useAccount } from 'wagmi'

const ReceiveForm = ({ className }: React.ComponentProps<'form'>) => {
    const [, setCopied] = useState(false)
    const [pageUrl, setPageUrl] = useState('')

    const account = useAccount()

    useEffect(() => {
        setPageUrl(window?.location?.href)
    }, [])

    const copyToClipboard = () => {
        console.log('copyToClipboard')

        try {
            void navigator.clipboard.writeText(account.address as string)

            toast.message('Copy Address', {
                description: 'Copied link to clipboard!',
            })

            setCopied(true)
        } catch (error) {
            console.error('Failed to copy:', error)

            toast.error('Copy Address', {
                description: 'Failed to copy link to clipboard!',
            })
        }
    }

    return (
        <div className={cn('my-8 flex flex-col space-y-10 bg-white', className)}>
            <div className='flex h-60 w-full flex-col items-center justify-center'>
                <QRCode
                    size={256}
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                    value={account.address?.toString() ?? ''}
                    viewBox={`0 0 256 256`}
                />
            </div>
            <div className='flex flex-col space-y-2'>
                <Divider />
                <h4 className='text-sm'>Copy Address:</h4>
                <div className='flex flex-col'>
                    <div className='flex flex-row space-x-2'>
                        <Input value={account.address?.toString()} readOnly />
                        <Button onClick={copyToClipboard}>Copy</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReceiveForm
