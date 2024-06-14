import Page from '@/components/page'
import PoolList from '@/components/pool-list/pool-list'
import { TopBar } from '@/components/top-bar'

export default function App() {
	return (
		<Page>
			<TopBar center={<TopBar.Logo />} right={<TopBar.Button />} />
			<main className='pt-20'>
				<div className='mb-6'>
					<h1 className='font-semibold text-lg'>Your Pools</h1>
					<PoolList maxPools={3} />
				</div>
				<div>
					<h1 className='font-semibold text-lg'>Upcoming Pools</h1>
					<PoolList />
				</div>
			</main>
		</Page>
	)
}
