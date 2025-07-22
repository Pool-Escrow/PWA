import Divider from '@/components/divider'
import { Button } from '@/components/ui/button'
import { Drawer } from '@/components/ui/drawer'
import { currentTokenAddress } from '@/server/blockchain/server-config'
import type { MoonpayCurrencyCode, MoonpayPaymentMethod } from '@privy-io/react-auth'
import { useFundWallet, useWallets } from '@privy-io/react-auth'
import type { Dispatch, SetStateAction } from 'react'
import { useAccount, useBalance } from 'wagmi'

interface OnRampDialogProps {
    open: boolean
    setOpen: Dispatch<SetStateAction<boolean>>
    amount?: string
}

const OnRampDialog = ({ open, setOpen, amount }: OnRampDialogProps) => {
    const { address } = useAccount()

    // Only proceed with balance query if we have valid prerequisites
    const canFetchBalance = Boolean(address && currentTokenAddress)

    // Debug log for USDC balance request - only when we actually make the request
    if (process.env.NODE_ENV === 'development' && canFetchBalance) {
        console.log('[DEBUG][OnRampDialog] useBalance USDC', {
            address,
            token: currentTokenAddress,
            stack: new Error().stack?.split('\n').slice(1, 3).join(' | '),
            timestamp: new Date().toISOString(),
        })
    }

    const { data: balance } = useBalance({
        token: currentTokenAddress,
        address,
        query: {
            staleTime: 60_000, // Consider data fresh for 1 minute
            gcTime: 300_000, // Keep in cache for 5 minutes
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchInterval: false, // ✅ DISABLED automatic polling to prevent excessive requests
            enabled: canFetchBalance,
        },
    })

    const formattedBalance = Number(balance?.value) / Math.pow(10, Number(balance?.decimals))

    const { wallets } = useWallets()
    const { fundWallet } = useFundWallet()
    const fundWithMoonpay = async () => {
        const fundWalletConfig = {
            currencyCode: 'USDC_BASE' as MoonpayCurrencyCode, // Purchase ETH on Ethereum mainnet
            quoteCurrencyAmount: Number(amount ?? 10), // Purchase 0.05 ETH
            paymentMethod: 'credit_debit_card' as MoonpayPaymentMethod, // Purchase with credit or debit card
            uiConfig: { accentColor: '#696FFD' }, // Styling preferences for MoonPay's UIs
        }
        await fundWallet(wallets[0].address, { config: fundWalletConfig })
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <Drawer.Trigger asChild />
            <Drawer.Content className='bg-white'>
                <Drawer.Header className='text-left'>
                    <Drawer.Title className='mb-6 text-xl'>
                        You need to add USDC in order to register for this event.
                    </Drawer.Title>
                    <div>
                        <div className='flex flex-row justify-between text-sm'>
                            <span className='font-medium'>Your current balance:</span>
                            <span className='font-medium'>
                                ${formattedBalance} {balance?.symbol}
                            </span>
                        </div>
                        <Divider className='my-0 h-0 py-0' />
                    </div>

                    <div className='flex w-full flex-col'>
                        {/* <div className='mb-6 flex w-full flex-row items-center justify-between'>
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
                        </div> */}

                        {/* <div className='mb-6 flex w-full flex-row items-center justify-between'>
                            <div className='flex flex-col'>
                                <div className='font-semibold'>Buy with Coinbase Pay</div>
                                <div className='text-sm text-gray-500'>
                                    Using cards, banks and international options
                                </div>
                            </div> */}
                        {/* <Button className='h-10 w-20 rounded-[2rem] bg-cta text-center text-xs font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                                Buy
                            </Button> */}
                        {/* <OnRampCoinbaseButton className='h-10 w-20 rounded-[2rem] bg-cta text-center text-xs font-semibold leading-normal text-white shadow-button active:shadow-button-push' /> */}
                        {/* </div> */}

                        {/* <div className='mb-6 flex w-full flex-row items-center justify-between'>
                            <div className='flex flex-col'>
                                <div className='font-semibold'>Buy with Stripe</div>
                                <div className='text-sm text-gray-500'>
                                    Using cards, banks and international options
                                </div>
                            </div>
                            <OnrampWithStripe />
                        </div> */}

                        <div className='mb-6 flex w-full flex-row items-center justify-between'>
                            <div className='flex flex-col'>
                                <div className='font-semibold'>Buy with Moonpay</div>
                                <div className='text-sm text-gray-500'>
                                    Using cards, banks and international options
                                </div>
                            </div>

                            <Button
                                onClick={() => void fundWithMoonpay()}
                                className='h-10 w-20 rounded-[2rem] bg-cta text-center text-xs font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                                On Ramp
                            </Button>
                        </div>

                        {/* <div className='mb-6 flex w-full flex-row items-center justify-between'>
                            <div className='flex flex-col'>
                                <div className='font-semibold'>External Wallet</div>
                                <div className='text-sm text-gray-500'>Receive from Coinbase, Rainbow or Metamask</div>
                            </div> */}
                        {/* <Button className='h-10 w-20 rounded-[2rem] bg-cta text-center text-xs font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                                Receive
                            </Button> */}
                        {/* <OnRampForm decimalPlaces={BigInt(18)} balance={BigInt(100)} /> */}
                        {/* <ReceiveDialog />
                        </div> */}
                    </div>
                </Drawer.Header>
            </Drawer.Content>
        </Drawer>
    )
}

export default OnRampDialog
