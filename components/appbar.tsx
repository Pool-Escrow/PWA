import { removeTokenCookie } from '@/hooks/cookie'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

import leftArrowImage from '@/public/images/left_arrow.svg'

import frogImage from '@/public/images/frog.png'
import keyboardReturnImage from '@/public/images/keyboard_return.svg'
import { Comfortaa } from 'next/font/google'
import { useEffect, useState } from 'react'

import { fetchUserDisplayForAddress } from '@/lib/api/clientAPI'
import { useQuery } from '@tanstack/react-query'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from './ui/dropdown-menu'

const comfortaa = Comfortaa({ subsets: ['latin'] })

interface AppBarProps {
	backRoute?: string // Required color property
	pageTitle?: string // Optional size property
	rightMenu?: RightMenu
}

const Appbar = ({ backRoute, pageTitle, rightMenu }: AppBarProps) => {
	const router = useRouter()
	const { wallets, ready: walletsReady } = useWallets()
	const [pageUrl, setPageUrl] = useState('')

	const { ready, authenticated, logout } = usePrivy()

	const handleAccountClick = () => {
		router.push('/user-profile')
	}

	const { data: profileData } = useQuery({
		queryKey: ['loadProfileImage', wallets?.[0]?.address],
		queryFn: fetchUserDisplayForAddress,
		enabled: wallets.length > 0,
	})

	useEffect(() => {
		if (ready && !authenticated) {
			router.replace('/login')
		}

		if (ready && authenticated && walletsReady && wallets?.length == 0) {
			logout()
			removeTokenCookie()
		}

		setPageUrl(window?.location.href)
	}, [
		profileData,
		ready,
		authenticated,
		router,
		walletsReady,
		wallets?.length,
		logout,
	])

	return (
		<header className='fixed left-0 top-0 z-20 w-full bg-white pt-safe'>
			<nav className=' px-safe '>
				<div className='mx-auto flex h-20 max-w-screen-md items-center justify-between px-6'>
					<div className='flex w-16'>
						{backRoute && (
							<Link href={backRoute ?? ''}>
								<Image
									className='size-10'
									src={`${leftArrowImage.src}`}
									alt='Back'
									height={40}
									width={40}
								/>
							</Link>
						)}
					</div>
					<div className='flex flex-1 items-center'>
						{pageTitle ? (
							<h1
								className={`size-full text-center text-xl font-medium md:text-3xl`}
							>
								{pageTitle}
							</h1>
						) : (
							<Link href='/' className='w-full text-center'>
								<h1
									className={`size-full text-center text-5xl font-bold ${comfortaa.className}`}
								>
									pool
								</h1>
							</Link>
						)}
					</div>
					<div className='flex w-16 justify-end space-x-6'>
						{rightMenu == RightMenu.ProfileImage ||
							(rightMenu == undefined && (
								<div>
									<button
										className='flex flex-col items-center'
										onClick={handleAccountClick}
									>
										<Image
											src={`${profileData?.profileImageUrl ?? frogImage.src}`}
											className='size-9 rounded-full object-cover'
											alt='Profile Image'
											height={36}
											width={36}
										/>
									</button>
								</div>
							))}
						{rightMenu == RightMenu.RefundMenu && (
							<div>
								{/* <button
									className='flex flex-col items-center'
									onClick={rightButtonCallback}
								>
									<svg
										width='20'
										height='20'
										viewBox='0 0 20 20'
										fill='white'
										xmlns='http://www.w3.org/2000/svg'
									>
										<path
											d='M5.55382 9.99995C5.55382 8.77772 4.55382 7.77772 3.3316 7.77772C2.10937 7.77772 1.10937 8.77772 1.10937 9.99995C1.10937 11.2222 2.10938 12.2222 3.3316 12.2222C4.55382 12.2222 5.55382 11.2222 5.55382 9.99995ZM7.77604 9.99995C7.77604 11.2222 8.77604 12.2222 9.99826 12.2222C11.2205 12.2222 12.2205 11.2222 12.2205 9.99995C12.2205 8.77772 11.2205 7.77772 9.99826 7.77772C8.77604 7.77772 7.77604 8.77772 7.77604 9.99995ZM14.4427 9.99995C14.4427 11.2222 15.4427 12.2222 16.6649 12.2222C17.8872 12.2222 18.8872 11.2222 18.8872 9.99994C18.8872 8.77772 17.8872 7.77772 16.6649 7.77772C15.4427 7.77772 14.4427 8.77772 14.4427 9.99995Z'
											fill='black'
										/>
									</svg>
								</button> */}
								<DropdownMenu>
									<DropdownMenuTrigger>
										<div className='size-12 rounded-full p-3'>
											<svg
												width='20'
												height='20'
												viewBox='0 0 20 20'
												fill='white'
												xmlns='http://www.w3.org/2000/svg'
											>
												<path
													d='M5.55382 9.99995C5.55382 8.77772 4.55382 7.77772 3.3316 7.77772C2.10937 7.77772 1.10937 8.77772 1.10937 9.99995C1.10937 11.2222 2.10938 12.2222 3.3316 12.2222C4.55382 12.2222 5.55382 11.2222 5.55382 9.99995ZM7.77604 9.99995C7.77604 11.2222 8.77604 12.2222 9.99826 12.2222C11.2205 12.2222 12.2205 11.2222 12.2205 9.99995C12.2205 8.77772 11.2205 7.77772 9.99826 7.77772C8.77604 7.77772 7.77604 8.77772 7.77604 9.99995ZM14.4427 9.99995C14.4427 11.2222 15.4427 12.2222 16.6649 12.2222C17.8872 12.2222 18.8872 11.2222 18.8872 9.99994C18.8872 8.77772 17.8872 7.77772 16.6649 7.77772C15.4427 7.77772 14.4427 8.77772 14.4427 9.99995Z'
													fill='black'
												/>
											</svg>
										</div>
									</DropdownMenuTrigger>
									<DropdownMenuContent sideOffset={0}>
										<DropdownMenuItem>
											<Link href={`${pageUrl}/refund`}>
												<div className='flex flex-row items-center justify-center space-x-2'>
													<span>
														<Image
															alt='keyboard return'
															className='flex size-full'
															src={keyboardReturnImage.src}
															width={20}
															height={20}
														/>
													</span>
													<span>Issue refund</span>
												</div>
											</Link>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						)}
						{rightMenu == RightMenu.ManageParticipants && (
							<div>
								<button className='flex flex-col items-center'>
									<Image
										alt='Profile Image'
										src={`${profileData?.profileImageUrl ?? frogImage.src}`}
										width={36}
										height={36}
										className='size-9 rounded-full object-cover'
									/>
								</button>
							</div>
						)}
					</div>
				</div>
			</nav>
		</header>
	)
}

export default Appbar

export enum RightMenu {
	ProfileImage = 0,
	RefundMenu = 1,
	ManageParticipants = 2,
}
