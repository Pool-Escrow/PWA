import useMediaQuery from '@/app/_client/hooks/use-media-query'
import Divider from '@/app/_components/divider'
import { Button } from '@/app/_components/ui/button'
import { Dialog } from '@/app/_components/ui/dialog'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/app/_components/ui/drawer'

import { Input } from '@/app/_components/ui/input'
import { cn } from '@/lib/utils/tailwind'
import { ShareIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'

interface shareDialogProps {
    open?: boolean
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>
}
const ShareDialog = ({ open, setOpen }: shareDialogProps) => {
    const isDesktop = useMediaQuery('(min-width: 768px)')

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <Dialog.Trigger asChild>
                    <Button
                        size='icon'
                        className='rounded-full bg-black/40 transition-colors duration-200 hover:bg-black/60 focus:ring-2 focus:ring-white/50 active:bg-black/80'>
                        <ShareIcon className='size-5 text-white' />
                    </Button>
                </Dialog.Trigger>
                <Dialog.Content className='bg-white sm:max-w-[425px]'>
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
                <Button
                    size='icon'
                    className='rounded-full bg-black/40 transition-colors duration-200 hover:bg-black/60 focus:ring-2 focus:ring-white/50 active:bg-black/80'>
                    <ShareIcon className='size-5 text-white' />
                </Button>
            </DrawerTrigger>
            <DrawerContent className='bg-white'>
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
    const [, setCopied] = useState(false)
    const [pageUrl, setPageUrl] = useState('')
    const params = useParams<{ poolId: string }>()
    const poolId = params?.poolId || '0'

    useEffect(() => {
        setPageUrl(window?.location?.href)
    }, [])

    const copyToClipboard = async () => {
        console.log('copyToClipboard')

        try {
            await navigator.clipboard.writeText(pageUrl.replace('admin/', ''))
            toast('Share Link', {
                description: 'Copied link to clipboard!',
            })
            setCopied(true)
        } catch (error) {
            console.error('Failed to copy:', error)
            toast('Share Link', {
                description: 'Failed to copy link to clipboard!',
            })
        }
    }
    return (
        <div className={cn('my-8 flex flex-col space-y-10', className)}>
            <div className='flex h-60 w-full flex-col items-center justify-center'>
                {poolId !== '0' && (
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
                        <Button onClick={() => void copyToClipboard()}>Copy</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShareDialog
