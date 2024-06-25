'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/tailwind'
import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'
import Divider from '../other/divider'

const ShareForm = ({ className }: React.ComponentProps<'form'>) => {
    const [, setCopied] = useState(false)
    const [pageUrl, setPageUrl] = useState('')

    useEffect(() => {
        setPageUrl(window?.location?.href)
    }, [])

    const copyToClipboard = () => {
        console.log('copyToClipboard')

        try {
            void navigator.clipboard.writeText(pageUrl.replace('admin/', ''))

            toast.message('Share Link', {
                description: 'Copied link to clipboard!',
            })

            setCopied(true)
        } catch (error) {
            console.error('Failed to copy:', error)

            toast.error('Share Link', {
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
                    value={pageUrl.replace('admin/', '')}
                    viewBox={`0 0 256 256`}
                />
            </div>
            <div className='flex flex-col space-y-2'>
                <Divider />
                <h4 className='text-sm'>Share the link:</h4>
                <div className='flex flex-col'>
                    <div className='flex flex-row space-x-2'>
                        <Input value={pageUrl.replace('admin/', '')} readOnly />
                        <Button onClick={copyToClipboard}>Copy</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShareForm
