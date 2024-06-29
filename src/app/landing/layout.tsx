import '@/styles/globals.css'

// TODO: separate styles between app / landing and keep base styles for tailwind
import poolEvent from '@/../public/landing/pool-event.png'
import poolHeroBg from '@/../public/landing/pool-hero-bg.png'
import { comfortaa, inter } from '@/lib/utils/fonts'
import cardSearch from '@/../public/landing/card-search.png'
import cardConnect from '@/../public/landing/card-connect.png'
import cardFind from '@/../public/landing/card-find.png'
import Image from 'next/image'
import Link from 'next/link'
import PoolFooter from '@/components/landing-footer'

export const metadata = {
    title: 'Pool Party',
    description: 'Pooling funds made simple',
}

const cardContent = [
    {
        image: cardSearch.src,
        alt: 'Image for finding a pool',
        title: 'Step 1: Find a Pool Party',
        description: 'Browse through our curated list of events and choose the one that excites you.',
    },
    {
        image: cardFind.src,
        alt: 'Image for joining a pool',
        title: 'Step 2: Join the Party',
        description: "Click 'Join a Pool', scan the QR code, or follow the link to access the web app.",
    },
    {
        image: cardConnect.src,
        alt: 'Image for enjoy and connect',
        title: 'Step 3: Enjoy and Connect',
        description: 'Attend the event, enjoy the activities, and connect with other participants.',
    },
]

export function Header() {
    return (
        <header className='sticky top-0'>
            <nav className='container flex items-center justify-between pt-5 lg:pt-16'>
                <Link href='/' className='font-logo text-5xl font-bold text-white'>
                    pool
                </Link>
                <Link
                    href='https://app.poolparty.cc'
                    className='rounded-full bg-zinc-100 px-8 py-[0.875rem] text-xl font-medium text-black'>
                    Get started
                </Link>
            </nav>
        </header>
    )
}

export function Hero() {
    return (
        <>
            <div className='absolute inset-0 -z-10 h-3/5'>
                <Image
                    src={poolHeroBg}
                    alt='pool background'
                    fill
                    quality={100}
                    sizes='100vw'
                    priority
                    className='w-full object-cover'
                />
            </div>
            <section className='container pb-36 pt-16 lg:pt-36'>
                <div className='flex flex-col gap-10 text-zinc-100 lg:flex-row lg:gap-0'>
                    <div className='flex flex-col justify-center gap-4'>
                        <h1 className='text-4xl font-black uppercase tracking-tighter lg:text-7xl'>
                            Pooling funds
                            <span className='hidden h-0 sm:block'>
                                <br />
                            </span>{' '}
                            made simple
                        </h1>

                        <p className='text-xl font-semibold'>
                            Effortlessly create, fund, and manage your own 'Pool parties.'
                            <br />
                            Enjoy a seamless and fun event planning experience.
                        </p>
                        <div className='inline-flex flex-col items-center gap-2 text-nowrap text-base font-semibold *:w-1/2 md:flex-row md:items-start'>
                            <Link
                                href='https://app.poolparty.cc'
                                className='rounded-full bg-zinc-100 py-3 text-center font-semibold text-black transition duration-300 hover:bg-opacity-90 md:px-10'>
                                Get Started
                            </Link>
                            <Link
                                href='/terms'
                                className='rounded-full py-3 text-center font-semibold transition duration-300 hover:text-opacity-90 md:px-10'>
                                <span className='hidden sm:inline'>Terms and conditions</span>
                                <span className='sm:hidden'>Terms</span>
                            </Link>
                        </div>
                    </div>
                    <div className='flex w-full justify-center md:w-1/2 lg:justify-end'>
                        <Image
                            className='h-full w-4/5 object-contain'
                            src={poolEvent.src}
                            width={498}
                            height={666}
                            quality={100}
                            sizes='100vw'
                            loading='eager'
                            alt='Screenshot of the Pool Party app'
                            priority
                        />
                    </div>
                </div>
            </section>
        </>
    )
}

export function Features() {
    return (
        <section className='flex w-full bg-white text-[#191C1F]'>
            <div className='mx-4 flex w-full flex-col items-center space-y-8 rounded-2xl bg-[#f7f7f7] px-1 py-16 md:mx-0 lg:px-4'>
                <h1 className='text-center text-2xl font-extrabold uppercase md:text-5xl'>How does pool work?</h1>
                <p className='md:text-md px-12 text-center text-sm'>
                    Joining a Pool party is easy and fun. Follow these simple steps to get started:
                </p>
                <Link
                    href='https://app.poolparty.cc'
                    className='w-36 rounded-full bg-gradient-to-b from-[#36a0f7] to-[#1364da] py-3 text-center text-white'>
                    Join a Pool
                </Link>
                <ul className='mt-8 flex flex-col space-y-4 md:flex-row md:items-baseline md:space-x-4'>
                    {cardContent.map((card, index) => {
                        return (
                            <li key={index} className='h-84 flex w-64 flex-col overflow-hidden rounded-lg lg:w-64'>
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
                                    <h3 className='md:text-md text-sm font-medium lg:text-lg'>{card.title}</h3>
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

export function Footer() {
    return (
        <section className='w-full bg-white px-14'>
            <PoolFooter />
        </section>
    )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='en' className='h-full motion-safe:scroll-smooth'>
            <body className={`${(inter.variable, comfortaa.variable)}`}>
                <Header />
                <Hero />
                <Features />
                <Footer />
            </body>
        </html>
    )
}
