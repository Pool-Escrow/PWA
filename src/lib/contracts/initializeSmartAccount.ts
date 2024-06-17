import {
	BiconomyPaymaster,
	Bundler,
	DEFAULT_ECDSA_OWNERSHIP_MODULE,
	DEFAULT_ENTRYPOINT_ADDRESS,
	ECDSAOwnershipValidationModule,
	createSmartAccountClient,
} from '@biconomy/account'
import { ConnectedWallet } from '@privy-io/react-auth'
import { WalletClient } from 'viem'
import { baseSepolia } from 'viem/chains'

const bundlerUrl = process.env.NEXT_PUBLIC_BUNDLER_URL
const paymasterUrl = process.env.NEXT_PUBLIC_PAYMASTER_URL

export const initializeSmartAccount = async (
	embeddedWallet: ConnectedWallet,
) => {
	if (!bundlerUrl || !paymasterUrl) {
		throw new Error('Missing environment variables for bundler or paymaster')
	}

	await embeddedWallet.switchChain(baseSepolia.id)
	const embeddedProvider = await embeddedWallet.getEthersProvider()
	const signer = embeddedProvider.getSigner()

	const bundler = new Bundler({
		bundlerUrl,
		chainId: baseSepolia.id,
		entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
	})
	const paymaster = new BiconomyPaymaster({ paymasterUrl })
	const validationModule = await ECDSAOwnershipValidationModule.create({
		signer,
		moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE,
	})

	const smartAccount = await createSmartAccountClient({
		provider: embeddedProvider as unknown as WalletClient,
		chainId: baseSepolia.id,
		bundler,
		paymaster,
		entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
		defaultValidationModule: validationModule,
	})

	return smartAccount
}
