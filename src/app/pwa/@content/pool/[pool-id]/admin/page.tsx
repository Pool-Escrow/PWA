import { usePrivy, useWallets } from '@privy-io/react-auth'
import editIcon from '@/public/images/edit_icon.svg'
import defaultPoolImage from '@/public/images/frog.png'
import qrCodeIcon from '@/public/images/qr_code_icon.svg'
import Divider from '@/components/divider'
import ShareDialog from '@/components/shareDialog'
import { Progress } from '@/components/ui/progress'
import {
    fetchAllPoolDataFromDB,
    fetchAllPoolDataFromSC,
    fetchTokenDecimals,
    fetchTokenSymbol,
    handleEnableDeposit,
    handleEndPool,
    handleStartPool,
} from '@/lib/api/clientAPI'
import rightArrow from '@/public/images/right_arrow.svg'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import _ from 'lodash'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Database } from '@/types/db'
import { formatEventDateTime, formatTimeDiff } from '@/lib/utils/date-time'
import { toast } from 'sonner'
import Page from '@/components/page'
import Appbar from '@/components/appbar'
import Section from '@/components/common/layout/section'
import CountdownTimer from '@/components/countdown'
import PoolStatus from '@/components/common/other/poolStatus'
import TransactionDialog from '@/components/common/dialogs/transaction.dialog'

export type PoolRow = Database['public']['Tables']['pools']['Row']
export type UserDisplayRow = Database['public']['Tables']['users']['Row']

const AdminPoolPage = () => {
    const router = useRouter()

    const { ready, authenticated, user } = usePrivy()

    const { wallets, ready: walletsReady } = useWallets()

    const [poolDbData, setPoolDbData] = useState<any | undefined>()
    const [poolImageUrl, setPoolImageUrl] = useState<String | null | undefined>()
    const [cohostDbData, setCohostDbData] = useState<any[]>([])
    const [transactionInProgress, setTransactionInProgress] = useState<boolean>(false)

    const [pageUrl, setPageUrl] = useState('')
    const [timeLeft, setTimeLeft] = useState<number>()

    const calculateTimeLeft = (startTime: string) => {
        const currentTimestamp: Date = new Date()
        const startDateObject: Date = new Date(startTime)
        const timeDiff = startDateObject.getTime() - currentTimestamp.getTime()
        const { days, minutes, seconds } = formatTimeDiff(timeDiff)
        console.log('days', days)
        console.log('minutes', minutes)
        console.log('seconds', seconds)
        console.log('timeLeft', Math.floor(timeDiff / 1000))

        setTimeLeft(timeDiff)
    }

    const poolId = router?.query?.poolId! ?? 0
    const queryClient = useQueryClient()

    const { data: poolSCInfo } = useQuery({
        queryKey: ['fetchAllPoolDataFromSC', poolId.toString()],
        queryFn: fetchAllPoolDataFromSC,
        enabled: !!poolId,
    })

    const { data: poolDBInfo } = useQuery({
        queryKey: ['fetchAllPoolDataFromDB', poolId.toString()],
        queryFn: fetchAllPoolDataFromDB,
        enabled: !!poolId,
    })

    const poolSCAdmin = poolSCInfo?.[0]
    const poolSCDetail = poolSCInfo?.[1]
    const poolSCToken = poolSCInfo?.[4]
    const poolSCName = poolSCInfo?.[1][2]
    const poolSCStatus = poolSCInfo?.[3]
    let poolSCParticipants = poolSCInfo?.[5]
    const poolSCWinners = poolSCInfo?.[6]

    const { data: tokenDecimals } = useQuery({
        queryKey: ['fetchTokenDecimals', poolSCToken],
        queryFn: fetchTokenDecimals,
        enabled: !_.isEmpty(poolSCToken),
    })

    const calculatedPoolSCBalance = (poolSCInfo: any) =>
        (BigInt(poolSCInfo?.[2][0]) / BigInt(Math.pow(10, Number(tokenDecimals ?? 18)))).toString()

    let poolSCBalance = poolSCInfo ? calculatedPoolSCBalance(poolSCInfo) : 0

    const calculatedPoolSCDepositPerPerson = (poolSCInfo: any) =>
        (BigInt(poolSCInfo?.[1][3]) / BigInt(Math.pow(10, Number(tokenDecimals ?? 18)))).toString()

    const poolSCDepositPerPersonString = poolSCInfo ? calculatedPoolSCDepositPerPerson(poolSCInfo) : 0

    const { data: tokenSymbol } = useQuery({
        queryKey: ['fetchTokenSymbol', poolSCToken],
        queryFn: fetchTokenSymbol,
        enabled: !_.isEmpty(poolSCToken),
    })

    useEffect(() => {
        setPoolDbData(poolDBInfo?.poolDBInfo)
        setCohostDbData(poolDBInfo?.cohostUserDisplayData ?? [])
        setPoolImageUrl(poolDBInfo?.poolImageUrl)

        console.log('poolDBInfo', poolDBInfo)
        setPageUrl(window?.location.href)
        console.log('event_timestamp', poolDBInfo?.poolDBInfo?.event_timestamp)
        calculateTimeLeft(poolDBInfo?.poolDBInfo?.event_timestamp)
    }, [ready, authenticated, poolSCInfo, poolDBInfo, walletsReady])

    const poolSCTimeStart = poolSCDetail?.[0]?.toString()
    const eventDate = formatEventDateTime(poolSCTimeStart) ?? ''

    const participantPercent = (poolSCParticipants?.length / poolDbData?.soft_cap) * 100

    const enableDepositMutation = useMutation({
        mutationFn: handleEnableDeposit,
        onSuccess: () => {
            console.log('startPool Success')
            queryClient.invalidateQueries({
                queryKey: ['fetchAllPoolDataFromSC', poolId.toString()],
            })
        },
        onError: () => {
            console.log('enableDepositMutation Error')
        },
    })

    const startPoolMutation = useMutation({
        mutationFn: handleStartPool,
        onSuccess: () => {
            console.log('startPool Success')
            queryClient.invalidateQueries({
                queryKey: ['fetchAllPoolDataFromSC', poolId.toString()],
            })
        },
        onError: () => {
            console.log('startPoolMutation Error')
        },
    })

    const endPoolMutation = useMutation({
        mutationFn: handleEndPool,
        onSuccess: () => {
            console.log('endPool Success')
            queryClient.invalidateQueries({
                queryKey: ['fetchAllPoolDataFromSC', poolId.toString()],
            })
        },
        onError: () => {
            console.log('endPoolMutation Error')
        },
    })

    const onEnableDepositButtonClicked = () => {
        toast('Requesting Transaction', {
            description: 'Enable Deposit',
        })
        enableDepositMutation.mutate({
            params: [poolId.toString(), wallets],
        })
    }

    const onStartPoolButtonClicked = () => {
        toast('Requesting Transaction', {
            description: 'Start pool',
        })
        startPoolMutation.mutate({
            params: [poolId.toString(), wallets],
        })
    }

    const onEndPoolButtonClicked = (e: any) => {
        toast('Requesting Transaction', {
            description: 'End pool',
        })

        endPoolMutation.mutate({
            params: [poolId.toString(), wallets],
        })
    }

    const cohostNames: string = cohostDbData.map((data: any) => data.display_name).join(',')

    if (_.isEmpty(router.query.poolId)) {
        return <></>
    }
    return (
        <Page>
            <Appbar backRoute='/admin' />

            <Section>
                <div className='flex w-full flex-col items-center justify-center'>
                    <div className='relative flex min-h-screen w-full flex-col items-center justify-center pb-20 pt-16 md:pb-24'>
                        <div
                            className={`cardBackground flex w-full flex-col space-y-4 rounded-3xl p-4 md:space-y-10 md:p-10`}>
                            <div className='relative overflow-hidden rounded-3xl'>
                                <div className='h-full w-full bg-black object-contain object-center'>
                                    {poolImageUrl ? (
                                        <Image src={poolImageUrl as string} alt='Pool Image' fill />
                                    ) : (
                                        <Image src={defaultPoolImage.src} alt='Pool Image' fill />
                                    )}
                                </div>
                                <div className='absolute bottom-0 flex h-full w-full flex-col items-center justify-center space-y-3 bg-black bg-opacity-60 text-white backdrop-blur-sm backdrop-filter md:space-y-6'>
                                    {timeLeft != undefined && timeLeft > 0 && (
                                        <div>
                                            <h4 className='text-xs md:text-2xl'>Starts in</h4>
                                            <h3 className='text-4xl font-semibold md:text-7xl'>
                                                {<CountdownTimer timeleft={timeLeft} />}
                                            </h3>
                                        </div>
                                    )}
                                </div>
                                <div className='absolute right-2 top-0 flex h-full w-10 flex-col items-center space-y-3 py-4 text-white md:right-4 md:w-20 md:space-y-5 md:py-6'>
                                    <Link
                                        href={`${pageUrl}/checkin-scan` as any}
                                        className='h-8 w-8 rounded-full bg-black bg-opacity-40 p-2 md:h-14 md:w-14 md:p-3'>
                                        <Image
                                            className='flex h-full w-full'
                                            src={qrCodeIcon.src}
                                            fill
                                            alt='QR Code Icon'
                                        />
                                    </Link>
                                    <ShareDialog />

                                    <button
                                        title='Edit Pool'
                                        type='button'
                                        className='h-8 w-8 rounded-full bg-black bg-opacity-40 p-2 md:h-14 md:w-14 md:p-3'>
                                        <Image className='flex h-full w-full' src={editIcon.src} fill alt='Edit Icon' />
                                    </button>
                                </div>
                                <PoolStatus status={poolSCStatus} />
                            </div>
                            <div className='flex flex-col space-y-6 md:space-y-12'>
                                <div className='flex flex-col space-y-2 overflow-hidden md:space-y-4'>
                                    <h2 className='text-lg font-semibold md:text-4xl'>{poolSCName}</h2>
                                    <p className='text-sm md:text-2xl'>{eventDate}</p>
                                    <p className='w-full overflow-ellipsis text-sm font-semibold md:text-2xl'>
                                        Hosted by {cohostNames}
                                    </p>
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
                                <div className='flex justify-between text-sm md:text-3xl'>
                                    <p className='flex flex-row space-x-2'>
                                        <span className='font-bold'>{poolSCParticipants?.length}</span>
                                        <span>Participants</span>
                                    </p>
                                    <Link
                                        className='flex flex-row items-center space-x-2 px-1 md:space-x-6 md:px-2'
                                        href={`${window.location.href}/participants` as any}>
                                        <span>View all</span>
                                        <span>
                                            <Image src={`${rightArrow.src}`} width={12} height={12} alt='Right Arrow' />
                                        </span>
                                    </Link>
                                </div>
                                <Progress value={participantPercent} />
                            </div>
                        </div>

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
                        {poolSCStatus == 0 && (
                            <div className='fixed bottom-5 left-1/2 flex w-full max-w-screen-md -translate-x-1/2 transform flex-row space-x-2 px-6 md:bottom-6'>
                                <button
                                    title='Enable Deposit'
                                    type='button'
                                    className={`focus:shadow-outline flex h-12 flex-1 items-center justify-center rounded-full bg-black px-4 py-2 text-center font-bold text-white focus:outline-none`}
                                    onClick={onEnableDepositButtonClicked}>
                                    Enable Deposit
                                </button>
                            </div>
                        )}
                        {poolSCStatus == 1 && (
                            <div className='fixed bottom-5 left-1/2 flex w-full max-w-screen-md -translate-x-1/2 transform flex-row space-x-2 px-6 md:bottom-6'>
                                <button
                                    title='Start Pool'
                                    type='button'
                                    className={`focus:shadow-outline flex h-12 flex-1 items-center justify-center rounded-full bg-black px-4 py-2 text-center font-bold text-white focus:outline-none`}
                                    onClick={onStartPoolButtonClicked}>
                                    Start Pool
                                </button>
                            </div>
                        )}
                        {poolSCStatus == 2 && (
                            <div className='fixed bottom-5 left-1/2 w-full max-w-screen-md -translate-x-1/2 transform px-6 md:bottom-6'>
                                <button
                                    title='End Pool'
                                    type='button'
                                    className={`focus:shadow-outline h-12 w-full rounded-full bg-black px-4 py-2 font-bold text-white focus:outline-none`}
                                    onClick={onEndPoolButtonClicked}>
                                    End Pool
                                </button>
                            </div>
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

export default AdminPoolPage
