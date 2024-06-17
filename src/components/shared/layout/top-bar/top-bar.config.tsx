import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const TopBarLogo = dynamic(() => import('./top-bar-logo'), {
	loading: () => <Skeleton className='w-[40px] max-w-full' />,
})
const TopBarButton = dynamic(() => import('./top-bar-button'), {
	loading: () => <Skeleton className='w-[90px] max-w-full' />,
})

const TopBarBack = dynamic(() => import('./top-bar-back'), {
	loading: () => <Skeleton className='w-[56px] max-w-full' />,
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
	'/participant/.*/pools': {
		left: <TopBarBack />,
	},
	'/participant/new': {
		left: <TopBarBack />,
		right: <Link href='/'>Skip</Link>,
	},
}

export const getTopBarElements = (pathname: string | null): TopBarElements => {
	if (!pathname) return defaultElements
	const matchedConfig = Object.keys(topBarConfig).find((pattern) => {
		const regex = new RegExp(`^${pattern}$`)
		return regex.test(pathname)
	})
	const matchedElements = matchedConfig ? topBarConfig[matchedConfig] : {}

	return { ...defaultElements, ...matchedElements }
}

export default topBarConfig
