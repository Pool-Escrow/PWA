'use client'

import Appbar from '@/components/appbar'
import Divider from '@/components/divider'
import Page from '@/components/page'
import PoolStatus from '@/components/common/other/poolStatus'
import Section from '@/components/common/layout/section'
import ShareDialog from '@/components/shareDialog'
import TransactionDialog from '@/components/common/dialogs/transaction.dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import {
    fetchAllPoolDataFromDB,
    fetchAllPoolDataFromSC,
    fetchTokenSymbol,
    fetchUserDisplayForAddress,
    fetchWinnersDetailsFromSC,
    handleClaimWinning,
    handleRegister,
    handleRegisterServer,
    handleUnregister,
    handleUnregisterServer,
} from '@/lib/api/clientAPI'
import circleTick from '@/../public/images/circle-tick.svg'
import defaultPoolImage from '@/../public/images/frog.png'
import rightArrow from '@/../public/images/right_arrow.svg'
import tripleDotsIcon from '@/../public/images/tripleDots.svg'
import userUnregisterIcon from '@/../public/images/user_delete.svg'
import { Database } from '@/types/db'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ethers } from 'ethers'
import _ from 'lodash'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
    dictionaryToNestedArray,
    getAllIndicesMatching,
    getRowsByColumnValue,
    getValuesFromIndices,
} from '@/lib/utils/database'
import { formatEventDateTime } from '@/lib/utils/date-time'
import { toast } from 'sonner'
import AvatarImage from '@/components/common/avatars/avatarImage'
import { cn } from '@/lib/utils/tailwind'
import { useParams, useRouter } from 'next/navigation'

export type PoolRow = Database['public']['Tables']['pools']['Row']
export type UserDisplayRow = Database['public']['Tables']['users']['Row']

const PoolPage = () => {
    const params = useParams<{ poolId: string }>()
    const router = useRouter()

    const { ready, authenticated, user, getAccessToken } = usePrivy()

    const { wallets } = useWallets()

    const [winnerAddresses, setWinnerAddresses] = useState<string[]>([])
    const [, setWinnerDetails] = useState<string[][] | null>([[]])

    const [poolDbData, setPoolDbData] = useState<any | undefined>()
    const [poolImageUrl, setPoolImageUrl] = useState<String | null | undefined>()
    const [cohostDbData, setCohostDbData] = useState<any[]>([])
    const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false)

    const [, setPageUrl] = useState('')
    const [currentJwt, setCurrentJwt] = useState<string | null>()

    const poolId = params?.poolId || '0'
    const queryClient = useQueryClient()

    const { data: poolSCInfo } = useQuery({
        queryKey: ['fetchAllPoolDataFromSC', poolId.toString()],
        queryFn: fetchAllPoolDataFromSC,
        enabled: Boolean(poolId),
    })

    const { data: poolDBInfo } = useQuery({
        queryKey: ['fetchAllPoolDataFromDB', poolId.toString()],
        queryFn: fetchAllPoolDataFromDB,
        enabled: Boolean(poolId),
    })

    const poolSCAdmin = poolSCInfo?.[0]
    const poolSCDetail = poolSCInfo?.[1]
    let poolSCBalance = poolSCInfo ? (BigInt(poolSCInfo?.[2][0]) / BigInt('1000000000000000000')).toString() : 0
    const poolSCName = poolSCInfo?.[1][2]
    const poolSCDepositPerPerson = poolSCInfo ? BigInt(poolSCInfo?.[1][3]) : 0
    const poolSCDepositPerPersonString = poolSCInfo
        ? (BigInt(poolSCInfo?.[1][3]) / BigInt('1000000000000000000')).toString()
        : 0
    const poolSCStatus = poolSCInfo?.[3]
    const poolSCToken = poolSCInfo?.[4]
    let poolSCParticipants = poolSCInfo?.[5]
    const poolSCWinners = poolSCInfo?.[6]

    const isWinner = winnerAddresses?.indexOf(wallets[0]?.address?.toLowerCase()) != -1

    const isRegisteredOnSC = poolSCParticipants?.indexOf(wallets[0]?.address) !== -1

    const { data: tokenSymbol } = useQuery({
        queryKey: ['fetchTokenSymbol', poolSCToken],
        queryFn: fetchTokenSymbol,
        enabled: !_.isEmpty(poolSCToken),
    })

    const { data: poolWinnersDetails } = useQuery({
        queryKey: ['fetchWinnersDetailsFromSC', poolId?.toString() ?? ' '],
        queryFn: fetchWinnersDetailsFromSC,
        enabled: !!poolId,
    })

    const matchingAddressIndices = getAllIndicesMatching(poolWinnersDetails?.[0], wallets[0]?.address)
    const userWonDetails = getValuesFromIndices(poolWinnersDetails?.[1], matchingAddressIndices)

    const claimableDetails = getRowsByColumnValue(userWonDetails, 3, false)
    const totalWinningAmount = userWonDetails?.reduce((acc: number, curr: any) => acc + curr[0], BigInt(0))

    const { data: adminData } = useQuery({
        queryKey: ['loadProfileImage', poolSCAdmin?.[0]?.toString() ?? ' '],
        queryFn: fetchUserDisplayForAddress,
        enabled: !_.isEmpty(poolSCAdmin?.[0]?.toString()),
    })

    const retrieveAccessToken = async () => {
        const token = await getAccessToken()
        setCurrentJwt(token)
    }

    const poolSCTimeStart = poolSCDetail?.[0]?.toString()

    useEffect(() => {
        // Update the document title using the browser API
        if (ready && authenticated) {
            const walletAddress = user!.wallet!.address
            console.log(`Wallet Address ${walletAddress}`)
        }

        console.log('participants', poolSCParticipants)

        setPoolDbData(poolDBInfo?.poolDBInfo)
        setCohostDbData(poolDBInfo?.cohostUserDisplayData ?? [])
        setPoolImageUrl(poolDBInfo?.poolImageUrl)
        setWinnerAddresses(poolWinnersDetails?.[0])

        setWinnerDetails(dictionaryToNestedArray(poolWinnersDetails?.[1]))
        console.log('poolDBInfo', poolDBInfo)
        console.log('poolSCWinners', poolSCWinners)
        console.log('winnerAddresses', winnerAddresses)
        console.log('userWonDetails', userWonDetails)
        console.log('cohostDbData', cohostDbData)
        console.log('poolSCIfo', poolSCInfo)
        console.log('poolSCTimeStart', poolSCTimeStart)

        setPageUrl(window?.location.href)
    }, [
        ready,
        authenticated,
        poolSCInfo,
        poolDBInfo,
        poolWinnersDetails,
        poolSCParticipants,
        setWinnerDetails,
        poolSCWinners,
        winnerAddresses,
        // Commented these out as it leads to infinite loop.
        // userWonDetails,
        // cohostDbData,
        setPageUrl,
        user,
        poolSCTimeStart,
    ])

    const eventDate = formatEventDateTime(poolSCTimeStart) ?? '0'

    const registerServerMutation = useMutation({
        mutationFn: handleRegisterServer,
        onSuccess: () => {
            console.log('registerServerMutation Success')
            toast('Registration Successful', {
                description: 'You have joined the pool.',
            })
            queryClient.invalidateQueries({
                queryKey: ['fetchAllPoolDataFromDB', poolId.toString()],
            })
            queryClient.invalidateQueries({
                queryKey: ['fetchAllPoolDataFromSC', poolId?.toString()],
            })
        },
    })

    const registerMutation = useMutation({
        mutationFn: handleRegister,
        onSuccess: () => {
            console.log('registerMutation Success')
            queryClient.invalidateQueries({
                queryKey: ['fetchAllPoolDataFromSC', poolId.toString()],
            })
            registerServerMutation.mutate({
                params: [poolId.toString(), wallets[0]?.address, currentJwt ?? ' '],
            })
        },
        onError: () => {
            console.log('registerMutation Error')
        },
    })

    const unregisterServerMutation = useMutation({
        mutationFn: handleUnregisterServer,
        onSuccess: () => {
            toast('Withdrawal Sucessful', {
                description: 'You have successfully withdrawn from the pool.',
            })
            console.log('unregisterServerMutation Success')
            queryClient.invalidateQueries({
                queryKey: ['fetchAllPoolDataFromDB', poolId.toString()],
            })
            queryClient.invalidateQueries({
                queryKey: ['fetchAllPoolDataFromSC', poolId?.toString()],
            })
        },
    })

    const unregisterMutation = useMutation({
        mutationFn: handleUnregister,
        onSuccess: () => {
            console.log('unregisterMutation Success')
            queryClient.invalidateQueries({
                queryKey: ['fetchAllPoolDataFromSC', poolId.toString()],
            })
            unregisterServerMutation.mutate({
                params: [poolId.toString(), wallets[0]?.address, currentJwt ?? ' '],
            })
        },
    })

    const claimMutation = useMutation({
        mutationFn: handleClaimWinning,
        onSuccess: () => {
            toast('Transaction Success', {
                description: 'You have claimed your winnings.',
            })
            console.log('registerMutation Success')
            queryClient.invalidateQueries({
                queryKey: ['fetchWinnersDetailsFromSC', poolId?.toString() ?? ' '],
            })
        },
        onError: () => {
            console.log('claimMutation Error')
        },
    })
    const participantPercent = (poolSCParticipants?.length / poolDbData?.soft_cap) * 100

    const viewTicketClicked = () => {
        router.push(`/pool/${poolId}/ticket`)
    }

    const redirectIfNotLoggedIn = () => {
        try {
            if (wallets?.length == 0) {
                toast('You are not connected to a wallet', {
                    description: 'Kindly log in to a wallet to continue.',
                })
                router.push('/login')
            }
        } catch (error) {
            console.log(error)
        }
    }
    const onRegisterButtonClicked = (e: any) => {
        redirectIfNotLoggedIn()

        console.log('onRegisterButtonClicked')
        const connectorType = wallets?.[0]?.connectorType
        console.log('connectorType', connectorType)
        toast('Requesting Transaction/s', {
            description: 'Approve spending of token, followed by depositing token.',
        })
        registerMutation.mutate({
            params: [poolId.toString(), poolSCDepositPerPerson.toString(), wallets],
        })
    }

    const onUnregisterButtonClicked = (e: any) => {
        redirectIfNotLoggedIn()
        console.log('onUnregisterButtonClicked')
        const connectorType = wallets[0].connectorType
        console.log('connectorType', connectorType)
        toast('Requesting Transaction', {
            description: 'Withdrawing from pool',
        })

        unregisterMutation.mutate({
            params: [poolId.toString(), wallets],
        })
    }

    const onClaimButtonClicked = (e: any) => {
        console.log('onClaimButtonClicked')
        redirectIfNotLoggedIn()
        const connectorType = wallets[0].connectorType
        console.log('connectorType', connectorType)
        toast('Requesting Transaction/s', {
            description: 'Approve claiming prize',
        })
        claimMutation.mutate({
            params: [poolId.toString(), wallets],
        })
    }

    const cohostNames: string = cohostDbData.map((data: any) => data.display_name).join(',')

    if (_.isEmpty(poolId)) {
        return <></>
    }
    return (
        <Page>
            <Appbar backRoute='/' />

            <Section>
                <div className='flex w-full flex-col items-center justify-center'>
                    <div className='relative flex min-h-screen w-full flex-col items-center justify-center pb-20 pt-16 md:pb-24'>
                        <div
                            className={`cardBackground flex w-full flex-col space-y-4 rounded-3xl p-4 md:space-y-10 md:p-10`}>
                            <div className='relative flex overflow-hidden rounded-3xl'>
                                <Image
                                    alt='pool image'
                                    src={`${_.isEmpty(poolImageUrl) ? defaultPoolImage.src : poolImageUrl}`}
                                    className='flex h-full w-full bg-black object-contain object-center'
                                    fill
                                />
                                <div className='absolute right-2 top-0 flex h-full w-10 flex-col items-center space-y-3 py-4 text-white md:right-4 md:w-20 md:space-y-5 md:py-6'>
                                    <ShareDialog />
                                </div>
                                <PoolStatus status={poolSCStatus} />
                            </div>
                            <div className='flex flex-col space-y-6 md:space-y-12'>
                                <div className='flex flex-col space-y-2 overflow-hidden md:space-y-4'>
                                    <h2 className='text-lg font-semibold md:text-4xl'>{poolSCName}</h2>
                                    <p className='text-sm md:text-2xl'>{eventDate}</p>
                                    <div className='w-full overflow-ellipsis text-sm font-semibold md:text-2xl'>
                                        Hosted by 2
                                        <ul className='mt-4 flex flex-col space-y-2'>
                                            <li className='flex flex-row items-center space-x-4 font-medium'>
                                                <div className='relative h-12 w-12'>
                                                    <AvatarImage address={poolSCAdmin?.[0]?.toString()} />
                                                </div>
                                                {/* TODO: FIX THIS SERIOUS BUG IN THE CLIENTAPI  */}
                                                {/* @ts-expect-error */}
                                                <span>{adminData?.userDisplayData?.displayName}</span>
                                            </li>
                                            {cohostDbData?.map((data: any) => {
                                                return (
                                                    <li
                                                        className='flex flex-row items-center space-x-4 font-medium'
                                                        key={data?.address}>
                                                        <div className='relative h-12 w-12'>
                                                            <AvatarImage address={data?.address} />
                                                        </div>
                                                        <span>{data?.display_name}</span>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                </div>
                                <div className='flex flex-col space-y-2 text-sm md:space-y-6 md:text-3xl'>
                                    <div className='flex-rol flex justify-between'>
                                        <p className='max-w-sm'>
                                            <span className='font-bold'>{poolSCBalance} </span>
                                            {tokenSymbol} Prize Pool
                                        </p>
                                        <p>{participantPercent.toPrecision(2)}% funded</p>
                                    </div>
                                    <Progress value={participantPercent} />
                                </div>
                                <div className='flex flex-col space-y-4 text-sm md:text-3xl'>
                                    <p className='flex flex-row space-x-2'>
                                        <span>Participants</span>
                                    </p>

                                    <Link
                                        href={`/pool/${poolId}/participants` as any}
                                        className='flex flex-row justify-between'>
                                        <div>
                                            {poolSCParticipants?.length ?? 0 <= 5 ? (
                                                <div className='relative flex h-12 w-full flex-row md:h-14'>
                                                    {poolSCParticipants?.map((address: any, index: number) => {
                                                        return (
                                                            <div
                                                                className={cn(
                                                                    'absolute h-12 w-12 rounded-full bg-white p-0.5 md:h-14 md:w-14',
                                                                    `z-[${index + 1}]`,
                                                                    `left-[${index * 36}px]`,
                                                                )}
                                                                key={address}>
                                                                <div className='relative h-12 w-12'>
                                                                    <AvatarImage address={address as any} />
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            ) : (
                                                <div className='relative flex h-12 w-full flex-row'>
                                                    {poolSCParticipants?.map((address: string, index: number) => {
                                                        if (index >= 4) {
                                                            return <></>
                                                        }
                                                        return (
                                                            <div
                                                                className={cn(
                                                                    `absolute h-12 w-12 rounded-full bg-white p-0.5 md:h-14 md:w-14`,
                                                                    `z-[${index + 1}]`,
                                                                    `left-[${index * 36}px]`,
                                                                )}
                                                                key={address}>
                                                                <div className='relative h-12 w-12'>
                                                                    <AvatarImage address={address} />
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                    {poolSCParticipants?.length > 5 && (
                                                        <div className='absolute left-[144px] z-50 rounded-full bg-white p-0.5 md:h-14 md:w-14'>
                                                            <div className='numParticipantBackground flex h-12 w-12 items-center justify-center rounded-full text-white'>{`+ ${
                                                                poolSCParticipants?.length - 4
                                                            }`}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className='flex flex-row items-center'>
                                            <span>
                                                <Image
                                                    src={`${rightArrow.src}`}
                                                    alt='right arrow'
                                                    width={20}
                                                    height={20}
                                                />
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        {userWonDetails?.length > 0 && (
                            <div
                                className={`cardBackground mt-2 flex w-full flex-col space-y-4 rounded-3xl px-4 py-4 md:mt-4 md:px-10 md:py-8`}>
                                <div className='flex flex-row items-center justify-between'>
                                    <div className='flex flex-row space-x-2'>
                                        <span className='flex items-center'>
                                            <Image
                                                className='h-5 w-5'
                                                src={circleTick.src}
                                                alt='circle tick'
                                                width={20}
                                                height={20}
                                            />
                                        </span>
                                        <span className='font-semibold'>Winner</span>
                                    </div>
                                    <div>${ethers.formatEther(totalWinningAmount?.toString())}</div>
                                </div>

                                {claimableDetails?.length > 0 && (
                                    <button
                                        className='barForeground rounded-full py-3 font-medium text-white'
                                        onClick={onClaimButtonClicked}>
                                        Claim
                                    </button>
                                )}
                            </div>
                        )}

                        <div
                            className={`cardBackground mt-2 flex w-full flex-col rounded-3xl px-4 py-4 md:mt-4 md:px-10 md:py-8`}>
                            <h3 className='text-sm font-semibold md:text-2xl'>Description</h3>
                            <Divider />
                            <p className='text-md md:text-2xl'>{poolDbData?.description}</p>
                            <h3 className='mt-8 text-sm font-semibold md:text-2xl'>Buy-In</h3>
                            <Divider />
                            <p className='text-md md:text-2xl'>
                                {poolSCDepositPerPersonString} {tokenSymbol}
                            </p>
                            <h3 className='mt-8 text-sm font-semibold md:text-2xl'>Terms</h3>
                            <Divider />
                            <p className='text-md md:text-2xl'>{poolDbData?.link_to_rules}</p>
                        </div>
                        {isRegisteredOnSC ? (
                            <div className='fixed bottom-5 left-1/2 z-50 flex w-full max-w-screen-md -translate-x-1/2 transform flex-row space-x-2 px-6 md:bottom-6'>
                                <button
                                    className={`focus:shadow-outline flex h-12 flex-1 items-center justify-center rounded-full bg-black px-4 py-2 text-center font-bold text-white focus:outline-none`}
                                    onClick={viewTicketClicked}>
                                    View My Ticket
                                </button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <div className='h-12 w-12 rounded-full bg-black p-3'>
                                            <Image
                                                className='flex h-full w-full'
                                                src={tripleDotsIcon.src}
                                                fill
                                                alt='triple dots'
                                            />
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent sideOffset={16}>
                                        <DropdownMenuItem onClick={onUnregisterButtonClicked}>
                                            <div className='flex flex-row space-x-2'>
                                                <span>
                                                    <Image
                                                        className='flex h-full w-full'
                                                        src={userUnregisterIcon.src}
                                                        fill
                                                        alt='user unregister'
                                                    />
                                                </span>
                                                <span>Unregister from Pool</span>
                                            </div>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ) : (
                            poolSCStatus == 1 && (
                                <div className='fixed bottom-5 left-1/2 z-50 w-full max-w-screen-md -translate-x-1/2 transform px-6 md:bottom-6'>
                                    <button
                                        className={`focus:shadow-outline h-12 w-full rounded-full bg-black px-4 py-2 font-bold text-white focus:outline-none`}
                                        onClick={onRegisterButtonClicked}>
                                        Register
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                    {wallets?.[0]?.connectorType != 'embedded' && (
                        <TransactionDialog
                            open={transactionInProgress}
                            showLoadAnimation={true}
                            setOpen={setTransactionInProgress}
                        />
                    )}
                </div>
            </Section>
        </Page>
    )
}

export default PoolPage
