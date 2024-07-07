'use client'

import { useWriteContract } from 'wagmi'
import { useWallets } from '@privy-io/react-auth'
import { useSponsoredTxn } from '@/hooks/use-sponsored-txn'
import { Button } from '../ui/button'

export default function SponsoredTxn(prop: {
    text: string
    targetAddress: `0x${string}`
    abi: any
    functionName: string
    args: any[]
}) {
    const { writeContract } = useWriteContract()
    const { wallets } = useWallets()
    const { sponsoredTxn } = useSponsoredTxn()

    const sendTransaction = () => {
        console.log('Sending transaction')
        if (wallets[0].walletClientType === 'coinbase_smart_wallet' || wallets[0].walletClientType === 'coinbase_wallet') {
            sponsoredTxn({
                targetAddress: prop.targetAddress,
                abi: prop.abi,
                functionName: prop.functionName,
                args: prop.args,
            })
        } else {
            writeContract({
                address: prop.targetAddress,
                abi: prop.abi,
                functionName: prop.functionName,
                args: prop.args,
            })
        }
    }
    // if (!availableCapabilities || !account.chainId) return null

    return <Button className='h-[30px] w-[100px] rounded-mini bg-cta px-[10px] py-[5px] text-[10px]' onClick={sendTransaction}>{`${prop.text}`}</Button>
}
