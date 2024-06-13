import Appbar from '@/components/appbar'
import Page from '@/components/page'
import Section from '@/components/section'
import UpcomingPoolTab from '@/components/tabs/UpcomingPoolTab'

export default function App() {
	return (
		<Page>
			<Appbar />
			<Section>
				<div className='flex justify-center  w-full pt-20'>
					<div className='flex flex-col w-96 space-y-8'>
						<div>
							<h3 className='font-semibold'>Upcoming Pools</h3>
							<UpcomingPoolTab />
						</div>
					</div>
				</div>
			</Section>
		</Page>
	)
}
