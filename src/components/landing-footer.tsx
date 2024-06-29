import emailIcon from '@/../public/landing/email-icon.png'
import { comfortaa } from '@/lib/utils/fonts'

import Link from 'next/link'
import Image from 'next/image'

const socialsContent = [
    {
        image: emailIcon.src,
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
        <footer className='flex w-full flex-col space-y-6 rounded-t-[78px] bg-[#1B1818] px-[80px] pb-6 pt-[60px] text-white'>
            <div className={`${comfortaa.className} w-full`}>
                <p className='text-[72px] font-semibold text-[#FFBFB1]'>pool</p>
            </div>
            <div className='flex flex-row justify-between'>
                <div className='text-lg font-semibold md:text-2xl'>
                    Pooling funds <br />
                    made simple
                </div>
                <ul className='grid grid-cols-2 gap-x-4 gap-y-2 text-xs md:gap-x-8 md:gap-y-4 md:text-sm'>
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
            <ul className='flex h-6 flex-row space-x-6'>
                {socialsContent.map((social, index) => {
                    return (
                        <li className='relative h-6 w-6' key={index}>
                            <Link
                                href={social.type == 'link' ? social.link : (`mailto:${social.link}` as any)}
                                className='h-full w-full'>
                                <Image
                                    src={social.image}
                                    fill={true}
                                    alt={social.alt}
                                    className='object-contain object-center'
                                />
                            </Link>
                        </li>
                    )
                })}
            </ul>
            <div className='footerDivider w-full'></div>
            <div className='flex flex-row items-center space-x-12 text-xs'>
                <span>{new Date().getFullYear()} MIT Licensed - All rights reserved - Pool</span>
                <Link href={'/privacy-policy'}>Privacy</Link>
                <Link href={'/terms'}>Terms</Link>
            </div>
        </footer>
    )
}

export default PoolFooter
