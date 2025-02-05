import { useWinnerDetail } from '@/app/(pages)/pool/[pool-id]/_components/use-winner-detail'
import { useWallets } from '@privy-io/react-auth'
import { capitalize } from 'lodash'
import PoolCardRowImage from './pool-card-row-image'
import { useQuery } from '@tanstack/react-query'
import { getPoolDetailsById } from '@/features/pools/server/db/pools'
import { formatUnits } from 'viem'

interface PoolCardRowProps {
    poolId: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PoolCardRow = ({ poolId }: PoolCardRowProps) => {
    const { wallets } = useWallets()

    const {
        data: pool,
        isPending: isPoolPending,
        isError: isPoolError,
    } = useQuery({
        queryKey: ['pool-details', poolId],
        queryFn: getPoolDetailsById,
    })
    const { winnerDetail, isLoading, error } = useWinnerDetail(poolId, wallets?.[0]?.address)

    const formatAmount = (num: number): string => {
        if (num < 0.01) {
            return num.toExponential(0)
        }
        return num.toFixed(2)
    }

    const wonAmount = formatAmount(
        Number(formatUnits(winnerDetail?.winnerDetailFromSC?.amountWon ?? BigInt(0), pool?.tokenDecimals ?? 18)),
    )

    return (
        <div className='flex items-center justify-start gap-[10px]'>
            <PoolCardRowImage image={pool?.imageUrl ?? ''} />
            <div className='flex-1'>
                <div className='overflow-hidden text-ellipsis text-nowrap text-xs font-medium text-black'>
                    {pool?.name}
                </div>
                <div className='text-[11px] font-semibold text-[#5371E7]'>{capitalize('Winner')}</div>
            </div>
            <div className='flex items-center gap-[6px] font-thin'>
                <div className='inline-flex h-[30px] w-[43px] flex-nowrap items-center justify-center gap-1.5 rounded-[9px] bg-[#D9E4FF] py-[5px]'>
                    <div className='text-center text-[10px] font-medium leading-tight text-[#5674EA]'>${wonAmount}</div>
                </div>
            </div>
        </div>
    )
}

export default PoolCardRow
