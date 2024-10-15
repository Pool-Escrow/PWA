'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAppStore } from '@/app/_client/providers/app-store.provider'
import { useParticipants } from '@/hooks/use-participants'
import SearchBar from './searchBar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_components/ui/tabs'
import { PoolDetailsDTO } from '../../_lib/definitions'
import PoolDetailsProgress from '../../_components/pool-details-progress'
import { Button } from '@/app/_components/ui/button'
import { usePayoutStore } from '@/app/_client/stores/payout-store'
import { formatUnits } from 'viem'
import ParticipantList from './participantsList'
import { useSetWinners } from './use-set-winners'
import { toast } from 'sonner'

interface PoolParticipantsProps {
    poolId: string
    isAdmin: boolean
    poolData: PoolDetailsDTO
}

export enum TabValue {
    Registered = 'registered',
    CheckedIn = 'checkedIn',
    Winners = 'winners',
}

const Participants = ({ poolId, isAdmin, poolData }: PoolParticipantsProps) => {
    const { setBottomBarContent, setTopBarTitle } = useAppStore(s => ({
        setBottomBarContent: s.setBottomBarContent,
        setTopBarTitle: s.setTopBarTitle,
    }))
    const [query, setQuery] = useState('')
    const { data: participants, isLoading, error } = useParticipants(poolId)
    const [currentTab, setCurrentTab] = useState(TabValue.Registered)

    const [payoutAddresses, setPayoutAddresses] = useState<string[]>([])
    const [payoutAmounts, setPayoutAmounts] = useState<string[]>([])
    const { setWinners, isPending, isConfirming, isError } = useSetWinners(poolId)
    const [totalSavedPayout, setTotalSavedPayout] = useState<string>('0')

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
        setTopBarTitle('Manage Participants')
        return () => setTopBarTitle(null)
    }, [setTopBarTitle])

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
        <div className='mx-auto max-w-md overflow-hidden rounded-lg bg-white'>
            <div className='p-4'>
                <SearchBar query={query} onChange={handleChange} poolId={poolId} isAdmin={isAdmin} />
                <Tabs
                    defaultValue={TabValue.Registered}
                    className='w-full'
                    onValueChange={(value: string) => handleTabChange(value as TabValue)}>
                    <TabsList className='z-10 flex w-full justify-start space-x-0 rounded-none bg-white p-0 md:space-x-8'>
                        <TabsTrigger value={TabValue.Registered}>Registered</TabsTrigger>
                        <TabsTrigger value={TabValue.CheckedIn}>Checked in</TabsTrigger>
                        <TabsTrigger value={TabValue.Winners}>Winners</TabsTrigger>
                        {/* <TabsTrigger value='refunded'>Refunded</TabsTrigger> */}
                    </TabsList>
                    <TabsContent value='registered'></TabsContent>
                    <TabsContent value='checkedIn'></TabsContent>
                    <TabsContent value='winners'></TabsContent>
                    {/* <TabsContent value='refunded'>Refunded</TabsContent> */}
                    {currentTab === TabValue.Winners && (
                        <div className='my-4'>
                            <PoolDetailsProgress
                                current={Number(
                                    formatUnits(
                                        BigInt(poolData.poolBalance) - BigInt(totalSavedPayout),
                                        poolData.tokenDecimals,
                                    ),
                                )}
                                goal={Number(formatUnits(BigInt(poolData.totalDeposits), poolData.tokenDecimals))}
                                description={`${(((poolData.poolBalance - Number(totalSavedPayout)) / poolData.totalDeposits) * 100).toFixed(0)}% Remaining of $ ${formatUnits(BigInt(poolData.totalDeposits), poolData.tokenDecimals)} Prize Pool`}></PoolDetailsProgress>
                        </div>
                    )}
                    <ParticipantList
                        participants={filteredParticipants}
                        poolId={poolId}
                        isAdmin={isAdmin}
                        tabValue={currentTab}
                        poolData={poolData}
                    />
                </Tabs>
            </div>
        </div>
    )
}

export default Participants
