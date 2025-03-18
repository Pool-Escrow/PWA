'use client'

import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/app/_components/ui/sheet'
import { useWallets } from '@privy-io/react-auth'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { toast } from 'sonner'
import UserInfo from '../../_components/user-info/user-info'
import { useSwapContext } from '../context/SwapContext'
import type { OKXToken } from '../types'
import { ActionButton } from './ActionButton'
import type { BridgeInfoCardProps } from './bridge-card'
import { FromSection } from './FromSection'
import { useNetworkFetching } from './hooks/useNetworkFetching'
import { useRouteCalculation } from './hooks/useRouteCalculation'
import { useSheetDrag } from './hooks/useSheetDrag'
import { useSwapExecution } from './hooks/useSwapExecution'
import { useTokenSelection } from './hooks/useTokenSelection'
import { useTransactionHistory } from './hooks/useTransactionHistory'
import { ServiceUnavailableMessage } from './ServiceUnavailableMessage'
import type { TokenSelectorProps } from './TokenSelector'
import { ToSection } from './ToSection'
import { TransactionHistory } from './tx-history'

const TokenSelectorDynamic = dynamic<TokenSelectorProps>(
    () => import('./TokenSelector').then(mod => mod.TokenSelector),
    {
        loading: () => <div>Loading...</div>,
        ssr: false,
    },
)

const BridgeInfoCardDynamic = dynamic<BridgeInfoCardProps>(
    () => import('./bridge-card').then(mod => mod.BridgeInfoCard),
    {
        loading: () => <div>Loading...</div>,
        ssr: false,
    },
)

const CrossChainSwapSection = () => {
    const { wallets } = useWallets()
    const { state, dispatch } = useSwapContext()
    const [isSelectOpen, setIsSelectOpen] = useState(false)
    const [isSwapping, setIsSwapping] = useState(false)
    const [isHistoryOpen, setHistory] = useState(false)
    const { fetchedNetworks } = useNetworkFetching(wallets)
    const {
        selectedNetwork,
        searchQuery,
        setSelectedNetwork,
        setSearchQuery,
        filteredTokens,
        isLoading,
        error,
        isServiceUnavailable,
        refetch,
    } = useTokenSelection({
        fromNetwork: state.fromNetwork,
    })

    console.log('[CrossChainSwap] Component state:', {
        fromNetwork: state.fromNetwork,
        fromToken: state.fromToken,
        fromAmount: state.fromAmount,
        walletAddress: wallets[0]?.address,
        selectedNetwork,
        searchQuery,
        filteredTokensLength: filteredTokens.length,
        fetchedNetworksLength: fetchedNetworks.length,
        isLoading,
        hasError: !!error,
        isServiceUnavailable,
    })

    useRouteCalculation({
        fromNetwork: state.fromNetwork,
        fromToken: state.fromToken,
        fromAmount: state.fromAmount,
        walletAddress: wallets[0]?.address,
        dispatch,
    })

    const transactionHistory = useTransactionHistory({
        fetchedNetworks,
        fetchedTokens: filteredTokens,
        walletAddress: wallets[0]?.address,
    })

    const { approve, swap } = useSwapExecution({
        fromNetwork: state.fromNetwork,
        fromToken: state.fromToken,
        fromAmount: state.fromAmount,
        onSwapComplete: () => toast.message('Transaction submitted'),
    })

    const { sheetRef, handleDragStart, handleDrag, handleDragEnd } = useSheetDrag(() => setIsSelectOpen(false))

    const handleFromTokenSelect = (token: OKXToken) => {
        dispatch({ type: 'SET_FROM_TOKEN', payload: token })
        setIsSelectOpen(false)
    }

    const handleFromAmountChange = (amount: string) => {
        dispatch({ type: 'SET_FROM_AMOUNT', payload: amount })
    }

    const handleApprove = () => {
        try {
            approve()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Approval failed')
        }
    }

    const handleSwap = () => {
        try {
            setIsSwapping(true)
            swap()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Swap failed')
        } finally {
            setIsSwapping(false)
        }
    }

    const handleNetworkSelect = (networkId: string) => {
        if (networkId === 'all') {
            return
        }

        const selectedNetwork = fetchedNetworks.find(n => n.chainId === networkId)
        if (selectedNetwork) {
            dispatch({ type: 'SET_FROM_NETWORK', payload: selectedNetwork })
            // Reset token-related states when network changes
            dispatch({ type: 'SET_FROM_TOKEN', payload: state.fromToken }) // Reset token selection
            dispatch({ type: 'SET_FROM_AMOUNT', payload: '0.0' })
            dispatch({ type: 'SET_RECEIVED_AMOUNT', payload: '0.0' })
            dispatch({ type: 'SET_APPROVAL_STATUS', payload: false })
            dispatch({ type: 'SET_ROUTER_INFO', payload: null })
            dispatch({ type: 'SET_HISTORY', payload: transactionHistory.transactions })
            setSelectedNetwork(networkId)
        }
    }

    return (
        <div className='relative min-h-screen overflow-y-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
            <div className='mx-auto w-full max-w-md space-y-4 overflow-y-scroll px-3 pb-24 pt-3'>
                <UserInfo variant='cross-swap' onHistoryClick={() => setHistory(true)} hasTransactions={true} />

                {isServiceUnavailable ? (
                    <div className='detail_card mx-auto w-full rounded-[24px] p-4'>
                        <ServiceUnavailableMessage onRetry={() => void refetch()} />
                    </div>
                ) : (
                    <>
                        <Sheet open={isSelectOpen} onOpenChange={setIsSelectOpen}>
                            <SheetContent
                                ref={sheetRef}
                                side='bottom'
                                className='h-[85vh] touch-none rounded-t-[24px] p-4'>
                                <div
                                    className='absolute left-1/2 top-2.5 h-1.5 w-12 -translate-x-1/2 cursor-grab touch-none rounded-full bg-gray-300 active:cursor-grabbing'
                                    onPointerDown={handleDragStart}
                                    onPointerMove={handleDrag}
                                    onPointerUp={handleDragEnd}
                                    onPointerCancel={handleDragEnd}
                                    role='button'
                                    aria-label='Drag to close'
                                />
                                <SheetTitle className='sr-only'>Select Token</SheetTitle>
                                <SheetDescription className='sr-only'>
                                    Select a token from the list to use in your transaction
                                </SheetDescription>
                                <TokenSelectorDynamic
                                    onClose={() => setIsSelectOpen(false)}
                                    filteredTokens={filteredTokens}
                                    selectedNetwork={selectedNetwork}
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    onNetworkSelect={handleNetworkSelect}
                                    onTokenSelect={handleFromTokenSelect}
                                    networks={fetchedNetworks}
                                    isLoading={isLoading}
                                    error={error}
                                    isServiceUnavailable={isServiceUnavailable}
                                />
                            </SheetContent>
                        </Sheet>

                        <TransactionHistory
                            isOpen={isHistoryOpen}
                            onOpenChangeAction={setHistory}
                            transactions={transactionHistory.transactions}
                            networks={fetchedNetworks}
                            tokens={filteredTokens}
                        />

                        <div className='detail_card mx-auto w-full rounded-[24px]'>
                            <FromSection
                                fromNetwork={state.fromNetwork}
                                fromToken={state.fromToken}
                                fromAmount={state.fromAmount}
                                onSelectClick={() => setIsSelectOpen(true)}
                                onAmountChange={handleFromAmountChange}
                            />
                            <ToSection receivedAmount={state.receivedAmount} />
                        </div>

                        {state.routerInfo && <BridgeInfoCardDynamic bridgeInfo={state.routerInfo} />}
                    </>
                )}
            </div>
            <ActionButton
                isApproved={state.isApproved}
                onApproveAction={handleApprove}
                onSwapAction={handleSwap}
                disabled={!state.fromAmount || Number(state.fromAmount) === 0 || isSwapping || isServiceUnavailable}
            />
        </div>
    )
}

export default CrossChainSwapSection
