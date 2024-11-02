'use client'

import SearchBar from '@/app/(pages)/pool/[pool-id]/participants/_components/searchBar'
import { useTokenDecimals } from '@/app/(pages)/profile/send/_components/use-token-decimals'
import { useAppStore } from '@/app/_client/providers/app-store.provider'
import { usePayoutStore } from '@/app/_client/stores/payout-store'
import { Button } from '@/app/_components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_components/ui/tabs'
import { useParticipants } from '@/hooks/use-participants'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { formatUnits } from 'viem'
import { usePoolDetails } from '../../ticket/_components/use-pool-details'
import ParticipantList from './participantsList'
import PoolBalanceProgress from './pool-balance-progress'
import { useSetWinners } from './use-set-winners'

interface PoolParticipantsProps {
    poolId: string
    isAdmin: boolean
}

export enum TabValue {
    Registered = 'registered',
    CheckedIn = 'checkedIn',
    Winners = 'winners',
}

const Participants = ({ poolId, isAdmin }: PoolParticipantsProps) => {
    const { setBottomBarContent } = useAppStore(s => ({
        setBottomBarContent: s.setBottomBarContent,
    }))
    const [query, setQuery] = useState('')
    const { data: participants, isLoading, error } = useParticipants(poolId)
    const poolData = usePoolDetails(poolId)
    const [currentTab, setCurrentTab] = useState(TabValue.Registered)

    const [payoutAddresses, setPayoutAddresses] = useState<string[]>([])
    const [payoutAmounts, setPayoutAmounts] = useState<string[]>([])
    const { setWinners, isPending, isConfirming, isError } = useSetWinners(poolId)
    const [totalSavedPayout, setTotalSavedPayout] = useState<string>('0')
    const tokenAddress = poolData?.poolDetails?.poolDetailFromSC?.[4]
    const tokenDecimals = useTokenDecimals(tokenAddress || '16').tokenDecimalsData.tokenDecimals
    const filteredParticipants = useMemo(() => {
        return (
            participants?.filter(
                participant =>
                    participant.displayName.toLowerCase().includes(query.toLowerCase()) ||
                    participant.address.toLowerCase().includes(query.toLowerCase()),
            ) || []
        )
    }, [participants, query])

    useEffect(() => {
        const allPayouts = usePayoutStore.getState().payouts[poolId] || []
        const addresses = allPayouts.map(payout => payout.participantAddress)
        const amounts = allPayouts.map(payout => payout.amount)

        setPayoutAddresses(addresses)
        setPayoutAmounts(amounts)
        const total = allPayouts.reduce((sum, payout) => sum + BigInt(payout.amount), BigInt(0))
        setTotalSavedPayout(total.toString())
    }, [poolId])

    useEffect(() => {
        if (isAdmin && currentTab === TabValue.Winners) {
            setBottomBarContent(
                <Button
                    className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'
                    onClick={() => {
                        if (payoutAddresses.length === 0) {
                            toast('No payout saved.')
                        } else {
                            setWinners(payoutAddresses, payoutAmounts)
                        }
                    }}
                    disabled={isPending || isConfirming}>
                    {isPending || isConfirming ? 'Processing...' : 'Payout'}
                </Button>,
            )
        }
        return () => setBottomBarContent(null)
    }, [setBottomBarContent, isAdmin, currentTab, payoutAddresses, payoutAmounts])

    useEffect(() => {
        const allPayouts = usePayoutStore.getState().payouts[poolId] || []
        const addresses = allPayouts.map(payout => payout.participantAddress)
        const amounts = allPayouts.map(payout => payout.amount)

        setPayoutAddresses(addresses)
        setPayoutAmounts(amounts)
        const total = allPayouts.reduce((sum, payout) => sum + BigInt(payout.amount), BigInt(0))
        setTotalSavedPayout(total.toString())
    }, [poolId])

    useEffect(() => {
        if (isAdmin && currentTab === TabValue.Winners) {
            setBottomBarContent(
                <Button
                    className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'
                    onClick={() => {
                        if (payoutAddresses.length === 0) {
                            toast('No payout saved.')
                        } else {
                            setWinners(payoutAddresses, payoutAmounts)
                        }
                    }}
                    disabled={isPending || isConfirming}>
                    {isPending || isConfirming ? 'Processing...' : 'Payout'}
                </Button>,
            )
        }
        return () => setBottomBarContent(null)
    }, [setBottomBarContent, isAdmin, currentTab, payoutAddresses, payoutAmounts])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value)
    }

    const handleTabChange = (value: TabValue) => {
        setCurrentTab(value)
    }

    if (isLoading) return <div>Loading participants...</div>
    if (error) return <div>Error loading participants</div>

    return (
        <div className='overflow-hidden rounded-lg bg-white'>
            <div className='p-4'>
                <SearchBar query={query} onChange={handleChange} poolId={poolId} isAdmin={isAdmin} />
                <Tabs
                    defaultValue={TabValue.Registered}
                    className='w-full'
                    onValueChange={(value: string) => handleTabChange(value as TabValue)}>
                    {isAdmin && (
                        <TabsList className='z-10 flex w-full justify-start space-x-0 rounded-none bg-white p-0 md:space-x-8'>
                            <TabsTrigger className='font-semibold' value={TabValue.Registered}>
                                Registered
                            </TabsTrigger>
                            <TabsTrigger className='font-semibold' value={TabValue.CheckedIn}>
                                Checked in
                            </TabsTrigger>
                            <TabsTrigger className='font-semibold' value={TabValue.Winners}>
                                Winners
                            </TabsTrigger>
                            {/* <TabsTrigger value='refunded'>Refunded</TabsTrigger> */}
                        </TabsList>
                    )}
                    <TabsContent value='registered'></TabsContent>
                    <TabsContent value='checkedIn'></TabsContent>
                    <TabsContent value='winners'></TabsContent>
                    {/* <TabsContent value='refunded'>Refunded</TabsContent> */}
                    {currentTab === TabValue.Winners && (
                        <div className='my-4'>
                            <PoolBalanceProgress
                                current={Number(
                                    formatUnits(
                                        BigInt(poolData?.poolDetails?.poolDetailFromSC?.[2]?.balance ?? 0) -
                                            BigInt(totalSavedPayout),
                                        tokenDecimals,
                                    ),
                                )}
                                deposits={Number(
                                    formatUnits(
                                        BigInt(poolData?.poolDetails?.poolDetailFromSC?.[2]?.totalDeposits ?? 0),
                                        tokenDecimals,
                                    ),
                                )}></PoolBalanceProgress>
                        </div>
                    )}
                    <ParticipantList
                        participants={filteredParticipants}
                        poolId={poolId}
                        isAdmin={isAdmin}
                        tabValue={currentTab}
                        tokenDecimals={tokenDecimals}
                    />
                </Tabs>
            </div>
        </div>
    )
}

export default Participants
