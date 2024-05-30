import Page from '@/components/page'
import Section from '@/components/section'
import Image from 'next/image'
import poolImage from '@/public/images/pool.png'
import { useRouter } from 'next/router'
import { useLogout, usePrivy, useWallets } from '@privy-io/react-auth'
import { chain } from '@/constants/constant'
import React, { useState, useEffect } from 'react'

import Link from 'next/link'

const LoginPage = () => {
	const router = useRouter()
	const { ready, authenticated, user, signMessage, login, logout } = usePrivy()

	const handleClick = () => {
		// Replace '/your-link' with the actual path you want to navigate to
		// router.push('/wallet-selection')
		login()
	}

	const { wallets } = useWallets()

	const signOut = async () => {
		await logout()
	}

	useEffect(() => {
		if (ready && !authenticated) {
			// Replace this code with however you'd like to handle an unauthenticated user
			// As an example, you might redirect them to a sign-in page
		}

		if (ready && authenticated && wallets?.length > 0) {
			// Replace this code with however you'd like to handle an authenticated user
			router.push('/')
			// console.log('ready and authenticated')
		}
	}, [ready, authenticated, wallets, router])

	return (
		<Page>
			<Section>
				<div className='flex justify-center h-full w-full items-center relative'>
					<div className='flex flex-col w-96 h-96'>
						<div className='flex row items-center w-full'>
							<Image className='mx-auto' src={poolImage} alt='pool image' />
						</div>
						<h2 className='text-xl font-bold text-zinc-800 tagline-text text-center align-top w-full mt-28'>
							Pooling made simple.
						</h2>
						<h2
							className={` font-semibold text-center align-top w-full tagline-text`}
						>
							<span
								className={`font-semibold gradient-text text-center align-top w-full`}
							>
								For everyone.
							</span>
						</h2>

						<div className='flex justify-center items-center h-full w-full mt-28'>
							<button
								className='rounded-full gradient-background px-28 py-3'
								onClick={handleClick}
							>
								Connect wallet
							</button>
						</div>
					</div>
				</div>
			</Section>
		</Page>
	)
}

export default LoginPage
function setToken(tokenCookie: string) {
	throw new Error('Function not implemented.')
}
