import { useAccount, useWriteContract } from 'wagmi'
import { useWriteContracts, useCapabilities, useCallsStatus } from 'wagmi/experimental'

interface ContractCall {
	address: `0x${string}`;
	abi: any;
	functionName: string;
	args: any[];
}

type ContractCalls = ContractCall[]; 

export const useSponsoredTxn = () => {
	/// Coinbase Paymaster hooks
	const account = useAccount()
	const { data: id, writeContracts } = useWriteContracts()
	const { data: callsStatus } = useCallsStatus({ 
		id: id as string, 
		query: { 
		enabled: !!id, 
		// Poll every second until the calls are confirmed
		refetchInterval: (data) =>
			data.state.data?.status === "CONFIRMED" ? false : 1000, 
		}, 
	}); 
	const { writeContract } = useWriteContract()
	const { data: availableCapabilities } = useCapabilities({
		account: account.address,
	})

	/// Coinbase Paymaster function
	const sponsoredTxn = (args: ContractCalls) => {
		if (!availableCapabilities || !account.chainId) return {}
		const capabilitiesForChain = availableCapabilities[account.chainId]
		if (capabilitiesForChain['paymasterService'] && capabilitiesForChain['paymasterService'].supported) {
			const capabilities = {
				paymasterService: {
					url: process.env.NEXT_PUBLIC_COINBASE_PAYMASTER_URL,
				},
			}
			if (capabilitiesForChain['atomicBatch'] && capabilitiesForChain['atomicBatch'].supported) {
				writeContracts({ contracts: args, capabilities });
			} else {
				writeContracts({ contracts: [args[args.length - 1]], capabilities });
			}
		} else {
			writeContract(args[args.length - 1])
		}
	}

	return { sponsoredTxn, callsStatus }
}
