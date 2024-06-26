'use client'

import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import useMediaQuery from '@/lib/hooks/use-media-query'
import Divider from '../other/divider'
import ShareForm from './share.form'

interface OnRampDialogProps {
    open: boolean
    setOpen: (open: boolean) => void
    balance: bigint | undefined
}

const OnRampDialog = ({ open, setOpen, balance }: OnRampDialogProps) => {
    // const [open, setOpen] = useState(false)
    const isDesktop = useMediaQuery('(min-width: 768px)')

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <Dialog.Trigger asChild></Dialog.Trigger>
                <Dialog.Content className='bg-white sm:max-w-[425px]'>
                    <Dialog.Header>
                        <Dialog.Title>You need to add USDC in order to register for this event.</Dialog.Title>
                        <div></div>
                    </Dialog.Header>
                    <ShareForm />
                </Dialog.Content>
            </Dialog>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild></DrawerTrigger>
            <DrawerContent className='bg-white'>
                <DrawerHeader className='text-left'>
                    <DrawerTitle className='mb-6 text-xl'>
                        You need to add USDC in order to register for this event.
                    </DrawerTitle>
                    <div>
                        <div className='flex flex-row justify-between text-sm'>
                            <span className='font-medium'>Current Pool balance:</span>
                            <span className='font-medium'>
                                ${((balance ?? BigInt(0)) / BigInt(Math.pow(10, Number(18)))).toString()} USDC
                            </span>
                        </div>
                        <Divider className='my-0 h-0 py-0' />
                    </div>

                    <div className='flex w-full flex-col'>
                        <div className='mb-6 flex w-full flex-row items-center justify-between'>
                            <div className='flex flex-col'>
                                <div className='font-semibold'>Buy USDC</div>
                                <div className='text-sm text-gray-500'>
                                    Using cards, banks and international options
                                </div>
                            </div>
                            <Button className='h-10 w-20 rounded-[2rem] bg-cta text-center text-xs font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                                Buy
                            </Button>
                        </div>
                        <div className='mb-6 flex w-full flex-row items-center justify-between'>
                            <div className='flex flex-col'>
                                <div className='font-semibold'>External Wallet</div>
                                <div className='text-sm text-gray-500'>Receive from Coinbase, Rainbow or Metamask</div>
                            </div>
                            <Button className='h-10 w-20 rounded-[2rem] bg-cta text-center text-xs font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                                Receive
                            </Button>
                        </div>
                    </div>
                </DrawerHeader>
            </DrawerContent>
        </Drawer>
    )
}

export default OnRampDialog
