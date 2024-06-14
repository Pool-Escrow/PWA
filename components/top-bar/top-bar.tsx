import { TopBarButton } from './top-bar-button'
import TopBarLogo from './top-bar-logo'

interface TopBarProps {
	left?: React.ReactNode
	center?: React.ReactNode
	right?: React.ReactNode
}

export default function TopBar({ left, center, right }: TopBarProps) {
	return (
		<header className='fixed left-0 top-0 w-full bg-white h-20 z-10'>
			<nav className='mx-auto flex h-full max-w-screen-md items-center justify-around px-6'>
				<div className='flex-1 flex justify-start'>{left}</div>
				<div>{center}</div>
				<div className='flex-1 flex justify-end'>{right}</div>
			</nav>
		</header>
	)
}

TopBar.Button = TopBarButton
TopBar.Logo = TopBarLogo
