import { useAccount, useWriteContract } from 'wagmi'
import { useWriteContracts, useCapabilities } from 'wagmi/experimental'

export const useSponsoredTxn = () => {
	/// Coinbase Paymaster hooks
	const account = useAccount()
	const { writeContracts } = useWriteContracts()
	const { writeContract } = useWriteContract()
	const { data: availableCapabilities } = useCapabilities({
		account: account.address,
	})

	/// Coinbase Paymaster function
	const sponsoredTxn = (args: { targetAddress: `0x${string}`; abi: any; functionName: string; args: any[] }) => {
		if (!availableCapabilities || !account.chainId) return {}
		const capabilitiesForChain = availableCapabilities[account.chainId]
		if (capabilitiesForChain['paymasterService'] && capabilitiesForChain['paymasterService'].supported) {
			const capabilities = {
				paymasterService: {
					url: process.env.NEXT_PUBLIC_COINBASE_PAYMASTER_URL,
				},
			}
			writeContracts({
				contracts: [
					{
						address: args.targetAddress,
						abi: args.abi,
						functionName: args.functionName,
						args: args.args,
					},
				],
				capabilities,
			})
		} else {
			writeContract({
				address: args.targetAddress,
				abi: args.abi,
				functionName: args.functionName,
				args: args.args,
			})
		}
	}

	return { sponsoredTxn }
}
