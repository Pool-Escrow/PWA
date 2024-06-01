import Appbar from '@/components/appbar'
import Page from '@/components/page'
import Section from '@/components/section'
import UpcomingPoolTab from '@/components/tabs/UpcomingPoolTab'
import { Button } from '@/components/ui/button'
import { dropletAddress } from '@/lib/contracts/generated'
import {
	BiconomyPaymaster,
	BiconomySmartAccountV2,
	Bundler,
	DEFAULT_ECDSA_OWNERSHIP_MODULE,
	DEFAULT_ENTRYPOINT_ADDRESS,
	ECDSAOwnershipValidationModule,
	PaymasterMode,
} from '@biconomy/account'
import { useWallets } from '@privy-io/react-auth'
import { ethers } from 'ethers'
import { parseEther } from 'viem'
import { baseSepolia } from 'viem/chains'

const bundlerUrl = process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL!
const biconomyPaymasterApiKey =
	process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_API_KEY!

export default function App() {
	const { wallets } = useWallets()

	const mintTest = async () => {
		console.log('Minting 50 tokens')
		const embeddedWallet = wallets.find(
			(wallet) => wallet.walletClientType === 'privy',
		)
		if (embeddedWallet) {
			await embeddedWallet.switchChain(baseSepolia.id)
			console.log('Switched to Base Sepolia')

			const embeddedProvider = await embeddedWallet.getEthersProvider()
			const signer = embeddedProvider.getSigner()
			console.log('Signer for embedded wallet', signer)
			console.log('Provider for embedded wallet', embeddedProvider)

			const bundler = new Bundler({
				bundlerUrl,
				chainId: baseSepolia.id,
				entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
			})

			const paymaster = new BiconomyPaymaster({
				paymasterUrl:
					'https://paymaster.biconomy.io/api/v1/84532/-ApKfWhHJ.5f74ae43-6572-455e-a6ef-b97bff8b539e',
			})

			const validationModule = await ECDSAOwnershipValidationModule.create({
				signer,
				moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE,
			})

			const smartAccount = await BiconomySmartAccountV2.create({
				provider: embeddedProvider as any,
				chainId: baseSepolia.id,
				bundler,
				paymaster,
				entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
				defaultValidationModule: validationModule,
				// signer,
				// bundlerUrl,
				// biconomyPaymasterApiKey,
			})

			const smartAccountAddress = await smartAccount.getAccountAddress()
			console.log('Smart Account Address', smartAccountAddress)

			// ideally we save the smartAccount into global context for easy access

			// Initialize an ethers contract instance
			const dropletMintTx = new ethers.Interface([
				'function mint(address,uint256)',
			])
			const data = dropletMintTx.encodeFunctionData('mint', [
				smartAccountAddress,
				parseEther('50'),
			])

			const mintTransaction = {
				to: dropletAddress[baseSepolia.id],
				data,
			}

			// Send transaction to mempool, to mint tokens gaslessly
			const userOp = await smartAccount.buildUserOp([mintTransaction], {
				paymasterServiceData: { mode: PaymasterMode.SPONSORED },
			})
			console.log('UserOp Response', userOp)

			// const { transactionHash } = await userOpResponse.waitForTxHash()
			// console.log('Transaction Hash', transactionHash)

			// const userOpReceipt = await userOpResponse.wait()
			// if (userOpReceipt.success == 'true') {
			// 	console.log('UserOp receipt', userOpReceipt)
			// 	console.log('Transaction receipt', userOpReceipt.receipt)
		} else {
			console.log('No embedded wallet found')
		}
	}

	return (
		<Page>
			<Appbar />
			<Section>
				<div className='flex justify-center  w-full pt-20'>
					<div className='flex flex-col w-96 space-y-8'>
						<div>
							<h3 className='font-semibold'>Upcoming Pools</h3>
							<UpcomingPoolTab />
						</div>
					</div>
					<Button onClick={mintTest}>Give me ma 50 tokenz!</Button>
				</div>
			</Section>
		</Page>
	)
}
