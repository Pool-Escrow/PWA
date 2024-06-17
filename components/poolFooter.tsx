import Image from 'next/image'
import emailImage from '@/public/images/emailIcon.png'
import githubImage from '@/public/images/githubIcon.png'
import xImage from '@/public/images/xIcon.png'
import { Comfortaa } from 'next/font/google'

import Link from 'next/link'

const comfortaa = Comfortaa({ subsets: ['latin'] })

const socialsContent = [
	{
		image: emailImage.src,
		alt: 'Email Icon',
		link: 'dev@poolparty.cc',
		type: 'email',
	},
	// {
	// 	image: githubImage.src,
	// 	alt: 'Image for joining a pool',
	// 	link: 'https://www.github.com/poolpartycc',
	// 	type: 'link',
	// },
	// {
	// 	image: xImage.src,
	// 	alt: 'Image for enjoy and connect',
	// 	link: 'https://x.com/poolparty',
	// 	type: 'link',
	// },
]

const PoolFooter = () => {
	return (
		<footer
			className={`footerBackground text-white rounded-3xl rounded-b-none p-6 md:p-12 pb-6 flex flex-col w-full space-y-6`}
		>
			<div className={`${comfortaa.className} w-full`}>
				<p className='footerLogoColor font-semibold text-4xl'>pool</p>
			</div>
			<div className='flex flex-row justify-between'>
				<div className='font-semibold text-lg md:text-2xl'>
					Pooling funds <br />
					made simple
				</div>
				<ul className=' grid grid-cols-2 gap-x-4 gap-y-2 md:gap-y-4 md:gap-x-8 text-xs md:text-sm'>
					<li>
						<Link href='/overview'>Overview</Link>
					</li>
					{/* <li>
						<Link href='/faqs'>FAQs</Link>
					</li>
					<li>
						<Link href='/contracts'>Contracts</Link>
					</li> */}
					<li>
						<Link href='mailto:dev@poolparty.cc'>Support</Link>
					</li>
					<li>
						<Link href='/home'>How it works</Link>
					</li>
					{/* <li>
						<Link href='/overview'>Contact Us</Link>
					</li> */}
				</ul>
			</div>
			<ul className='flex flex-row h-6 space-x-6'>
				{socialsContent.map((social, index) => {
					return (
						<li className='w-6 h-6 relative'>
							<Link
								href={
									social.type == 'link' ? social.link : `mailto:${social.link}`
								}
								className='w-full h-full'
							>
								<Image
									src={social.image}
									fill={true}
									alt={social.alt}
									className='object-center object-contain'
								/>
							</Link>
						</li>
					)
				})}
			</ul>
			<div className='w-full footerDivider'></div>
			<div className='text-xs flex flex-row items-center space-x-12'>
				<span>
					{new Date().getFullYear()} MIT Licensed - All rights reserved - Pool
				</span>
				<Link href={'/privacy'}>Privacy</Link>
				<Link href={'/terms'}>Terms</Link>
			</div>
		</footer>
	)
}

export default PoolFooter
