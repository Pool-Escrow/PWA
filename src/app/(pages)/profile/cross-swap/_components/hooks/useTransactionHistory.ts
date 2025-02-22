import { useWallets } from "@privy-io/react-auth"
import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import { toast } from "sonner"
import { useSwapContext } from "../../context/SwapContext"
import type {
    APIResponse,
    OKXHistoryResponse,
    OKXHistoryTransaction,
    OKXNetwork,
    OKXSwapStatus,
    OKXToken,
    Transaction,
} from "../../types"
import { chainIdToName, tokenAddressToLogo, tokenAddressToName } from "../../utils/formatters"
import { CONFIG } from "../config"

interface UseTransactionHistoryProps {
    fetchedNetworks: OKXNetwork[]
    fetchedTokens: OKXToken[]
    walletAddress?: string
    onSwapComplete?: boolean
}

export const useTransactionHistory = ({
    fetchedNetworks,
    fetchedTokens,
    walletAddress,
    onSwapComplete,
}: UseTransactionHistoryProps) => {
    const { wallets } = useWallets()
    const { state, dispatch } = useSwapContext()
    const { data: transactions, refetch } = useQuery({
        queryKey: ["transactionHistory", walletAddress, wallets[0]],
        queryFn: async () => {
            if (!walletAddress || !wallets[0]) return []
            const results: Transaction[] = []
            try {
                const params = {
                    address: wallets[0].address,
                    chains: [
                        state.fromNetwork.chainId,
                        "1",
                        "42161",
                        "10",
                        "59144",
                        "100",
                        "324",
                        "534352",
                        "1",
                        "8453",
                    ],
                }
                const res = await fetch(`/api/cross-swap`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(params),
                })

                const data = (await res.json()) as APIResponse<OKXHistoryResponse[]>
                if (!data.data?.[0]?.transactionList) {
                    return []
                }

                const txns = data.data[0].transactionList.filter(
                    (txn: OKXHistoryTransaction) => txn.txStatus === "success" && txn.itype === "2",
                )
                toast.message("Fetching transaction history... Please wait")

                for (const txn of txns) {
                    try {
                        console.log("txn", txn)
                        const res = await fetch(`/api/swap-status`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                hash: txn.txHash,
                            }),
                        })

                        const statusData: OKXSwapStatus = ((await res.json()) as APIResponse<OKXSwapStatus[]>).data[0]
                        if (
                            (statusData.status === "SUCCESS" || statusData.status === "PENDING") &&
                            results.length < 6
                        ) {
                            await new Promise(resolve => setTimeout(resolve, 1000))
                            results.push({
                                id: txn.txHash,
                                date: new Date(parseInt(txn.txTime)).toISOString(),
                                fromChain: {
                                    chainId: statusData.fromChainId,
                                    name: chainIdToName(statusData.fromChainId, fetchedNetworks) || "Unknown",
                                },
                                toChain: {
                                    chainId: statusData.toChainId,
                                    name:
                                        chainIdToName(statusData.toChainId, fetchedNetworks) ||
                                        CONFIG.CHAIN.BASE.chainId,
                                },
                                amount: statusData.fromAmount,
                                toAmount: statusData.toAmount,
                                fromToken: {
                                    name: tokenAddressToName(statusData.fromTokenAddress, fetchedTokens) || "Unknown",
                                    logo: tokenAddressToLogo(statusData.fromTokenAddress, fetchedTokens) || "",
                                },
                                toToken: {
                                    name: CONFIG.CHAIN.BASE.tokens.USDC.tokenSymbol,
                                    logo: CONFIG.CHAIN.BASE.tokens.USDC.tokenLogoUrl,
                                },
                                toTxnHash: statusData.toTxHash,
                                status: statusData.detailStatus,
                            })
                        } else {
                            await new Promise(resolve => setTimeout(resolve, 1000))
                            continue
                        }
                    } catch (error) {
                        console.error(`Error fetching status for ${txn.txHash}:`, error)
                    }
                }
            } catch (error) {
                console.error("Error fetching transaction history:", error)
                toast.error("Failed to fetch transaction history")
            }
            dispatch({ type: "SET_HISTORY", payload: results })
            toast.success("Transaction history fetched successfully")
            return results
        },
        enabled: !!walletAddress && !!fetchedNetworks.length && !!fetchedTokens.length,
        staleTime: 30 * 1000,
    })

    useEffect(() => {
        if (onSwapComplete) {
            void refetch()
        }
    }, [onSwapComplete, refetch])

    return {
        transactions: transactions ?? [],
        refetchTransactions: refetch,
    }
}
