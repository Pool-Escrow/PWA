import Page from '@/components/page'
import Section from '@/components/section'
import Image from 'next/image'
import poolEventImage from '@/public/images/poolEvent.png'
import cardSearchImage from '@/public/images/card_search_image.png'
import cardFindImage from '@/public/images/card_find_image.png'
import cardConnectImage from '@/public/images/card_connect_image.png'
import emailImage from '@/public/images/emailIcon.png'
import githubImage from '@/public/images/githubIcon.png'
import xImage from '@/public/images/xIcon.png'

import { useRouter } from 'next/router'
import {
	UnsignedTransactionRequest,
	usePrivy,
	useWallets,
} from '@privy-io/react-auth'

import React, { useState, useEffect } from 'react'

import { ethers } from 'ethers'
import Appbar from '@/components/appbar'

import { Inter } from 'next/font/google'
import { Comfortaa } from 'next/font/google'

import styles from './styles/home.module.css'
import PoolRow from '@/components/poolRow'
import UpcomingPoolTab from '@/components/tabs/UpcomingPoolTab'
import PastPoolTab from '@/components/tabs/PastPoolTab'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { title } from 'process'
import PoolFooter from '@/components/poolFooter'

const inter = Inter({ subsets: ['latin'] })
const comfortaa = Comfortaa({ subsets: ['latin'] })

const cardContent = [
	{
		image: cardSearchImage.src,
		alt: 'Image for finding a pool',
		title: 'Step 1: Find a Pool Party',
		description:
			'Browse through our curated list of events and choose the one that excites you.',
	},
	{
		image: cardFindImage.src,
		alt: 'Image for joining a pool',
		title: 'Step 2: Join the Party',
		description:
			"Click 'Join a Pool', scan the QR code, or follow the link to access the web app.",
	},
	{
		image: cardConnectImage.src,
		alt: 'Image for enjoy and connect',
		title: 'Step 3: Enjoy and Connect',
		description:
			'Attend the event, enjoy the activities, and connect with other participants.',
	},
]

const Home = () => {
	const router = useRouter()

	return (
		<div
			className={`flex min-h-screen w-full h-full bg-cover bg-center relative ${inter.className} flex flex-col justify-center items-center`}
			// style={{
			// 	backgroundImage: `url(${poolBackgroundImage.src})`,
			// }}
		>
			<div className='flex min-h-screen w-full justify-center'>
				<div className=' flex flex-col mt-4 w-full items-center max-w-4xl'>
					<section
						className={` ${styles.homeTopSection} rounded-3xl rounded-b-none`}
					>
						<div
							className={`rounded-3xl  flex ${styles.hero} w-full flex-col py-4 px-8`}
						>
							<ul className='flex flex-row justify-between h-20 items-center'>
								<li
									className={`text-white text-xl font-semibold ${comfortaa.className} flex items-center`}
								>
									pool
								</li>
								<Link
									href={'/'}
									className='text-black rounded-full bg-white px-4 py-2 text-sm'
								>
									Get Started
								</Link>
							</ul>
							<div className='flex flex-col md:flex-row w-full space-y-16'>
								<div className=' md:w-7/12 flex flex-col '>
									<div className='flex flex-col space-y-4 mt-16'>
										<p className='text-white text-3xl md:text-5xl font-bold'>
											POOLING FUNDS <br />
											MADE SIMPLE
										</p>
										<p className='text-white text-sm md:text-md font-semibold'>
											Effortlessly create, fund, and manage your own 'Pool
											parties.' Enjoy a seamless and fun event planning
											experience.
										</p>
										<div className='flex flex-row items-center space-x-8'>
											<Link
												href={'/'}
												className='text-black rounded-full bg-white px-8 py-2 text-xs'
											>
												Get Started
											</Link>
											<Link href={'terms'} className='text-white text-xs'>
												Terms and conditions
											</Link>
										</div>
									</div>
								</div>
								<div className='md:w-5/12 md:mb-16'>
									<Image src={poolEventImage} alt='pool background' />
								</div>
							</div>
						</div>
					</section>
					<section
						className={`flex flex-col py-16 space-y-8 items-center ${styles.poolMidSection} w-full lg:px-4 px-1`}
					>
						<h1 className='md:text-5xl text-4xl font-extrabold text-center'>
							HOW DOES POOL WORK?
						</h1>
						<p className='text-center px-12'>
							Joining a Pool party is easy and fun. Follow these simple steps to
							get started:
						</p>
						<Link
							href={'/'}
							className={`text-white ${styles.poolButton} py-3 rounded-full w-36 text-center`}
						>
							Join a Pool
						</Link>
						<ul className='mt-8 flex flex-col space-y-4 md:flex-row md:space-x-4 md:items-baseline'>
							{cardContent.map((card, index) => {
								return (
									<li
										key={index}
										className='flex flex-col h-84 w-64 lg:w-64 rounded-lg overflow-hidden'
									>
										<div
											className={` h-1/2 flex relative ${styles.cardBackground} items-center justify-center overflow-hidden`}
										>
											<Image
												className='object-cover'
												src={card.image}
												alt={card.alt}
												width={192}
												height={192}
												// layout='fill'
											/>
										</div>
										<div className='flex flex-col p-4 space-y-2 bg-white h-1/2'>
											<h3 className='text-sm md:text-md lg:text-lg font-medium'>
												{card.title}
											</h3>
											<p className={`text-sm ${styles.fontGrey}`}>
												{card.description}
											</p>
										</div>
									</li>
								)
							})}
						</ul>
					</section>
					<section className='w-full'>
						<PoolFooter />
					</section>
				</div>
			</div>
		</div>
	)
}

export default Home
