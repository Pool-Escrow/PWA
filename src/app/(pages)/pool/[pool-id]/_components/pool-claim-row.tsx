// src/components/pool-detail/pool-detail.tsx
'use client'

import { Button } from '@/app/_components/ui/button'
import { CircleCheckIcon } from 'lucide-react'

interface PoolDetailsProps {
    poolId: string
}
const PoolClaimRow = (_props: PoolDetailsProps) => {
    // const { wallets } = useWallets()
    // const { winnerDetail /* isLoading, */ /* error */ } = useWinnerDetail(BigInt(props.poolId), wallets[0]?.address)
    // // const queryClient = useQueryClient()
    // // const { adminData } = useAdmin()
    // // const setBottomBarContent = useAppStore(state => state.setBottomBarContent)
    // const { data: hash, /*isPending,*/ writeContract /* writeContractAsync*/ } = useWriteContract()
    // const { sponsoredTxn } = useSponsoredTxn()
    // const {
    //     isLoading: isConfirming,
    //     isSuccess: isConfirmed,
    //     isError,
    //     // error: registerError,
    //     // data: txData,
    // } = useWaitForTransactionReceipt({
    //     hash,
    // })

    // useEffect(() => {
    //     if (isConfirmed) {
    //         toast.message('Transaction Success', { description: 'Claimed winnings successfully' })
    //     }
    // }, [isConfirmed, isConfirming, isError])

    // const claimAmount = BigInt(winnerDetail?.winnerDetailFromSC?.amountWon ?? 0)
    // const claimed = winnerDetail?.winnerDetailFromSC?.claimed ?? false

    const onClaimButtonClicked = () => {
        console.log('onClaimButtonClicked')
        // try {
        //     const ClaimWinningFunction = getAbiItem({
        //         abi: poolAbi,
        //         name: 'claimWinning',
        //     })
        //     if (
        //         wallets[0].walletClientType === 'coinbase_smart_wallet' ||
        //         wallets[0].walletClientType === 'coinbase_wallet'
        //     ) {
        //         sponsoredTxn([
        //             {
        //                 address: currentPoolAddress,
        //                 abi: [ClaimWinningFunction],
        //                 functionName: 'claimWinning',
        //                 args: [BigInt(props.poolId), wallets[0]?.address as Address],
        //             },
        //         ])
        //     } else {
        //         writeContract({
        //             address: currentPoolAddress,
        //             abi: [ClaimWinningFunction],
        //             functionName: 'claimWinning',
        //             args: [BigInt(props.poolId), wallets[0]?.address as Address],
        //         })
        //     }
        // } catch (error) {
        //     console.log('claimWinning Error', error)
        // }
    }

    // if (claimAmount === BigInt(0)) {
    //     return
    // }

    return (
        <div className='mb-4 flex flex-col'>
            <div className='mb-1 flex justify-between font-medium text-[#003073]'>
                <div className='inline-flex items-center gap-1'>
                    <CircleCheckIcon />
                    <span className='font-semibold'>Winner</span>
                </div>
                {/* <span>${winnerDetail?.winnerDetailFromSC?.amountWon?.toString()}</span> */}
            </div>
            <Button
                onClick={onClaimButtonClicked}
                className='active:btn-cta-active btn-cta mb-3 h-[46px] w-full flex-1 grow flex-row items-center justify-center rounded-[2rem] px-6 py-[11px] text-center align-middle font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                Claim winnings
            </Button>
        </div>
    )
}

export default PoolClaimRow
