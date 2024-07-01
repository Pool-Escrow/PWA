import frog from '@/../public/images/frog.png'
import { Badge } from '@/components/ui/badge'
import { usePoolDetailsDB } from '@/lib/hooks/use-pool-details-db'
import { useTokenDecimals } from '@/lib/hooks/use-token-decimals'
import { useWinnerDetail } from '@/lib/hooks/use-winner-detail'
import { useWallets } from '@privy-io/react-auth'
import { capitalize } from 'lodash'
import CircleCheckIcon from './circle-check.icon'
import PoolCardRowImage from './pool-card-row-image'
import { usePoolDetails } from '@/hooks/use-pool-details'

interface PoolCardRowProps {
    poolId: string
}

const PoolCardRow = ({ poolId }: PoolCardRowProps) => {
    const { wallets } = useWallets()
    const {
        poolDetailsDB,
        isLoading: isLoadingPoolDetailsDB,
        error: poolDetailsDBError,
    } = usePoolDetailsDB(BigInt(poolId))

    const { poolDetails } = usePoolDetails(BigInt(poolId))

    const { winnerDetail, isLoading, error } = useWinnerDetail(BigInt(poolId), wallets?.[0]?.address)
    const {
        tokenDecimalsData,
        isLoading: isLoadingTokenDecimal,
        error: errorTokenDecimal,
    } = useTokenDecimals(poolDetails?.poolDetailFromSC?.[4] ?? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913')
    return (
        <div className='flex items-center justify-start gap-[10px]'>
            <PoolCardRowImage image={poolDetailsDB?.poolImageUrl ?? frog.src} />
            <div className='flex-1'>
                <div className='overflow-hidden text-ellipsis text-nowrap text-xs font-medium text-black'>
                    {poolDetailsDB?.poolDBInfo?.name}
                </div>
                <div className='text-[11px] font-semibold text-[#2989EC]'>{capitalize('Winner')}</div>
            </div>
            <div className='flex items-center gap-[6px] font-thin'>
                <CircleCheckIcon />
                <Badge className='inline-flex h-[30px] w-[70px] flex-nowrap items-center justify-center gap-1.5 rounded-[9px] bg-[#6993FF]/25 px-2.5 py-[5px]'>
                    <div className='text-center text-[10px] font-medium leading-tight text-[#2989EC]'>
                        {(winnerDetail?.winnerDetailFromSC?.amountWon ?? BigInt(0)) /
                            BigInt(Math.pow(10, tokenDecimalsData?.tokenDecimals ?? 18))}
                    </div>
                </Badge>
            </div>
        </div>
    )
}

export default PoolCardRow
