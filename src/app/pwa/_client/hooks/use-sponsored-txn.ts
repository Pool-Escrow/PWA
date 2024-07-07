import type { Address } from 'viem'
import { useAccount, useWriteContract } from 'wagmi'
import { useCallsStatus, useCapabilities, useWriteContracts } from 'wagmi/experimental'

interface ContractCall {
    address: Address
    // eslint-disable-next-line
    abi: any
    functionName: string
    // eslint-disable-next-line
    args: any[]
}

type ContractCalls = ContractCall[]

export const useSponsoredTxn = () => {
    /// Coinbase Paymaster hooks
    const account = useAccount()
    const { data: id, writeContracts } = useWriteContracts()
    const { data: callsStatus } = useCallsStatus({
        id: id as string,
        query: {
            enabled: !!id,
            // Poll every second until the calls are confirmed
            refetchInterval: data => (data.state.data?.status === 'CONFIRMED' ? false : 1000),
        },
    })
    const { writeContract } = useWriteContract()
    const { data: availableCapabilities } = useCapabilities({
        account: account.address,
    })

    /// Coinbase Paymaster function
    const sponsoredTxn = (args: ContractCalls) => {
        if (!availableCapabilities || !account.chainId) return {}
        const capabilitiesForChain = availableCapabilities[account.chainId]
        // eslint-disable-next-line
        if (capabilitiesForChain['paymasterService'] && capabilitiesForChain['paymasterService'].supported) {
            const capabilities = {
                paymasterService: {
                    url: process.env.NEXT_PUBLIC_COINBASE_PAYMASTER_URL,
                },
            }
            // eslint-disable-next-line
            if (capabilitiesForChain['atomicBatch'] && capabilitiesForChain['atomicBatch'].supported) {
                writeContracts({ contracts: args, capabilities })
            } else {
                writeContracts({ contracts: [args[0]], capabilities })
            }
        } else {
            writeContract(args[0])
        }
    }

    return { sponsoredTxn, callsStatus }
}
