'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAppStore } from '@/app/_client/providers/app-store.provider'
import ParticipantCard from './participantRow'
import { useParticipants } from '@/hooks/use-participants'
import SearchBar from './searchBar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_components/ui/tabs'
import { PoolDetailsDTO } from '../../_lib/definitions'
import PoolDetailsProgress from '../../_components/pool-details-progress'
import { Button } from '@/app/_components/ui/button'
import { Loader2 } from 'lucide-react'
import { usePayoutStore } from '@/app/_client/stores/payout-store'
import useTransactions from '@/app/_client/hooks/use-smart-transaction'
import { formatUnits, getAbiItem } from 'viem'
import { poolAbi } from '@/types/contracts'
import { currentPoolAddress } from '@/app/_server/blockchain/server-config'
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
    const { executeTransactions } = useTransactions()
    const [payoutAddresses, setPayoutAddresses] = useState<string[]>([])
    const [payoutAmounts, setPayoutAmounts] = useState<string[]>([])
    const clearPoolPayouts = usePayoutStore(state => state.clearPoolPayouts)

    const filteredParticipants = useMemo(() => {
        return (
            participants?.filter(participant => participant.displayName.toLowerCase().includes(query.toLowerCase())) ||
            []
        )
    }, [participants, query])

    const OnPayoutButtonClicked = async (addresses: string[], amounts: string[]) => {
        const SetWinnersFunction = getAbiItem({
            abi: poolAbi,
            name: 'setWinners',
        })

        try {
            await executeTransactions([
                {
                    address: currentPoolAddress,
                    abi: [SetWinnersFunction],
                    functionName: SetWinnersFunction.name,
                    args: [poolId, addresses, amounts],
                },
            ])
            toast.success('Successfully set payouts')
            clearPoolPayouts(poolId)
        } catch (error) {
            console.log('Set Winner Error', error)
            toast.error('Failed to set payouts')
        }
    }

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
    }, [poolId])

    useEffect(() => {
        if (isAdmin && currentTab === TabValue.Winners) {
            setBottomBarContent(
                <Button
                    className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'
                    onClick={() => OnPayoutButtonClicked(payoutAddresses, payoutAmounts)}>
                    Payout
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
                                current={Number(formatUnits(BigInt(poolData.poolBalance), poolData.tokenDecimals))}
                                goal={Number(formatUnits(BigInt(poolData.totalDeposits), poolData.tokenDecimals))}
                                description={`${(poolData.poolBalance / poolData.totalDeposits) * 100}% Remaining of $ ${formatUnits(BigInt(poolData.totalDeposits), poolData.tokenDecimals)} Prize Pool`}></PoolDetailsProgress>
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

const ParticipantList = ({
    participants,
    poolId,
    isAdmin,
    tabValue,
    poolData,
}: {
    participants: ReturnType<typeof useParticipants>['data']
    poolId: string
    isAdmin: boolean
    tabValue: TabValue
    poolData: PoolDetailsDTO
}) => {
    const { payouts } = usePayoutStore()
    const tabParticipants = participants?.filter(participant => {
        switch (tabValue) {
            case TabValue.Registered:
                return true
            case TabValue.CheckedIn:
                return participant.checkedInAt != null
            case TabValue.Winners:
                return (
                    participant.wonAmount > 0 ||
                    (payouts[poolId] && payouts[poolId].some(p => p.participantAddress === participant.address))
                )
            default:
                return true
        }
    })

    return (
        <>
            {tabParticipants && tabParticipants.length > 0 ? (
                tabParticipants.map(participant => (
                    <ParticipantCard
                        key={participant.address}
                        address={participant.address}
                        avatar={participant.avatar}
                        displayName={participant.displayName}
                        poolId={poolId}
                        status={'Registered'}
                        tabValue={tabValue}
                        checkInAt={participant.checkedInAt}
                        isAdmin={isAdmin}
                        wonAmount={participant.wonAmount}
                        claimedAmount={poolData.claimedAmount}
                        tokenDecimals={poolData.tokenDecimals}
                    />
                ))
            ) : (
                <p>No participants found.</p>
            )}
        </>
    )
}

export default Participants
