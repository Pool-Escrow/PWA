// import { useRouter } from 'next/router'
// import { useEffect, useMemo, useState } from 'react'
'use client'
import { usePoolDetails } from '@/lib/hooks/use-pool-details'
import { usePoolDetailsDB } from '@/lib/hooks/use-pool-details-db'
import { useWallets } from '@privy-io/react-auth'
import QRCode from 'react-qr-code'
import _ from 'lodash'
import { Address } from 'viem'

// import { usePrivy, useWallets } from '@privy-io/react-auth'
// import { useQuery } from '@tanstack/react-query'

const TicketPage = ({ params }: { params: { 'pool-id': string } }) => {
    // const router = useRouter()

    // const { ready, authenticated, user } = usePrivy()

    // const { wallets } = useWallets()

    // const [poolDbData, setPoolDbData] = useState<any | undefined>()

    // const [, setPageUrl] = useState('')

    // const poolId = router?.query?.poolId

    // const { data: poolDBInfo } = useQuery({
    // 	queryKey: ['fetchAllPoolDataFromDB', poolId?.toString() ?? ' '],
    // 	queryFn: fetchAllPoolDataFromDB,
    // 	enabled: Boolean(poolId),
    // })

    // useEffect(() => {
    // 	// Update the document title using the browser API
    // 	if (ready && authenticated) {
    // 		const walletAddress = user!.wallet!.address
    // 		console.log(`Wallet Address ${walletAddress}`)
    // 	}

    // 	setPoolDbData(poolDBInfo?.poolDBInfo)

    // 	console.log('poolDBInfo', poolDBInfo)
    // 	setPageUrl(window?.location.href)
    // }, [ready, authenticated, poolDBInfo, user])

    // const parentRoute = useMemo(() => {
    // 	const paths = router.asPath.split('/')
    // 	paths.pop() // Remove the last sub-route
    // 	return paths.join('/')
    // }, [router.asPath])
    const { poolDetails } = usePoolDetails(BigInt(params['pool-id']))
    // const {
    //     poolDetailsDB,
    //     error: poolDetailsError,
    //     isLoading: poolDetailsIsLoading,
    // } = usePoolDetailsDB(BigInt(params['pool-id']))

    const { wallets } = useWallets()
    const hasJoined = poolDetails?.poolDetailFromSC?.[5]?.includes(wallets?.[0]?.address as Address) ?? false
    return (
        <div>
            <div className='flex w-full flex-col'>
                <h2 className='mb-8 text-center text-xl text-black'>{poolDetails?.poolDetailFromSC?.[1]?.poolName}</h2>
                <div className='flex w-full flex-1 flex-col items-center justify-center'>
                    {hasJoined ? (
                        <div className='cardBackground flex w-full max-w-lg rounded-3xl bg-[#F6F6F6] p-12'>
                            <QRCode
                                size={256}
                                style={{
                                    height: 'auto',
                                    maxWidth: '100%',
                                    width: '100%',
                                }}
                                value={JSON.stringify({
                                    address: wallets?.[0]?.address,
                                    poolId: BigInt(params['pool-id']).toString(),
                                })}
                                viewBox={`0 0 256 256`}
                            />
                        </div>
                    ) : (
                        <div>You have not joined the pool</div>
                    )}
                </div>
            </div>
        </div>
        // <Page>
        // 	<Appbar backRoute={`${parentRoute}`} pageTitle='Ticket' />

        // 	<Section>
        // 		<div className='flex flex-col w-full '>
        // 			<div className='relative flex flex-col pt-16 w-full min-h-screen space-y-0 pb-20 md:pb-24 justify-start'>
        // 				<h2 className='text-center text-2xl'>{poolDbData?.pool_name}</h2>
        // 				<div className='flex flex-1 flex-col w-full justify-center items-center'>
        // 					<div className='rounded-3xl flex w-full cardBackground p-12 max-w-lg'>
        // 						{!_.isEmpty(wallets) && (
        // 							<QRCode
        // 								size={256}
        // 								style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
        // 								value={JSON.stringify({
        // 									address: wallets?.[0]?.address,
        // 									poolId: poolId,
        // 								})}
        // 								viewBox={`0 0 256 256`}
        // 							/>
        // 						)}
        // 					</div>
        // 				</div>
        // 			</div>
        // 		</div>
        // 	</Section>
        // </Page>
    )
}

export default TicketPage
