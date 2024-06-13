import { loadEnvironmentUrls } from '@/utils/environment'
import {
	BiconomyPaymaster,
	BiconomySmartAccountV2,
	Bundler,
	DEFAULT_ECDSA_OWNERSHIP_MODULE,
	DEFAULT_ENTRYPOINT_ADDRESS,
	ECDSAOwnershipValidationModule,
} from '@biconomy/account'
import { ConnectedWallet } from '@privy-io/react-auth'
import { WalletClient } from 'viem'
import { baseSepolia } from 'viem/chains'

export const initializeSmartAccount = async (
	embeddedWallet: ConnectedWallet,
) => {
	const { bundlerUrl, paymasterUrl } = loadEnvironmentUrls()

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

	const smartAccount = await BiconomySmartAccountV2.create({
		provider: embeddedProvider as unknown as WalletClient,
		chainId: baseSepolia.id,
		bundler,
		paymaster,
		entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
		defaultValidationModule: validationModule,
	})

	return smartAccount
}
