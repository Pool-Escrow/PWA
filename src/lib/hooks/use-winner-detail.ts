import { wagmi } from '@/providers/configs'
import { useQuery } from '@tanstack/react-query'
import { fetchWinnerDetail } from '../contracts/fetch-winner-detail'

export const useWinnerDetail = (poolId: bigint, address: string) => {
    const {
        data: winnerDetail,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['winnersDetail', poolId, address, wagmi.config.state.chainId],
        queryFn: fetchWinnerDetail,
    })

    return { winnerDetail, isLoading, error }
}
