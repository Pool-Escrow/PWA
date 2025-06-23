import { getWinnerDetail } from '@/lib/blockchain/functions/pool/get-winner-detail'
import { getConfig } from '@/providers/configs/wagmi.config'
import { useQuery } from '@tanstack/react-query'

export const useWinnerDetail = (poolId: string, address: string) => {
    const {
        data: winnerDetail,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['get-winner-detail', poolId, address, getConfig().state.chainId],
        queryFn: getWinnerDetail,
    })

    return { winnerDetail, isLoading, error }
}
