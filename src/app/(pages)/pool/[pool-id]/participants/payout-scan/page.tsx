import PageWrapper from '@/components/page-wrapper'

export default function PayoutScanPage() {
    return (
        <PageWrapper topBarProps={{ title: 'Scan to Payout', backButton: true }}>
            <h1>ScanQR</h1>
        </PageWrapper>
    )
}

// import Appbar from '@/components/appbar'
// import Page from '@/components/page'
// import Section from '@/components/section'
// import router from 'next/router'
// import React, { useEffect, useState } from 'react'
// import { QrReader } from 'react-qr-reader'

// const ScanQR: React.FC = () => {
// 	const [, setQRData] = useState<string>()
// 	const [parentRoute, setParentRoute] = useState<string>()

// 	const handleScan = async (data: string | null) => {
// 		if (data) {
// 			setQRData(data)
// 			console.log('data', data)

// 			try {
// 				const dataObj = JSON.parse(data)
// 				console.log('data', data)
// 				router.push(
// 					`/admin/pool-id/${dataObj?.poolId}/participants/${dataObj?.address}`,
// 				)
// 			} catch (error) {
// 				console.error(error)
// 			}
// 		}
// 	}

// 	useEffect(() => {
// 		const paths = router?.asPath.split('/')
// 		paths.pop() // Remove the last sub-route
// 		setParentRoute(paths.join('/'))
// 	}, [])

// 	return (
// 		<Page>
// 			<Appbar backRoute={`${parentRoute}`} pageTitle='Scan to Payout' />
// 			<Section>
// 				<div className='h-full w-full relative flex flex-col'>
// 					<QrReader
// 						className='w-full h-full'
// 						scanDelay={1000}
// 						onResult={(result, error) => {
// 							if (!!result) {
// 								setQRData(result?.getText())
// 								handleScan(result?.getText())
// 							}

// 							if (!!error) {
// 								console.info(error)
// 							}
// 						}}
// 						constraints={{ facingMode: 'environment' }}
// 					/>
// 				</div>
// 			</Section>
// 		</Page>
// 	)
// }

// export default ScanQR
