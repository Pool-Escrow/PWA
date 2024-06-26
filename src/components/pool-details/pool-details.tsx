// src/components/pool-detail/pool-detail.tsx
'use client'

import frog from '@/../public/images/frog.png'
import { startPool } from '@/lib/contracts/start-pool'
import { useAdmin } from '@/lib/hooks/use-admin'
import { usePoolDetails } from '@/lib/hooks/use-pool-details'
import { usePoolDetailsDB } from '@/lib/hooks/use-pool-details-db'
import { formatEventDateTime } from '@/lib/utils/date-time'
import { useBottomBarStore } from '@/providers/bottom-bar.provider'
import { wagmi } from '@/providers/configs'
import { dropletAbi, dropletAddress, poolAbi, poolAddress } from '@/types/contracts'
import { useWallets } from '@privy-io/react-auth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getAbiItem } from 'viem'
import { useBalance, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import Avatars from '../avatars/avatars'
import OnRampDialog from '../common/dialogs/onramp.dialog'
import ShareDialog from '../common/dialogs/share.dialog'
import PoolStatus from '../common/other/poolStatus'
import { RegisteredDropdown } from '../registered-dropdown'
import { Button } from '../ui/button'

const avatarUrls = new Array(4).fill(frog.src)

interface PoolDetailsProps {
    poolId: string
}
const PoolDetails = (props: PoolDetailsProps) => {
    const { poolDetails, isLoading, error } = usePoolDetails(BigInt(props.poolId))
    const {
        poolDetailsDB,
        isLoading: isLoadingPoolDetailsDB,
        error: poolDetailsDBError,
    } = usePoolDetailsDB(BigInt(props.poolId))

    const queryClient = useQueryClient()
    const poolSCStatus = poolDetails?.poolDetailFromSC?.[3]
    const { wallets } = useWallets()
    const { isAdmin } = useAdmin()
    const embeddedWallet = wallets.find(wallet => wallet.walletClientType === 'privy')
    const walletNativeBalance = useBalance({
        address: wallets[0]?.address as HexString,
    })
    const walletTokenBalance = useBalance({
        address: wallets[0]?.address as HexString,
        token: poolDetails?.poolDetailFromSC?.[4] as HexString,
    })

    const calculatedPoolSCDepositPerPerson = (
        BigInt(poolDetails?.poolDetailFromSC?.[1]?.depositAmountPerPerson.toString() ?? 0) /
        BigInt(Math.pow(10, Number(18 ?? 18)))
    ).toString()

    const cohostNames: string | undefined = poolDetailsDB?.cohostUserDisplayData
        ?.map((data: any) => data.display_name)
        .join(',')

    const isRegisteredOnSC = poolDetails?.poolDetailFromSC?.[5]?.indexOf(wallets[0]?.address as HexString) !== -1

    const { showBar, hideBar, setContent } = useBottomBarStore(state => state)
    const [openOnRampDialog, setOpenOnRampDialog] = useState(false)
    // const enableDepositMutation = useMutation({
    //     mutationFn: handleEnableDeposit,
    //     onSuccess: () => {
    //         console.log('startPool Success')
    //         queryClient.invalidateQueries({
    //             queryKey: ['fetchAllPoolDataFromSC', props.poolId],
    //         })
    //     },
    //     onError: () => {
    //         console.log('enableDepositMutation Error')
    //     },
    // })

    // const onEnableDepositButtonClicked = () => {
    //     enableDepositMutation.mutate({
    //         params: [props.poolId, wallets],
    //     })
    // }

    const startPoolMutation = useMutation({
        mutationFn: startPool,
        onSuccess: () => {
            console.log('startPool Success')
            queryClient.invalidateQueries({
                queryKey: ['fetchAllPoolDataFromSC', props.poolId],
            })
        },
        onError: () => {
            console.log('startPoolMutation Error')
        },
    })

    const { data: hash, isPending, writeContract, writeContractAsync } = useWriteContract()
    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        isError,
        error: registerError,
        data: txData,
    } = useWaitForTransactionReceipt({
        hash,
    })

    const registerPoolMutation = useMutation({
        mutationFn: async ({ params }: { params: [string, bigint] }) => {
            console.log('registerPool')
            const [poolId, deposit] = params
            console.log('poolId', poolId)
            console.log('deposit', deposit)
            console.log('contract address', '0x44432A98ea8dA37F844B89A324204ee6642b785A')
            const RegisterPoolFunction = getAbiItem({
                abi: poolAbi,
                name: 'deposit',
            })

            writeContract({
                address: '0x44432A98ea8dA37F844B89A324204ee6642b785A',
                abi: [RegisterPoolFunction],
                functionName: 'deposit',
                args: [BigInt(poolId), deposit],
            })
        },
        onSuccess: () => {
            console.log('registerPool Success')
            queryClient.invalidateQueries({
                queryKey: ['fetchAllPoolDataFromSC', props.poolId],
            })
        },
        onError: error => {
            console.log('registerPoolMutation Error', error)
        },
    })

    const approveSpendMutation = useMutation({
        mutationFn: async ({ params }: { params: [bigint] }) => {
            const [deposit] = [BigInt(poolDetails?.poolDetailFromSC?.[1]?.depositAmountPerPerson.toString() ?? 0)]
            console.log('approve')

            console.log('deposit', deposit)

            const ApprovePoolFunction = getAbiItem({
                abi: dropletAbi,
                name: 'approve',
            })
            console.log('contract address', '0x44432A98ea8dA37F844B89A324204ee6642b785A')

            writeContract({
                address: dropletAddress[wagmi.config.state.chainId as ChainId],
                abi: [ApprovePoolFunction],
                functionName: 'approve',
                args: [poolAddress[wagmi.config.state.chainId as ChainId], deposit],
            })
        },
        onSuccess: () => {
            console.log('approveSpend Success')
        },
        onError: error => {
            console.log('approveSpend Error', error)
        },
    })

    const onStartPoolButtonClicked = () => {
        startPoolMutation.mutate({
            params: [props.poolId, wallets],
        })
    }

    const onApproveButtonClicked = async () => {
        try {
            // const [deposit] = [BigInt(poolDetails?.poolDetailFromSC?.[1]?.depositAmountPerPerson.toString() ?? 0)]
            console.log('approve')

            console.log('deposit', poolDetails?.poolDetailFromSC?.[1]?.depositAmountPerPerson)

            const ApprovePoolFunction = getAbiItem({
                abi: dropletAbi,
                name: 'approve',
            })

            writeContract({
                address: dropletAddress[wagmi.config.state.chainId as ChainId],
                abi: [ApprovePoolFunction],
                functionName: 'approve',
                args: [
                    poolAddress[wagmi.config.state.chainId as ChainId],
                    poolDetails?.poolDetailFromSC?.[1]?.depositAmountPerPerson ?? BigInt(0),
                ],
            })
        } catch (error) {
            console.log('approveSpend Error', error)
        }
    }

    const onRegisterButtonClicked = async (deposit: bigint, balance: bigint, poolId: string) => {
        // if (!poolDetails?.poolDetailFromSC?.[1]?.depositAmountPerPerson) {
        //     return
        // }
        // console.log('walletTokenBalance: ', walletTokenBalance.data?.value)
        // console.log(
        //     'walletTokenBalance Requirement: ',
        //     BigInt(poolDetails?.poolDetailFromSC?.[1]?.depositAmountPerPerson),
        // )
        if (balance < deposit) {
            setOpenOnRampDialog(true)
            return
        }
        await onApproveButtonClicked()

        try {
            console.log('Approved')

            console.log('registering pool')
            // const [poolId, deposit] = [
            //     props.poolId,
            //     BigInt(poolDetails?.poolDetailFromSC?.[1]?.depositAmountPerPerson.toString() ?? 0),
            // ]

            const RegisterPoolFunction = getAbiItem({
                abi: poolAbi,
                name: 'deposit',
            })

            writeContract({
                address: poolAddress[wagmi.config.state.chainId as ChainId],
                abi: [RegisterPoolFunction],
                functionName: 'deposit',
                args: [BigInt(poolId), deposit],
            })
        } catch (error) {}
    }

    // const endPoolMutation = useMutation({
    //     mutationFn: handleEndPool,
    //     onSuccess: () => {
    //         console.log('endPool Success')
    //         queryClient.invalidateQueries({
    //             queryKey: ['fetchAllPoolDataFromSC', props.poolId],
    //         })
    //     },
    //     onError: () => {
    //         console.log('endPoolMutation Error')
    //     },
    // })
    // const onEndPoolButtonClicked = (e: any) => {
    //     toast('Requesting End Pool Transaction')

    //     endPoolMutation.mutate({
    //         params: [poolId.toString(), wallets],
    //     })
    // }

    useEffect(() => {
        console.log('isRegisteredOnSC', isRegisteredOnSC)
        if (!isRegisteredOnSC) {
            const deposit = BigInt(poolDetails?.poolDetailFromSC?.[1]?.depositAmountPerPerson.toString() ?? 0)
            const balance = BigInt(walletTokenBalance?.data?.value.toString() ?? 0)
            setContent(
                <Button
                    onClick={() => onRegisterButtonClicked(deposit, balance, props.poolId)}
                    className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                    <span>Register for ${calculatedPoolSCDepositPerPerson} USDC</span>
                </Button>,
            )
        } else {
            setContent(
                <div className='flex w-full flex-row items-center space-x-2'>
                    <Link
                        href={`/pool/${props.poolId}/ticket`}
                        className='mb-3 h-[46px] flex-1 flex-grow flex-row items-center justify-center rounded-[2rem] bg-cta px-6 py-[11px] text-center align-middle font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                        <span>Ticket</span>
                    </Link>
                    {/* <Button className='h-[46px] w-[46px] rounded-full'>Unregister</Button> */}
                    <RegisteredDropdown poolId={props.poolId} />
                </div>,
            )
        }
        showBar()
        console.log('wallet address: ', wallets[0]?.address)
        console.log('wallet native balance: ', walletNativeBalance)
        console.log('wallet token balance: ', walletTokenBalance)
        console.log('wallet deposit requirement: ', poolDetails?.poolDetailFromSC?.[1]?.depositAmountPerPerson)
    }, [
        setContent,
        showBar,
        hideBar,
        calculatedPoolSCDepositPerPerson,
        isRegisteredOnSC,
        wallets,
        poolDetails,
        walletTokenBalance?.data?.value,
    ])

    useEffect(() => {
        console.log('isConfirmed', isConfirmed)
        console.log('hash', hash)
        let updatePoolToastId
        if (isConfirming) {
            updatePoolToastId = toast.loading('Registering to Pool', {
                description: 'Finalizing pool registration...',
            })
            console.log('isConfirming')
        }
        if (isConfirmed && hash) {
            toast.dismiss(updatePoolToastId)
        }
        if (isError || registerError) {
            console.log('registerError', registerError)
        }
        if (txData) {
            console.log('txData', txData)
        }
    }, [isConfirmed, isConfirming, hash, isError, registerError, txData, registerPoolMutation.data])
    return (
        <div className='mx-auto max-w-md overflow-hidden rounded-lg bg-white shadow-lg'>
            <div className='p-4'>
                <div className='relative mb-4'>
                    {/* <Image
                        src={poolDetailsDB?.poolImageUrl ?? frog.src}
                        alt='Indoor pool with inflatable flamingo'
                        width={400}
                        height={300}
                        className='rounded-lg'
                        priority
                    />
                    <span className='absolute bottom-2 left-2 rounded-full bg-red-500 px-2 py-1 text-xs text-white'>
                        Live
                    </span> */}
                </div>
                <div className={`cardBackground mb-4 flex w-full flex-col space-y-4 rounded-3xl md:space-y-10 md:p-10`}>
                    <div className='relative h-full w-full overflow-hidden rounded-3xl bg-black'>
                        <div className='relative h-full w-full object-contain object-center'>
                            <Image
                                src={poolDetailsDB?.poolImageUrl ?? frog.src}
                                alt='Pool Image'
                                width={500}
                                height={400}
                            />
                        </div>
                        {/* <div className='absolute bottom-0 flex h-full w-full flex-col items-center justify-center space-y-3 bg-black bg-opacity-60 text-white backdrop-blur-sm backdrop-filter md:space-y-6'>
                                {timeLeft != undefined && timeLeft > 0 && (
                                    <div>
                                        <h4 className='text-xs md:text-2xl'>Starts in</h4>
                                        <h3 className='text-4xl font-semibold md:text-7xl'>
                                            {<CountdownTimer timeleft={timeLeft} />}
                                        </h3>
                                    </div>
                                )}
                            </div> */}
                        <div className='absolute right-2 top-0 flex h-full w-10 flex-col items-center space-y-3 py-4 text-white md:right-0 md:w-20 md:space-y-5 md:py-6'>
                            <ShareDialog />
                        </div>
                        <PoolStatus status={poolSCStatus} />
                    </div>
                </div>

                <h2 className='mb-1 text-xl font-bold text-blue-800'>{poolDetails?.poolDetailFromSC?.[1].poolName}</h2>
                <p className='mb-4 text-gray-600'>
                    {formatEventDateTime(poolDetails?.poolDetailFromSC?.[1].timeStart ?? 0)}
                </p>

                <div className='mb-4 flex items-center'>
                    <span className='mr-2 text-gray-700'>Hosted by {cohostNames}</span>
                    {/* <div className='flex'>
                        <span className='mr-2 overflow-clip rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700'>
                            {poolDetails?.poolDetailFromSC?.[0].host}
                        </span>
                        <span className='mr-2 rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700'>
                            Supermoon
                        </span>
                        <span className='rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700'>
                            Halborne
                        </span>
                    </div> */}
                </div>
                <div className='mb-4 rounded-3xl bg-[#F4F4F4] p-6 shadow-md'>
                    <div className='mb-4'>
                        <div className='mb-1 flex justify-between'>
                            <span className='font-bold text-blue-800'>
                                ${calculatedPoolSCDepositPerPerson}
                                {``}
                                USDC
                            </span>
                            <span className='text-[#003073]'>
                                Goal of $
                                {Number(calculatedPoolSCDepositPerPerson) * poolDetailsDB?.poolDBInfo?.soft_cap} Prize
                                {` `}
                                Pool
                            </span>
                        </div>
                        <div className='h-2.5 w-full rounded-full bg-blue-200'>
                            <div
                                className='h-2.5 rounded-full bg-blue-500'
                                style={{
                                    width: `${(poolDetails?.poolDetailFromSC?.[5]?.length ?? 0) / poolDetailsDB?.poolDBInfo?.soft_cap}%`,
                                }}></div>
                        </div>
                    </div>
                    <div className='mb-4 flex'>Participants</div>
                    <div className='mb-4 flex items-center justify-between'>
                        <Avatars avatarUrls={avatarUrls} numPeople={poolDetails?.poolDetailFromSC?.[5]?.length ?? 0} />
                        <Link href={`/pool/${props.poolId}/participants`} className='flex items-center'>
                            <ChevronRight className='text-blue-500' />
                        </Link>
                    </div>
                </div>
                <div className='mb-4 rounded-3xl bg-[#F4F4F4] p-6 shadow-md'>
                    <div className='mb-1 flex justify-between font-medium text-[#003073]'>Description</div>
                    <div>{poolDetailsDB?.poolDBInfo?.description}</div>
                </div>

                {/*Admin buttons*/}
                {poolSCStatus === 0 && isAdmin && (
                    <button className='w-full rounded-lg bg-blue-500 py-2 font-semibold text-white transition duration-300 hover:bg-blue-600'>
                        Enable Deposit
                    </button>
                )}
                {poolSCStatus === 1 && isAdmin && (
                    <button
                        className='w-full rounded-lg bg-blue-500 py-2 font-semibold text-white transition duration-300 hover:bg-blue-600'
                        onClick={onStartPoolButtonClicked}>
                        Start Pool
                    </button>
                )}
                {poolSCStatus === 2 && isAdmin && (
                    <button className='w-full rounded-lg bg-blue-500 py-2 font-semibold text-white transition duration-300 hover:bg-blue-600'>
                        End Pool
                    </button>
                )}
                <OnRampDialog
                    open={openOnRampDialog}
                    setOpen={setOpenOnRampDialog}
                    balance={walletTokenBalance?.data?.value}
                />
                {/* <Button onClick={() => setOpenOnRampDialog(true)}>OnRamp</Button> */}
            </div>
        </div>
    )
}

export default PoolDetails

// OLD VERSION:
// import editIcon from '@/public/images/edit_icon.svg'
// import defaultPoolImage from '@/public/images/frog.png'
// import { usePrivy, useWallets } from '@privy-io/react-auth'
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
// import * as _ from 'lodash'
// import Image from 'next/image'
// import { useRouter } from 'next/router'
// import { useEffect, useState } from 'react'

// const AdminPoolPage = () => {
// 	const [poolDbData, setPoolDbData] = useState<any | undefined>()
// 	const [poolImageUrl, setPoolImageUrl] = useState<String | null | undefined>()
// 	const [cohostDbData, setCohostDbData] = useState<any[]>([])
// 	const [pendingTransaction, setTransactionInProgress] = useState<boolean>()
// 	const [pageUrl, setPageUrl] = useState('')
// 	const [timeLeft, setTimeLeft] = useState<number>()
// 	const queryClient = useQueryClient()

// 	const router = useRouter()
// 	const { ready, authenticated } = usePrivy()
// 	const { wallets, ready: walletsReady } = useWallets()
// 	const { toast } = useToast()

// 	const calculateTimeLeft = (startTime: string) => {
// 		const currentTimestamp: Date = new Date()
// 		const startDateObject: Date = new Date(startTime)
// 		const timeDiff = startDateObject.getTime() - currentTimestamp.getTime()
// 		const { days, minutes, seconds } = formatTimeDiff(timeDiff)
// 		console.log('days', days)
// 		console.log('minutes', minutes)
// 		console.log('seconds', seconds)
// 		console.log('timeLeft', Math.floor(timeDiff / 1000))

// 		setTimeLeft(timeDiff)
// 	}

// 	const poolId = router?.query?.poolId! ?? 0

// 	const { data: poolSCInfo } = useQuery({
// 		queryKey: ['fetchAllPoolDataFromSC', poolId.toString()],
// 		queryFn: fetchAllPoolDataFromSC,
// 		enabled: !!poolId,
// 	})

// 	const { data: poolDBInfo } = useQuery({
// 		queryKey: ['fetchAllPoolDataFromDB', poolId.toString()],
// 		queryFn: fetchAllPoolDataFromDB,
// 		enabled: !!poolId,
// 	})

// 	const poolSCAdmin = poolSCInfo?.[0]
// 	const poolSCDetail = poolSCInfo?.[1]
// 	const poolSCToken = poolSCInfo?.[4]
// 	const poolSCName = poolSCInfo?.[1][2]
// 	const poolSCStatus = poolSCInfo?.[3]
// 	let poolSCParticipants = poolSCInfo?.[5]
// 	const poolSCWinners = poolSCInfo?.[6]

// 	const { data: tokenDecimals } = useQuery({
// 		queryKey: ['fetchTokenDecimals', poolSCToken],
// 		queryFn: fetchTokenDecimals,
// 		enabled: !_.isEmpty(poolSCToken),
// 	})

// 	const calculatedPoolSCBalance = (poolSCInfo: any) =>
// 		(
// 			BigInt(poolSCInfo?.[2][0]) /
// 			BigInt(Math.pow(10, Number(tokenDecimals ?? 18)))
// 		).toString()

// 	let poolSCBalance = poolSCInfo ? calculatedPoolSCBalance(poolSCInfo) : 0

// 	const calculatedPoolSCDepositPerPerson = (poolSCInfo: any) =>
// 		(
// 			BigInt(poolSCInfo?.[1][3]) /
// 			BigInt(Math.pow(10, Number(tokenDecimals ?? 18)))
// 		).toString()

// 	const poolSCDepositPerPersonString = poolSCInfo
// 		? calculatedPoolSCDepositPerPerson(poolSCInfo)
// 		: 0

// 	const { data: tokenSymbol } = useQuery({
// 		queryKey: ['fetchTokenSymbol', poolSCToken],
// 		queryFn: fetchTokenSymbol,
// 		enabled: !_.isEmpty(poolSCToken),
// 	})

// 	useEffect(() => {
// 		setPoolDbData(poolDBInfo?.poolDBInfo)
// 		setCohostDbData(poolDBInfo?.cohostUserDisplayData ?? [])
// 		setPoolImageUrl(poolDBInfo?.poolImageUrl)

// 		console.log('poolDBInfo', poolDBInfo)
// 		setPageUrl(window?.location.href)
// 		console.log('event_timestamp', poolDBInfo?.poolDBInfo?.event_timestamp)
// 		calculateTimeLeft(poolDBInfo?.poolDBInfo?.event_timestamp)
// 	}, [ready, authenticated, poolSCInfo, poolDBInfo, walletsReady])

// 	const poolSCTimeStart = poolSCDetail?.[0]?.toString()
// 	const eventDate = formatEventDateTime(poolSCTimeStart) ?? ''

// 	const participantPercent =
// 		(poolSCParticipants?.length / poolDbData?.soft_cap) * 100

// 	const enableDepositMutation = useMutation({
// 		mutationFn: handleEnableDeposit,
// 		onSuccess: () => {
// 			console.log('startPool Success')
// 			queryClient.invalidateQueries({
// 				queryKey: ['fetchAllPoolDataFromSC', poolId.toString()],
// 			})
// 		},
// 		onError: () => {
// 			console.log('enableDepositMutation Error')
// 		},
// 	})

// 	const startPoolMutation = useMutation({
// 		mutationFn: handleStartPool,
// 		onSuccess: () => {
// 			console.log('startPool Success')
// 			queryClient.invalidateQueries({
// 				queryKey: ['fetchAllPoolDataFromSC', poolId.toString()],
// 			})
// 		},
// 		onError: () => {
// 			console.log('startPoolMutation Error')
// 		},
// 	})

// 	const endPoolMutation = useMutation({
// 		mutationFn: handleEndPool,
// 		onSuccess: () => {
// 			console.log('endPool Success')
// 			queryClient.invalidateQueries({
// 				queryKey: ['fetchAllPoolDataFromSC', poolId.toString()],
// 			})
// 		},
// 		onError: () => {
// 			console.log('endPoolMutation Error')
// 		},
// 	})

// 	const onEnableDepositButtonClicked = () => {
// 		toast({
// 			title: 'Requesting Transaction',
// 			description: 'Enable Deposit',
// 		})
// 		enableDepositMutation.mutate({
// 			params: [poolId.toString(), wallets],
// 		})
// 	}

// 	const onStartPoolButtonClicked = () => {
// 		toast({
// 			title: 'Requesting Transaction',
// 			description: 'Start pool',
// 		})
// 		startPoolMutation.mutate({
// 			params: [poolId.toString(), wallets],
// 		})
// 	}

// 	const onEndPoolButtonClicked = (e: any) => {
// 		toast({
// 			title: 'Requesting Transaction',
// 			description: 'End pool',
// 		})

// 		endPoolMutation.mutate({
// 			params: [poolId.toString(), wallets],
// 		})
// 	}

// 	const cohostNames: string = cohostDbData
// 		.map((data: any) => data.display_name)
// 		.join(',')

// 	if (_.isEmpty(router.query.poolId)) {
// 		return <></>
// 	}
// 	return (
// 		<Page>
// 			<Appbar backRoute='/admin' />

// 			<Section>
// 				<div className='flex flex-col w-full justify-center items-center'>
// 					<div className='relative flex flex-col pt-16 w-full min-h-screen justify-center items-center pb-20 md:pb-24'>
// 						<div
// 							className={`flex flex-col rounded-3xl cardBackground w-full p-4 md:p-10 md:space-y-10 space-y-4`}
// 						>
// 							<div className='relative rounded-3xl overflow-hidden'>
// 								<div className='bg-black w-full h-full object-contain object-center'>
// 									{poolImageUrl ? (
// 										<Image src={poolImageUrl as string} alt='Pool Image' fill />
// 									) : (
// 										<Image src={defaultPoolImage.src} alt='Pool Image' fill />
// 									)}
// 								</div>
// 								<div className='w-full h-full bg-black absolute bottom-0 backdrop-filter backdrop-blur-sm bg-opacity-60 flex flex-col items-center justify-center space-y-3 md:space-y-6 text-white'>
// 									{timeLeft != undefined && timeLeft > 0 && (
// 										<div>
// 											<h4 className='text-xs md:text-2xl'>Starts in</h4>
// 											<h3 className='text-4xl md:text-7xl font-semibold '>
// 												{<CountdownTimer timeleft={timeLeft} />}
// 											</h3>
// 										</div>
// 									)}
// 								</div>
// 								<div className='absolute top-0 md:right-4 right-2  w-10 md:w-20  h-full flex flex-col items-center space-y-3 md:space-y-5 md:py-6 py-4 text-white'>
// 									{/* <Link
// 										href={`${pageUrl}/checkin-scan`}
// 										className='rounded-full w-8 h-8  md:w-14 md:h-14 md:p-3 p-2 bg-black bg-opacity-40'
// 									>
// 										<Image
// 											className='w-full h-full flex'
// 											src={qrCodeIcon.src}
// 											fill
// 											alt='QR Code Icon'
// 										/>
// 									</Link> */}
// 									<ShareDialog />

// 									<button
// 										title='Edit Pool'
// 										type='button'
// 										className='rounded-full w-8 h-8  md:w-14 md:h-14 md:p-3 p-2 bg-black bg-opacity-40'
// 									>
// 										<Image
// 											className='w-full h-full flex'
// 											src={editIcon.src}
// 											fill
// 											alt='Edit Icon'
// 										/>
// 									</button>
// 								</div>
// 								<PoolStatus status={poolSCStatus} />
// 							</div>
// 							<div className='flex flex-col space-y-6 md:space-y-12 '>
// 								<div className='flex flex-col space-y-2 md:space-y-4 overflow-hidden'>
// 									<h2 className='font-semibold text-lg md:text-4xl'>
// 										{poolSCName}
// 									</h2>
// 									<p className='text-sm md:text-2xl'>{eventDate}</p>
// 									<p className='text-sm md:text-2xl w-full font-semibold overflow-ellipsis'>
// 										Hosted by {cohostNames}
// 									</p>
// 								</div>
// 								<div className='text-sm md:text-3xl flex flex-col space-y-2 md:space-y-6 '>
// 									<div className='flex flex-rol justify-between'>
// 										<p className='max-w-sm '>
// 											<span className='font-bold'>{poolSCBalance} </span>
// 											{tokenSymbol} Prize Pool
// 										</p>
// 										<p>{participantPercent.toPrecision(2)}% funded</p>
// 									</div>
// 									<Progress value={participantPercent} />
// 								</div>
// 								<div className='flex text-sm md:text-3xl justify-between'>
// 									<p className='flex flex-row space-x-2'>
// 										<span className='font-bold'>
// 											{poolSCParticipants?.length}
// 										</span>
// 										<span>Participants</span>
// 									</p>
// 									{/* <Link
// 										className='flex flex-row items-center space-x-2 md:space-x-6 px-1 md:px-2'
// 										href={`${window.location.href}/participants`}
// 									>
// 										<span>View all</span>
// 										<span>
// 											<Image src={`${rightArrow.src}`} fill alt='Right Arrow' />
// 										</span>
// 									</Link> */}
// 								</div>
// 								<Progress value={participantPercent} />
// 							</div>
// 						</div>

// 						<div
// 							className={`flex flex-col rounded-3xl mt-2 md:mt-4 cardBackground w-full px-4 md:px-10 py-4 md:py-8 `}
// 						>
// 							<h3 className='font-semibold text-sm md:text-2xl'>Description</h3>
// 							<Divider />
// 							<p className='md:text-2xl text-md'>{poolDbData?.description}</p>
// 							<h3 className='font-semibold text-sm md:text-2xl mt-8'>Buy-In</h3>
// 							<Divider />
// 							<p className='text-md md:text-2xl'>
// 								{poolSCDepositPerPersonString} {tokenSymbol}
// 							</p>
// 							<h3 className='font-semibold text-sm md:text-2xl mt-8'>Terms</h3>
// 							<Divider />
// 							<p className='text-md md:text-2xl'>{poolDbData?.link_to_rules}</p>
// 						</div>
// 						{poolSCStatus == 0 && (
// 							<div className='fixed flex space-x-2 flex-row bottom-5 md:bottom-6 left-1/2 transform -translate-x-1/2 max-w-screen-md w-full px-6'>
// 								<button
// 									title='Enable Deposit'
// 									type='button'
// 									className={`bg-black flex text-center justify-center items-center flex-1 h-12 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline `}
// 									onClick={onEnableDepositButtonClicked}
// 								>
// 									Enable Deposit
// 								</button>
// 							</div>
// 						)}
// 						{poolSCStatus == 1 && (
// 							<div className='fixed flex space-x-2 flex-row bottom-5 md:bottom-6 left-1/2 transform -translate-x-1/2 max-w-screen-md w-full px-6'>
// 								<button
// 									title='Start Pool'
// 									type='button'
// 									className={`bg-black flex text-center justify-center items-center flex-1 h-12 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline `}
// 									onClick={onStartPoolButtonClicked}
// 								>
// 									Start Pool
// 								</button>
// 							</div>
// 						)}
// 						{poolSCStatus == 2 && (
// 							<div className='fixed bottom-5 md:bottom-6 left-1/2 transform -translate-x-1/2 max-w-screen-md w-full px-6'>
// 								<button
// 									title='End Pool'
// 									type='button'
// 									className={`bg-black w-full h-12 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline `}
// 									onClick={onEndPoolButtonClicked}
// 								>
// 									End Pool
// 								</button>
// 							</div>
// 						)}
// 					</div>
// 					{wallets?.[0]?.connectorType != 'embedded' && (
// 						<TransactionDialog
// 							open={pendingTransaction}
// 							showLoadAnimation={true}
// 							setOpen={setTransactionInProgress}
// 						/>
// 					)}
// 				</div>
// 			</Section>
// 		</Page>
// 	)
// }

// export default AdminPoolPage
