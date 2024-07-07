import { useAccount, useWriteContract } from 'wagmi'
import { useWriteContracts, useCapabilities } from 'wagmi/experimental'

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
	const { writeContracts } = useWriteContracts()
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
				writeContracts({ contracts: args });
			} else {
				writeContracts({ contracts: [args[0]] });
			}
		} else {
			writeContract(args[0])
		}
	}

	return { sponsoredTxn }
}
