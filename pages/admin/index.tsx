import Appbar from '@/components/appbar'
import Page from '@/components/page'
import Section from '@/components/section'
import PastPoolTab from '@/components/tabs/PastPoolTab'
import UpcomingPoolTab from '@/components/tabs/UpcomingPoolTab'
import { Button } from '@/components/ui/button'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { useState } from 'react'
import styles from './styles/admin.module.css'

const inter = Inter({ subsets: ['latin'] })

export default function AdminPage() {
	const [selectedTab, setSelectedTab] = useState(0)

	const selectTab = (tabIndex: number) => {
		setSelectedTab(tabIndex)
	}

	return (
		<Page>
			<Appbar />
			<Section>
				<div className='flex justify-center min-h-screen w-full mt-20'>
					<div className='flex flex-col w-96 min-h-full'>
						<div
							className={`flex flex-row h-12 rounded-full ${styles.buttonTabBackground}`}
						>
							<button
								onClick={() => selectTab(0)}
								className={`flex flex-1 font-semibold rounded-full bg-black text-white justify-center items-center ${
									selectedTab === 0
										? styles.selectedTabButton
										: styles.unselectedTabButton
								} ${inter.className}`}
							>
								Upcoming
							</button>
							<button
								onClick={() => selectTab(1)}
								className={`flex flex-1 font-semibold rounded-full bg-black text-white justify-center items-center ${
									selectedTab === 1
										? styles.selectedTabButton
										: styles.unselectedTabButton
								} ${inter.className}`}
							>
								Past
							</button>
						</div>
						{selectedTab === 0 ? <UpcomingPoolTab /> : <PastPoolTab />}

						<div className='fixed bottom-6 left-1/2 transform -translate-x-1/2 w-96'>
							<Button
								asChild
								className={`bg-black w-full h-12 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline ${inter.className}`}
							>
								<Link href='/create-pool'>+ Create a Pool</Link>
							</Button>
						</div>
					</div>
				</div>
			</Section>
		</Page>
	)
}
