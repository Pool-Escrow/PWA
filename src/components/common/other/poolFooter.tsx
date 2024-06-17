import emailImage from '@/public/images/emailIcon.png'
import { Comfortaa } from 'next/font/google'
import Image from 'next/image'

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
            className={`footerBackground flex w-full flex-col space-y-6 rounded-3xl rounded-b-none p-12 pb-6 text-white`}>
            <div className={`${comfortaa.className} w-full`}>
                <p className='footerLogoColor text-4xl font-semibold'>pool</p>
            </div>
            <div className='flex flex-row justify-between'>
                <div className='text-2xl font-semibold'>
                    Pooling funds <br />
                    made simple
                </div>
                <ul className='grid grid-cols-2 gap-x-8 gap-y-4 text-sm'>
                    <li>
                        <Link href='/overview'>Overview</Link>
                    </li>
                    <li>
                        <Link href='/faqs'>FAQs</Link>
                    </li>
                    <li>
                        <Link href='/overview'>Contracts</Link>
                    </li>
                    <li>
                        <Link href='/overview'>Support</Link>
                    </li>
                    <li>
                        <Link href='/overview'>How it works</Link>
                    </li>
                    <li>
                        <Link href='/overview'>Contact Us</Link>
                    </li>
                </ul>
            </div>
            <ul className='flex h-6 flex-row space-x-6'>
                {socialsContent.map((social, index) => {
                    return (
                        <li className='relative h-6 w-6'>
                            <Link
                                href={social.type == 'link' ? social.link : `mailto:${social.link}`}
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
                <Link href={'/privacy'}>Privacy</Link>
                <Link href={'/terms'}>Terms</Link>
            </div>
        </footer>
    )
}

export default PoolFooter
