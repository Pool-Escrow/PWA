import Page from '@/components/page'
import Section from '@/components/section'
import Image from 'next/image'
import poolImage from '@/public/images/pool.png'
import { useRouter } from 'next/router'
import {
	UnsignedTransactionRequest,
	usePrivy,
	useWallets,
} from '@privy-io/react-auth'

import React, { useState, useEffect } from 'react'

import { ethers } from 'ethers'
import Appbar from '@/components/appbar'

import { FundWalletConfig } from '@privy-io/react-auth'

const Account = () => {
	const router = useRouter()
	const { ready, authenticated, user, signMessage, sendTransaction, logout } =
		usePrivy()

	const { wallets } = useWallets()

	// Replace this with the message you'd like your user to sign
	const message = 'Hello world'
	// Replace this with the text you'd like on your signature modal,
	// if you do not have `noPromptsOnSignature` enabled
	if (ready && !authenticated) {
		// Replace this code with however you'd like to handle an unauthenticated user
		// As an example, you might redirect them to a sign-in page
		router.push('/')
	}

	const handleCreatePool = async () => {
		router.push('/create-pool')
	}
	const handleJoinPool = () => {
		router.push('created-pools')
	}
	const handleSharePool = () => {}
	const handleSignOut = () => {
		logout()
	}

	const handleFundAccount = async () => {
		const wallet = wallets[0]
		await wallet.fund({ config: {}, provider: 'moonpay' })
	}

	useEffect(() => {
		// Update the document title using the browser API
		if (wallets.length > 0) {
			console.log(`Wallet Length: ${wallets.length}`)
			console.log(`Wallet Address: ${wallets[0].address}`)
		}
	}, [wallets])

	return (
		<Page>
			<Appbar />
			<Section>
				<div className='flex justify-center h-full w-full items-center'>
					<div className='flex flex-col w-96 h-96'>
						<div className='flex row items-center w-full'>
							<Image className='mx-auto' src={poolImage} alt='pool image' />
						</div>

						<div className='flex justify-between items-center h-full w-full mt-28 '>
							<button
								className='rounded-full gradient-background px-4 py-4'
								onClick={handleFundAccount}
							>
								Fund Account
							</button>
							<button
								className='rounded-full gradient-background px-4 py-4'
								onClick={() => router.push('/account/transfer')}
							>
								Transfer
							</button>
							{/* <button
								className='rounded-full gradient-background px-4 py-4'
								onClick={handleJoinPool}
							>
								Join Pool
							</button>
							<button
								className='rounded-full gradient-background px-4 py-4'
								onClick={handleSharePool}
							>
								Share Pool
							</button> */}
						</div>
					</div>
				</div>
			</Section>
		</Page>
	)
}

export default Account
