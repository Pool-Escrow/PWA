/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client'
import { use } from 'chai'
import {
    API_paths,
    checkApprovalStatus,
    sendGetRequest,
    sendPostRequest,
    toDecimals,
    toWholeNumber,
    USDC_BASE,
    BridgeInfo,
    formatTime,
    fetchStatus,
    getOKXAccount,
    tokenAddressToName,
    tokenAddressToLogo,
    chainIdToName,
} from './utils'
import { useWallets } from '@privy-io/react-auth'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/app/_components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuPortal,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from '@/app/_components/ui/dropdown-menu'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/_components/ui/select'
import { useSendTransaction } from '@privy-io/react-auth'
import { decodeFunctionData, encodeFunctionData, toHex } from 'viem'

import * as React from 'react'
import Image from 'next/image'
import { ChevronDown, Search, X } from 'lucide-react'
import { get, set, toNumber } from 'lodash'
import { wait } from '@testing-library/user-event/dist/cjs/utils/index.js'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_components/ui/dialog'
import { Input } from '@/app/_components/ui/input'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { hash } from 'crypto'
import { BridgeInfoCard } from './bridge-card'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/app/_components/ui/sheet'
import { tokenAddress } from '@/types/contracts'
import { TransactionHistory } from './tx-history'

// TEMPLATE NETWORK AND TOKEN ARRAY
let networks = [
    {
        chainId: '8453',
        chainName: 'Base',
        dexTokenApproveAddress: '0x57df6092665eb6058DE53939612413ff4B09114E',
    },
]
let tokens = [
    {
        decimals: '0',
        tokenContractAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        tokenLogoUrl:
            'https://static.okx.com/cdn/web3/currency/token/137-0x1e4a5963abfd975d8c9021ce480b42188849d41d-1.png/type=default_350_0?v=1735291541821',
        tokenName: 'Wrapped BTC',
        tokenSymbol: 'WBTC',
    },
]
const waitTimeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const CrossChainSwapSection = () => {
    const { wallets } = useWallets()
    const [fromNetwork, setFromNetwork] = React.useState(USDC_BASE[0])
    const [fromToken, setFromToken] = React.useState(tokens[0])
    const [fromAmount, setFromAmount] = React.useState('0.0')
    const [recievedAmount, setRecievedAmount] = React.useState('0.0')
    const [fetchedNetworks, setFetchedNetworks] = React.useState([])
    const [fetchedTokens, setFetchedTokens] = React.useState([])
    const [selectedNetwork, setSelectedNetwork] = React.useState('all')
    const [isSelectOpen, setIsSelectOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState('')
    const [isNetworkSelectOpen, setIsNetworkSelectOpen] = React.useState(false)
    const [successfulTransactions, setSuccessfulTransactions] = useState<[]>([]);
    const [reloadHistory, setReloadHistory] = useState(false);
    const [transactionHistory, setTransactionHistory] = React.useState([])
    const [isHistoryOpen, setIsHistoryOpen] = React.useState(false)
    const [ifApproved, setIfApproved] = React.useState(false)
    const [routerInfo, setRouterInfo] = React.useState({})
    const [status, setStatus] = React.useState({})
    const [dragStartY, setDragStartY] = React.useState(0)
    const [dragDeltaY, setDragDeltaY] = React.useState(0)
    const [isDragging, setIsDragging] = React.useState(false)
    const sheetRef = React.useRef<HTMLDivElement>(null)
    const dragStartRef = React.useRef(0)
    const currentDragRef = React.useRef(0)
    const isDraggingRef = React.useRef(false)
    const animationFrameRef = React.useRef<number>()
    const dragThreshold = 150

    const updateSheetPosition = (deltaY: number) => {
        if (sheetRef.current) {
            const transform = `translateY(${Math.max(0, deltaY)}px)`
            sheetRef.current.style.transform = transform
        }
    }

    // HANDLE OKX ERRORS - REFER OKX DOCS FOR ERROR CODES
    const handleErrors = (res) => {
        if (res === undefined) {
            setFromToken(USDC_BASE[1])
            if (fetchedNetworks.length == 0) {
                setFetchedTokens([USDC_BASE[1]])
            }
            toast.error('Error fetching tokens')
        } else if (res.code === '82102') {
            console.log('minimum amount error')
            toast.error(res?.msg)
        } else if (res.code === "51000"){
            console.log('error', res.msg)
            toast.error(res?.msg)
        } else {
            console.log('error', res.msg)
            toast.error(res?.msg)
        }
    }

    const handleDragStart = (e: React.PointerEvent) => {
        isDraggingRef.current = true
        dragStartRef.current = e.clientY
        currentDragRef.current = 0

        if (sheetRef.current) {
            sheetRef.current.style.transition = 'none'
        }

        e.preventDefault()
        e.currentTarget.setPointerCapture(e.pointerId)
    }

    const handleDrag = (e: React.PointerEvent) => {
        if (!isDraggingRef.current) return

        // Cancel any existing animation frame
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
        }

        // Schedule the update on the next animation frame
        animationFrameRef.current = requestAnimationFrame(() => {
            const deltaY = e.clientY - dragStartRef.current
            currentDragRef.current = deltaY
            updateSheetPosition(deltaY)
        })
    }

    const handleDragEnd = (e: React.PointerEvent) => {
        isDraggingRef.current = false
        e.currentTarget.releasePointerCapture(e.pointerId)

        if (sheetRef.current) {
            sheetRef.current.style.transition = 'transform 0.3s cubic-bezier(0.19, 1, 0.22, 1)'

            if (currentDragRef.current > dragThreshold) {
                setIsSelectOpen(false)
            } else {
                updateSheetPosition(0)
            }
        }
    }

    React.useEffect(() => {
        return () => {
            // Cleanup animation frame on unmount
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [])
    // FETCH NETWORKS & CHAIN DETAILS WHEN WALLET IS IDENTIFIED
    useEffect(() => {
        const { path, call } = API_paths['chains']
        const connectedWallet = wallets[0]
        if (connectedWallet) {
            console.log('PAAATH', path)
            const fetchChains = async () => {
                let res = await sendGetRequest(path, null)
                    .then(res => {
                        if (res.code === '50011') {
                            void wait(1000)
                            void fetchChains()
                        } else if (res.code === '0') {
                            networks = res?.data
                            setFetchedNetworks(res?.data)
                            toast.success('Networks fetched successfully')
                            // console.log('networks', networks)
                            return res
                        } else {
                            console.log('error', res.msg)
                            handleErrors(res);
                            toast.error(res?.msg)
                        }
                    })
                    .catch(err => {
                        console.log('err', err)
                        toast.error(err?.msg)
                    })
            }
            void fetchChains()
        }
    }, [wallets])

    useEffect(() => {
        const fetchTokens = async () => {
            const { path, call } = API_paths['tokens/all']
            const networkChainId = fromNetwork.chainId
            let res = await sendGetRequest(path, { chainId: networkChainId })
                .then(res => {
                    if (res.code === '50011') {
                        void wait(1000)
                        void fetchTokens()
                    } else if (res.code === '0') {
                        tokens = res?.data
                        setFetchedTokens(res?.data)
                        toast.success('Tokens fetched successfully')
                        return res
                    } else {
                        console.log('error', res.msg)
                        handleErrors(res);
                        toast.error(res?.msg)
                    }
                })
                .catch(err => {
                    console.log('err', err)
                    toast.error(err?.msg)
                })
        }
        void fetchTokens()
    }, [fromNetwork, selectedNetwork])

    useEffect(() => {
        // Only fetch route if fromAmount is valid and non-zero
        if (!fromAmount || fromAmount === '' || Number(fromAmount) === 0) {
            setRecievedAmount('0.0')
            setRouterInfo({})
            return
        }

        const fetchRoute = async () => {
            const { path, call } = API_paths['route']
            const params = {
                fromChainId: fromNetwork.chainId,
                toChainId: USDC_BASE[0].chainId, //"137"
                fromTokenAddress: fromToken.tokenContractAddress,
                toTokenAddress: USDC_BASE[1].tokenContractAddress,//"0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",//
                amount: toDecimals(toNumber(fromAmount), toNumber(fromToken.decimals)),
                slippage: '0.015',
            }
            await checkApprovalStatus(
                fromToken.tokenContractAddress,
                wallets[0].address,
                toDecimals(toNumber(fromAmount), toNumber(fromToken.decimals)),
            ).then(res => {
                setIfApproved(res)
            })
            let res = await sendGetRequest(path, params)
                .then(res => {
                    if (res.code === '50011') {
                        void wait(1000)
                        void fetchRoute()
                    } else if (res.code === '0') {
                        console.log('res', res)
                        const data = res.data[0]
                        const routerResult = data.routerList[0]
                        const router: BridgeInfo = {
                            protocol: routerResult.router.bridgeName,
                            rate: {
                                from: {
                                    amount: toWholeNumber(data.fromTokenAmount, toNumber(data.fromToken.decimals)),
                                    token: data.fromToken.tokenSymbol,
                                },
                                to: {
                                    amount: toWholeNumber(routerResult.toTokenAmount, toNumber(USDC_BASE[1].decimals)),
                                    token: USDC_BASE[1].tokenSymbol,
                                },
                            },
                            fee: {
                                networkFee: toWholeNumber(routerResult.fromChainNetworkFee, 18),
                                token: 'ETH',
                            },
                            estimatedTime: formatTime(toNumber(routerResult.estimateTime)),
                            slippage: '0.015',
                        }
                        setRouterInfo(router)
                        setRecievedAmount(
                            toWholeNumber(
                                res.data[0].routerList[0].toTokenAmount,
                                toNumber(USDC_BASE[1].decimals),
                            ).toString(),
                        )
                        toast.success('Route fetched successfully')
                        return res
                    } else {
                        console.log('error', res.msg)
                        handleErrors(res);
                        toast.error(res?.msg)
                    }

                })
                .catch(err => {
                    console.log('err', err)
                    toast.error(err?.msg)
                })

        }
        void fetchRoute()
    }, [fromToken, fromAmount])

    // FETCH TRANSACTION HISTORY
    useEffect(() => {
        // if (!isHistoryOpen) return; // Prevent fetching when modal is closed

        const fetchWithThrottle = async () => {
          const results = [];
            const txnHistory = await fetchTxnHistory();
            // console.log('INNNNNNNNtransactionHistory', transactionHistory)
            toast.message('Fetching transaction history... Please wait');
          for (const txn of txnHistory) {
            try {
                console.log('txnId', txn.txHash)
                if (results.some(existingTxn => existingTxn.id === txn.txHash) ) {
                    // console.log('ALREADY EXISTS')
                    continue;
                }else if (results.length >=5 ) {
                    console.log('MAX LIMIT REACHED')
                    break;
                }
              const res = await fetchStatus(txn.txHash);
            //   console.log(`Fetched status for ${txn.txHash}:`, res);

              if (res.status == "SUCCESS" || res.status == "PENDING") {
                console.log(`Transaction ${txn.txHash} is successful!`);
                    results.push({
                        id: txn.txHash,
                        date: new Date(parseInt(txn.txTime)).toISOString(),
                        fromChain: { chainId: res.fromChainId, name: chainIdToName(res.fromChainId, fetchedNetworks) },
                        toChain: { chainId: res.toChainId, name: chainIdToName(res.toChainId, fetchedNetworks) },
                        amount: res.fromAmount,
                        toAmount: res.toAmount,
                        fromToken: { name: tokenAddressToName(res.fromTokenAddress, fetchedTokens), logo: tokenAddressToLogo(res.fromTokenAddress, fetchedTokens) },
                        toToken: { name: USDC_BASE[1].tokenSymbol, logo: USDC_BASE[1].tokenLogoUrl }, // HARDCODE TO USDC BASE
                        toTxnHash: res.toTxHash,
                        status: res.detailStatus
                    });
              }
            } catch (error) {
              console.error(`Error fetching status for ${txn.txHash}:`, error);
            }

            await waitTimeout(1000); // ⏳ Wait 1 sec before the next request
          }
          console.log('results', results)
          setSuccessfulTransactions(results); // ✅ Update UI with successful transactions
          toast.success('Transaction history fetched successfully');
        };

        void fetchWithThrottle();
      }, [fetchedNetworks, reloadHistory]);

    // HANDLE APPROVE FUNCTION
    const handleApproveBridge = async () => {
        const provider = await wallets[0].getEthereumProvider()
        const { path, call } = API_paths['approve']
        const params = {
            chainId: fromNetwork.chainId,
            tokenContractAddress: fromToken.tokenContractAddress,
            approveAmount: toDecimals(toNumber(fromAmount), toNumber(fromToken.decimals)) * 4,
        }
        let res = await sendGetRequest(path, params)
            .then(async res => {
                if (res.code === '50011') {
                    void wait(1000)
                    void handleApproveBridge()
                } else if (res.code === '0') {
                    console.log('res', res)
                    const data = res.data[0].data
                    const dexAddress = res.data[0].dexContractAddress
                    const txRequest = {
                        gas: toHex(toNumber(res.data[0].gasLimit)),
                        gasPrice: toHex(toNumber(res.data[0].gasPrice)),
                        from: wallets[0].address,
                        to: fromToken.tokenContractAddress,
                        data: data,
                        value: '0x0',
                    }
                    console.log('txRequest', txRequest)
                    await provider
                        .request({
                            method: 'eth_sendTransaction',
                            params: [txRequest],
                        })
                        .then(res => {
                            console.log('res', res)
                            setIfApproved(true)
                            return res
                        })
                        .catch(err => {
                            console.log('err', err)
                        })
                } else {
                    console.log('error', res.msg)
                    handleErrors(res);
                    toast.error(res?.msg)
                }
            })
            .catch(err => {
                console.log('err', err)
                toast.error(err?.msg)
            })
    }

    // HANDLE SWAP FUNCTION
    const handleSwap = async () => {
        const provider = await wallets[0].getEthereumProvider()
        console.log('amount', toDecimals(toNumber(fromAmount), toNumber(fromToken.decimals)).toString())
        const { path, call } = API_paths['swap']
        const params = {
            fromChainId: fromNetwork.chainId,
            toChainId: USDC_BASE[0].chainId,//'137', //
            fromTokenAddress: fromToken.tokenContractAddress,
            toTokenAddress: USDC_BASE[1].tokenContractAddress, //'0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', //
            amount: toDecimals(toNumber(fromAmount), toNumber(fromToken.decimals)).toString(),
            slippage: '0.015',
            userWalletAddress: wallets[0].address,
        }
        let res = await sendGetRequest(path, params)
            .then(async res => {
                if (res.code === '50011') {
                    void wait(1000)
                    void handleSwap()
                } else if (res.code === '0') {
                    console.log('res', res)
                    const data = res.data[0].tx
                    console.log('DATATATTA', data)
                    const txRequest = {
                        gas: toHex(toNumber(data.gasLimit)),
                        gasPrice: toHex(toNumber(data.gasPrice)),
                        from: data.from,
                        to: data.to,
                        data: data.data,
                        value: toHex(toNumber(data.value)),
                    }
                    console.log('txRequest', txRequest)
                    await provider
                        .request({
                            method: 'eth_sendTransaction',
                            params: [txRequest],
                        })
                        .then(res => {
                            console.log('res', res)
                            setReloadHistory(true)
                            return res
                        })
                        .catch(err => {
                            console.log('err', err)
                        })
                } else {
                    console.log('error', res.msg)
                    handleErrors(res);
                    toast.error(res?.msg)
                }
            })
            .catch(err => {
                console.log('err', err)
                toast.error(err?.msg)
            })
    }

    // FETCH TXN HISTORY OF WALLET ADDRESS
    const fetchTxnHistory = async () => {
        // console.log('txHistory', txHistory)
        const { path, call } = API_paths['history']
        const params = {
            address: wallets[0].address,
            chains: [fromNetwork.chainId],
        }
        // FETCH TXN HISTORY FROM OKX
        const res = await fetch(`/api/cross-swap`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        })
        const data = await res.json();
        const txns = data.data[0].transactionList?.filter(txn => txn.txStatus === "success" && txn.itype === "2").map((txn) => txn);
        console.log('txns', txns)
        setTransactionHistory(txns);
        return txns;
    }

    // TEMP NOT USED
    const fetchOrders = async () => {
        await getOKXAccount(wallets[0].address).then(async (accountId) => {
            console.log('IIDDDD', accountId)
            const { path, call } = API_paths['orders'];
            const params = {
                accountId: accountId,
                widgetVersion: 1
            }
            await sendGetRequest(path, params).then(res => {
                console.log('orders', res)
            })

        })
    }

    const handleHistory = () => {
        setIsHistoryOpen(true)
    }

    const filteredTokens = fetchedTokens.filter(token => {
        const matchesNetwork = selectedNetwork === 'all' || fromNetwork.chainId === selectedNetwork
        const matchesSearch =
            token.tokenSymbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            token.tokenName.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesNetwork && matchesSearch
    })

    return (
        <div className='relative min-h-screen overflow-y-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
            {/* Main Content Area */}
            <div className='mx-auto w-full max-w-md space-y-4 overflow-y-scroll p-1 pb-24 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                {/* Token Selection Sheet */}
                <Sheet open={isSelectOpen} onOpenChange={setIsSelectOpen}>
                    <SheetContent
                        ref={sheetRef}
                        side='bottom'
                        className='h-[85vh] touch-none rounded-t-[24px] p-4'
                        style={{
                            transform: 'translateY(0)',
                            transition: 'transform 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
                        }}>
                        <div
                            className='absolute left-1/2 top-2.5 h-1.5 w-12 -translate-x-1/2 cursor-grab touch-none rounded-full bg-gray-300 active:cursor-grabbing'
                            onPointerDown={handleDragStart}
                            onPointerMove={handleDrag}
                            onPointerUp={handleDragEnd}
                            onPointerCancel={handleDragEnd}
                            role='button'
                            aria-label='Drag to close'
                        />
                        <SheetHeader className='flex flex-row items-center justify-between pt-4'>
                            <SheetTitle className='text-[18px] font-bold'>Select bridge token</SheetTitle>
                            <button
                                onClick={() => setIsSelectOpen(false)}
                                className='absolute right-6 top-4 text-gray-500 hover:text-gray-700'>
                                <X className='size-6' />
                            </button>
                        </SheetHeader>
                        <div className='mt-6'>
                            <div className='relative flex h-[42px] items-center'>
                                <Search className='absolute left-3 z-10 h-5 w-5 text-gray-400' />
                                <Input
                                    placeholder='Search'
                                    className='h-[42px] w-full rounded-full border-gray-200 pl-10'
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Network Selection */}
                        <div className='mt-6'>
                            <div className='mb-4 text-[12px] font-bold text-black'>
                                Select network: {selectedNetwork !== 'all' ? fromNetwork.chainName : 'All'}
                            </div>
                            <div className='relative -mx-6'>
                                <div className='flex gap-2 overflow-x-scroll px-6 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                                    <Button
                                        variant={selectedNetwork === 'all' ? 'outline' : 'ghost'}
                                        onClick={() => setSelectedNetwork('all')}
                                        className={`flex h-[44px] min-w-[54px] shrink-0 items-center justify-center rounded-[6px] border border-solid ${
                                            selectedNetwork === 'all' ? 'border-black' : 'border-[#E1E1E1]'
                                        } p-0`}>
                                        <div className='text-sm font-medium'>All</div>
                                    </Button>
                                    {fetchedNetworks.map(network => {
                                        const networkKey = (() => {
                                            const name = network.chainName?.toLowerCase().replace(/\s+/g, '')
                                            // Special cases mapping
                                            switch (name) {
                                                case 'avalanchecchain':
                                                case 'avalanchec':
                                                    return 'avalanche'
                                                case 'ethereummainnet':
                                                case 'ethereum':
                                                    return 'eth'
                                                case 'bnbsmartchain':
                                                case 'bnbchain':
                                                    return 'binance'
                                                case 'xlayer':
                                                    return 'okbwebp'
                                                default:
                                                    return name
                                            }
                                        })()
                                        const hasIcon = [
                                            'arbitrum',
                                            'avalanche',
                                            'base',
                                            'binance',
                                            'eth',
                                            'linea',
                                            'okb',
                                            'optimism',
                                            'polygon',
                                            'scroll',
                                            'solana',
                                            'tron',
                                            'zksyncera',
                                        ].includes(networkKey)

                                        return (
                                            <Button
                                                key={network.chainId}
                                                variant={selectedNetwork === network.chainId ? 'outline' : 'ghost'}
                                                onClick={() => {
                                                    setSelectedNetwork(network.chainId)
                                                    setFromNetwork(network)
                                                }}
                                                className={`flex h-[44px] min-w-[54px] shrink-0 items-center justify-center rounded-[6px] border border-solid ${
                                                    selectedNetwork === network.chainId
                                                        ? 'border-black'
                                                        : 'border-[#E1E1E1]'
                                                } p-0`}>
                                                {hasIcon ? (
                                                    <Image
                                                        src={`/chain-icons/${networkKey}.webp`}
                                                        alt={network.chainName}
                                                        width={24}
                                                        height={24}
                                                        className='h-6 w-6'
                                                    />
                                                ) : (
                                                    <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-sm font-medium'>
                                                        {network.chainName?.[0] || '?'}
                                                    </div>
                                                )}
                                            </Button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Token List */}
                        <div className='mt-[24px] flex-1 overflow-hidden'>
                            <div className='mb-2 text-[12px] font-bold text-black'>Select Token</div>
                            <div className='h-[calc(100vh-360px)] space-y-2 overflow-y-auto pr-1'>
                                {filteredTokens.map(token => (
                                    <button
                                        key={token.tokenSymbol}
                                        onClick={() => {
                                            setFromToken(token)
                                            setIsSelectOpen(false)
                                        }}
                                        className='flex w-full items-center justify-between rounded-2xl px-2 pt-4 transition-colors hover:bg-gray-50'>
                                        <div className='flex items-center gap-3'>
                                            <div className='h-9 w-9 overflow-hidden rounded-full bg-gray-100'>
                                                <Image
                                                    src={token.tokenLogoUrl || '/placeholder.svg'}
                                                    alt={token.tokenName}
                                                    width={36}
                                                    height={36}
                                                    className='h-full w-full object-cover'
                                                />
                                            </div>
                                            <div className='flex flex-col items-start'>
                                                <span className='font-semibold'>{token.tokenSymbol}</span>
                                                <span className='text-sm text-gray-500'>{token.tokenName}</span>
                                            </div>
                                        </div>
                                        <div className='flex flex-col items-end'>
                                            <span className='font-semibold'>0</span>
                                            <span className='text-sm text-gray-500'>$0.00</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Main Swap Container */}
                <div className='detail_card mx-auto w-full rounded-[24px]'>
                    {/* From Section */}
                    <div className='rounded-t-[24px] bg-[#f4f4f4] p-4'>
                        <div className='mb-6 flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <span className='text-sm text-[#8f8f8f]'>From</span>
                                <button
                                    onClick={() => setIsSelectOpen(true)}
                                    className='flex items-center gap-1 text-[#383838]'>
                                    {(() => {
                                        const networkKey = (() => {
                                            const name = fromNetwork.chainName?.toLowerCase().replace(/\s+/g, '')
                                            switch (name) {
                                                case 'avalanchecchain':
                                                case 'avalanchec':
                                                    return 'avalanche'
                                                case 'ethereummainnet':
                                                case 'ethereum':
                                                    return 'eth'
                                                case 'bnbsmartchain':
                                                case 'bnbchain':
                                                    return 'binance'
                                                case 'xlayer':
                                                    return 'okb'
                                                default:
                                                    return name
                                            }
                                        })()
                                        const hasIcon = [
                                            'arbitrum',
                                            'avalanche',
                                            'base',
                                            'binance',
                                            'eth',
                                            'linea',
                                            'okb',
                                            'optimism',
                                            'polygon',
                                            'scroll',
                                            'solana',
                                            'tron',
                                            'zksyncera',
                                        ].includes(networkKey)

                                        return hasIcon ? (
                                            <Image
                                                src={`/chain-icons/${networkKey}.webp`}
                                                alt={fromNetwork.chainName}
                                                width={16}
                                                height={16}
                                                className='h-4 w-4'
                                            />
                                        ) : (
                                            <div className='h-4 w-4 rounded-full bg-[#d9d9d9]'>
                                                {fromNetwork.chainName?.[0] || '?'}
                                            </div>
                                        )
                                    })()}
                                    <span className='text-sm'>{fromNetwork.chainName}</span>
                                </button>
                            </div>
                            <div className='flex items-center gap-1 text-sm'>
                                <span className='text-[#383838]'>0.0042</span>
                                <button className='text-[#5977ee]'>Max</button>
                            </div>
                        </div>
                        <div className='flex items-center justify-between'>
                            <button onClick={() => setIsSelectOpen(true)} className='flex items-center gap-2'>
                                <div className='h-8 w-8 overflow-hidden rounded-xl bg-[#d9d9d9]'>
                                    <Image
                                        src={fromToken.tokenLogoUrl || '/placeholder.svg'}
                                        alt={fromToken.tokenName}
                                        width={32}
                                        height={32}
                                        className='h-full w-full object-cover'
                                    />
                                </div>
                                <span className='text-xl font-bold'>{fromToken.tokenSymbol}</span>
                                <ChevronDown className='ml-1 h-5 w-5 text-[#8f8f8f]' />
                            </button>
                            <input
                                type='number'
                                value={fromAmount}
                                onChange={e => {
                                    const value = e.target.value
                                    setFromAmount(value)
                                }}
                                onFocus={e => {
                                    // Move caret to the end
                                    const val = e.target.value
                                    e.target.value = ''
                                    e.target.value = val
                                }}
                                className={`w-32 bg-transparent text-right text-2xl font-bold outline-none ${
                                    fromAmount && Number(fromAmount) !== 0 ? 'text-black' : 'text-[#b3b3b3]'
                                }`}
                                placeholder='0.0'
                            />
                        </div>
                    </div>

                    {/* To Section */}
                    <div className='rounded-b-[24px] border-t border-[#f0f0f0] bg-white p-4'>
                        <div className='mb-6 flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <span className='text-sm text-[#8f8f8f]'>To</span>
                                <div className='flex items-center gap-1 text-[#383838]'>
                                    <Image src='/Subtract.svg' alt='Base' width={16} height={16} className='h-4 w-4' />
                                    <span className='text-sm'>BASE - Pool Wallet</span>
                                </div>
                            </div>
                            <span className='text-sm text-[#383838]'>Receiving</span>
                        </div>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <div className='h-8 w-8 overflow-hidden rounded-xl'>
                                    <Image
                                        src={USDC_BASE[1].tokenLogoUrl || '/placeholder.svg'}
                                        alt='USDC'
                                        width={32}
                                        height={32}
                                        className='h-full w-full object-cover'
                                    />
                                </div>
                                <span className='text-xl font-bold'>USDC</span>
                            </div>
                            <span
                                className={`text-2xl font-bold ${
                                    recievedAmount && Number(recievedAmount) !== 0 ? 'text-black' : 'text-[#b3b3b3]'
                                }`}>
                                {recievedAmount}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bridge Info Card */}
                {Object.keys(routerInfo).length !== 0 && <BridgeInfoCard bridgeInfo={routerInfo} />}
            </div>

            {/* Fixed Button at Bottom */}
            <div className='fixed bottom-0 left-0 right-0 bg-white p-4'>
                <div className='mx-auto max-w-md'>
                    <button
                        onClick={ifApproved ? handleSwap : handleApproveBridge}
                        className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                        {ifApproved ? 'Bridge' : 'Approve'}
                    </button>
                    <button
                        onClick={handleHistory}//{fetchTxnHistory fetchOrders}
                        disabled={successfulTransactions.length === 0} // ✅ Disable if no successful transactions
                        className={`h-[46px] w-full rounded-[2rem] px-6 py-[11px] text-center text-base font-semibold leading-normal
                            ${successfulTransactions.length === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[#f4f4f4] text-[#383838]"}`}>                        Transaction History
                    </button>
                    <TransactionHistory isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} transactions={successfulTransactions} networks={fetchedNetworks} tokens={fetchedTokens} />
                </div>
            </div>
        </div>
    )
}

export default CrossChainSwapSection
