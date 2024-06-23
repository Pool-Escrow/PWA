import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const TopBarLogo = dynamic(() => import('./top-bar-logo'), {
    loading: () => <Skeleton className='h-[43px] w-[96px] max-w-full' />,
})

const TopBarButton = dynamic(() => import('./top-bar-button'), {
    loading: () => <Skeleton className='h-[30px] w-[46px] max-w-full' />,
})

const TopBarBack = dynamic(() => import('./top-bar-back'), {
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
    right: <TopBarButton />,
}

const topBarConfig: TopBarConfig = {
    '/': {},
    '/my-pools': {
        left: <TopBarBack />,
    },
    '/profile': {
        left: <TopBarBack />,
        center: 'User Profile',
        right: null,
    },
    '/participant/new': {
        left: <TopBarBack />,
        right: <Link href='/'>Skip</Link>,
    },
    '/participant/[id]': {
        left: <TopBarBack />,
    },
    '/pool/[poolId]': {
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
