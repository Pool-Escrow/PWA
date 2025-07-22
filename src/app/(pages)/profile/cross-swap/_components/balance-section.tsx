'use client'

import Container from '@/app/(pages)/profile/claim-winning/_components/container'
import SectionContent from '@/app/(pages)/profile/claim-winning/_components/section-content'
import { tokenAddress } from '@/types/contracts'
import { useWallets } from '@privy-io/react-auth'
import type { Address } from 'viem'
import { useBalance, useChainId } from 'wagmi'

export default function ProfileBalanceSection() {
    const { wallets } = useWallets()
    const chainId = useChainId()

    // Get chain-specific token address
    const currentTokenAddress = tokenAddress[chainId as keyof typeof tokenAddress] as Address

    // Get wallet address safely
    const walletAddress = wallets[0]?.address as Address

    // Only proceed with balance query if we have valid prerequisites
    const canFetchBalance = Boolean(walletAddress && currentTokenAddress)

    // Debug log for USDC balance request - only when we actually make the request
    if (process.env.NODE_ENV === 'development' && canFetchBalance) {
        console.log('[DEBUG][CrossSwapBalanceSection] useBalance USDC', {
            address: walletAddress,
            token: currentTokenAddress,
            chainId,
            stack: new Error().stack?.split('\n').slice(1, 3).join(' | '),
            timestamp: new Date().toISOString(),
        })
    }

    const { data: tokenBalanceData } = useBalance({
        address: walletAddress,
        token: currentTokenAddress,
        query: {
            staleTime: 60_000, // Consider data fresh for 1 minute
            gcTime: 300_000, // Keep in cache for 5 minutes
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchInterval: false, // ✅ DISABLED automatic polling to prevent excessive requests
            enabled: canFetchBalance,
        },
    })

    const decimals = BigInt(tokenBalanceData?.decimals ?? BigInt(18))
    const tokenBalance = ((tokenBalanceData?.value ?? BigInt(0)) / BigInt(10) ** decimals).toString()

    return (
        <Container>
            <SectionContent>
                <div className='mx-2 flex flex-col justify-center'>
                    <h3 className='text-[11pt] font-semibold text-black'>Total Balance</h3>
                    <h3 className='text-[36pt] font-bold text-[#4078FA]'>
                        <span>{'$' + tokenBalance + ` `}</span>
                        <span className='text-[14pt]'>USDC</span>
                    </h3>
                </div>
            </SectionContent>
        </Container>
    )
}
