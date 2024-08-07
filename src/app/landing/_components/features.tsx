import getAppUrl from '@/lib/utils/get-app-url'
import cardConnect from '@/public/landing/images/card-connect.png'
import cardFind from '@/public/landing/images/card-find.png'
import cardSearch from '@/public/landing/images/card-search.png'
import Image from 'next/image'
import Link from 'next/link'

const cardContent = [
    {
        image: cardSearch,
        alt: 'Image for finding a pool',
        title: 'Step 1: Find a Pool Party',
        description: 'Browse through our curated list of events and choose the one that excites you.',
    },
    {
        image: cardFind,
        alt: 'Image for joining a pool',
        title: 'Step 2: Join the Party',
        description: "Click 'Join a Pool', scan the QR code, or follow the link to access the web app.",
    },
    {
        image: cardConnect,
        alt: 'Image for enjoy and connect',
        title: 'Step 3: Enjoy and Connect',
        description: 'Attend the event, enjoy the activities, and connect with other participants.',
    },
]

export default function Features() {
    return (
        <section className='flex w-full bg-white text-[#191C1F]'>
            <div className='mx-4 flex w-full flex-col items-center space-y-8 rounded-2xl bg-[#f7f7f7] px-1 py-16 md:mx-0 lg:px-4'>
                <h1 className='text-center text-2xl font-extrabold uppercase md:text-5xl'>How does pool work?</h1>
                <p className='px-12 text-center text-sm md:text-base'>
                    Joining a Pool party is easy and fun. Follow these simple steps to get started:
                </p>
                <Link
                    href={getAppUrl('/')}
                    className='w-36 rounded-full bg-gradient-to-b from-[#36a0f7] to-[#1364da] py-3 text-center text-white'>
                    Join a Pool
                </Link>
                <ul className='mt-8 flex flex-col space-y-4 md:flex-row md:items-baseline md:space-x-4'>
                    {cardContent.map((card, index) => {
                        return (
                            <li key={index} className='flex h-80 w-64 flex-col overflow-hidden rounded-lg lg:w-64'>
                                <div className='relative flex h-1/2 items-center justify-center overflow-hidden bg-gradient-to-b from-blue-500 to-sky-400'>
                                    <Image
                                        className='object-cover'
                                        src={card.image}
                                        alt={card.alt}
                                        width={192}
                                        height={192}
                                    />
                                </div>
                                <div className='flex h-1/2 flex-col space-y-2 bg-white p-4'>
                                    <h3 className='text-sm font-medium md:text-base lg:text-lg'>{card.title}</h3>
                                    <p className='text-sm text-[#717173]'>{card.description}</p>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </section>
    )
}
