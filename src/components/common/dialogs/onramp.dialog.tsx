'use client'

import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import Divider from '../other/divider'
import OnRampButton from '@/components/onRampButton'
import OnRampForm from './onramp.form'
import ReceiveDialog from './receive.dialog'
import Unlimit from '@/components/onramps/unlimit'

interface OnRampDialogProps {
    open: boolean
    setOpen: (open: boolean) => void
    balance: bigint | undefined
    decimalPlaces: bigint
    amount?: string
}

const OnRampDialog = ({ open, setOpen, balance, decimalPlaces, amount }: OnRampDialogProps) => {
    // const [open, setOpen] = useState(false)
    // const isDesktop = useMediaQuery('(min-width: 768px)')

    // if (isDesktop) {
    //     return (
    //         <Dialog open={open} onOpenChange={setOpen}>
    //             <Dialog.Trigger asChild></Dialog.Trigger>
    //             <Dialog.Content className='bg-white sm:max-w-[425px]'>
    //                 <Dialog.Header>
    //                     <Dialog.Title>You need to add USDC in order to register for this event.</Dialog.Title>
    //                     <div></div>
    //                 </Dialog.Header>
    //                 <OnRampForm />
    //             </Dialog.Content>
    //         </Dialog>
    //     )
    // }

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
                                ${((balance ?? BigInt(0)) / BigInt(Math.pow(10, Number(decimalPlaces)))).toString()}{' '}
                                USDC
                            </span>
                        </div>
                        <Divider className='my-0 h-0 py-0' />
                    </div>

                    <div className='flex w-full flex-col'>
                        <div className='mb-6 flex w-full flex-row items-center justify-between'>
                            <div className='flex flex-col'>
                                <div className='font-semibold'>Buy with Coinbase Pay</div>
                                <div className='text-sm text-gray-500'>
                                    Using cards, banks and international options
                                </div>
                            </div>
                            {/* <Button className='h-10 w-20 rounded-[2rem] bg-cta text-center text-xs font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                                Buy
                            </Button> */}
                            <OnRampButton className='h-10 w-20 rounded-[2rem] bg-cta text-center text-xs font-semibold leading-normal text-white shadow-button active:shadow-button-push' />
                        </div>
                        <div className='mb-6 flex w-full flex-row items-center justify-between'>
                            <div className='flex flex-col'>
                                <div className='font-semibold'>Buy with Unlimit</div>
                                <div className='text-sm text-gray-500'>
                                    Using cards, banks and international options
                                </div>
                            </div>
                            <Unlimit
                                amount={amount}
                                purchaseCurrency={'USDC-BASE'}
                                setOpen={setOpen}
                                className='h-10 w-20 rounded-[2rem] bg-cta text-center text-xs font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                                On Ramp
                            </Unlimit>
                        </div>
                        <div className='mb-6 flex w-full flex-row items-center justify-between'>
                            <div className='flex flex-col'>
                                <div className='font-semibold'>External Wallet</div>
                                <div className='text-sm text-gray-500'>Receive from Coinbase, Rainbow or Metamask</div>
                            </div>
                            {/* <Button className='h-10 w-20 rounded-[2rem] bg-cta text-center text-xs font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                                Receive
                            </Button> */}
                            {/* <OnRampForm decimalPlaces={BigInt(18)} balance={BigInt(100)} /> */}
                            <ReceiveDialog />
                        </div>
                    </div>
                </DrawerHeader>
            </DrawerContent>
        </Drawer>
    )
}

export default OnRampDialog
