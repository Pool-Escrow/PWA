import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Skeleton } from '../../_components/ui/skeleton'

const TopBarLogo = dynamic(() => import('./page-title'), {
    loading: () => <Skeleton className='h-[43px] w-[96px] max-w-full' />,
})

// const TopBarButton = dynamic(() => import('./user-menu'), {
//     loading: () => <Skeleton className='h-[30px] w-[46px] max-w-full' />,
// })

const TopBarBack = dynamic(() => import('./back-button'), {
    loading: () => <Skeleton className='size-[24px] max-w-full' />,
})

type TopBarElements = {
    [K in 'left' | 'center' | 'right']?: React.ReactNode | null
}

type TopBarConfig = {
    [key: string]: TopBarElements
}

const defaultElements: TopBarElements = {
    left: null,
    center: <TopBarLogo />,
    // right: <TopBarButton />,
}

const topBarConfig: TopBarConfig = {
    '/': {},
    '/my-pools': {
        left: <TopBarBack />,
    },
    '/profile': {
        left: <TopBarBack />,
        center: 'User Profile',
        // right: <UserDropdown />,
    },
    '/profile/new': {
        center: null, // Hide logo
        right: (
            <Link href='/' className='text-[#2989EC]'>
                Skip
            </Link>
        ),
    },
    '/participant/[id]': {
        left: <TopBarBack />,
    },
    '/pool/[poolId]': {
        left: <TopBarBack />,
    },
    '/pool/[poolId]/participants': {
        left: <TopBarBack />,
    },
    '/pool/[poolId]/participants/[participantId]': {
        left: <TopBarBack />,
    },
    '/pool/[poolId]/ticket': {
        left: <TopBarBack />,
        center: <h1 className='font-bold text-black'>My Ticket</h1>,
    },
    '/send': {
        left: <TopBarBack />,
    },
}

const pathToRegex = (path: string | null) => {
    return new RegExp(`^${path?.replace(/\[([^\]]+)\]/g, '([^/]+)')}$`)
}

export const getTopBarElements = (pathname: string | null): TopBarElements => {
    if (!pathname) return defaultElements

    const matchedConfig = Object.keys(topBarConfig).find(pattern => {
        const regex = pathToRegex(pattern)
        return regex.test(pathname)
    })

    const matchedElements = matchedConfig ? topBarConfig[matchedConfig] : {}

    return { ...defaultElements, ...matchedElements }
}
