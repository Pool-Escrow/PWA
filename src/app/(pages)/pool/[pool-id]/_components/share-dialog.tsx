import useMediaQuery from '@/app/_client/hooks/use-media-query'
import Divider from '@/app/_components/divider'
import { Button } from '@/app/_components/ui/button'
import { Dialog } from '@/app/_components/ui/dialog'
import { Drawer } from '@/app/_components/ui/drawer'
import { Input } from '@/app/_components/ui/input'
import { cn } from '@/lib/utils/tailwind'
import _ from 'lodash'
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
                    <button
                        type='button'
                        title='Share with Friends'
                        className='relative size-8 rounded-full bg-black/40 p-2 md:size-14 md:p-3'>
                        <ShareIcon className='size-8' />
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
            <Drawer.Trigger asChild>
                <button
                    title='Share with Friends'
                    type='button'
                    className='relative size-8 rounded-full bg-black/40 p-2 md:size-14 md:p-3'>
                    <ShareIcon className='size-8' />
                </button>
            </Drawer.Trigger>
            <Drawer.Content>
                <Drawer.Header className='text-left'>
                    <Drawer.Title>Share with Friends</Drawer.Title>
                    <Drawer.Description>
                        Invites are best attended with friends. The more the merrier.
                    </Drawer.Description>
                </Drawer.Header>
                <ShareForm className='px-4' />
                <Drawer.Footer className='pt-2'>
                    <Drawer.Close asChild>
                        <Button variant='outline'>Cancel</Button>
                    </Drawer.Close>
                </Drawer.Footer>
            </Drawer.Content>
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
                {!_.isEmpty(poolId) && (
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
