'use client'

import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import useMediaQuery from '@/hooks/use-media-query'
import { cn } from '@/lib/utils/tailwind'
import shareIcon from '@/public/images/share_icon.svg'
import type { StaticImport } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import router from 'next/router'
import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'
import Divider from '../other/divider'

const ShareDialog = () => {
    const [open, setOpen] = useState(false)
    // TODO: THIS IS NOT NEEDED, USE THE PROPER TAILWIND BREAKPOINT
    const isDesktop = useMediaQuery('(min-width: 768px)')

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <Dialog.Trigger asChild>
                    <button
                        type='button'
                        title='Share with Friends'
                        className='size-8 rounded-full bg-black/40 p-2 md:size-14 md:p-3'>
                        <Image className='flex size-full' src={shareIcon as StaticImport} alt='Share with Friends' />
                    </button>
                </Dialog.Trigger>
                <Dialog.Content className='sm:max-w-[425px]'>
                    <Dialog.Header>
                        <Dialog.Title>Share with Friends</Dialog.Title>
                        <Dialog.Description>
                            Invites are best attended with friends. The more the merrier.
                        </Dialog.Description>
                    </Dialog.Header>
                    <ShareForm />
                </Dialog.Content>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <button
                    title='Share with Friends'
                    type='button'
                    className='size-8 rounded-full bg-black/40 p-2 md:size-14 md:p-3'>
                    <Image className='flex size-full' src={shareIcon as StaticImport} alt='Share with Friends' />
                </button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className='text-left'>
                    <DrawerTitle>Share with Friends</DrawerTitle>
                    <DrawerDescription>Invites are best attended with friends. The more the merrier.</DrawerDescription>
                </DrawerHeader>
                <ShareForm className='px-4' />
                <DrawerFooter className='pt-2'>
                    <DrawerClose asChild>
                        <Button variant='outline'>Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

function ShareForm({ className }: React.ComponentProps<'form'>) {
    const currentRoute = router.asPath
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
        <div className={cn('my-8 flex flex-col space-y-10', className)}>
            <div className='flex h-60 w-full flex-col items-center justify-center'>
                {Object.keys(currentRoute).length !== 0 && (
                    <QRCode
                        size={256}
                        style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                        value={pageUrl.replace('admin/', '')}
                        viewBox={`0 0 256 256`}
                    />
                )}
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

export default ShareDialog
