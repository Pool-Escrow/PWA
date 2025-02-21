'use client'

import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { base } from 'wagmi/chains'
import type { Address } from 'viem'
import { useReadContract, useChainId } from 'wagmi'
import { dropletTokenAbi } from '@/types/droplet'

const TOKEN_ADDRESS_TEST = '0xc9e3a0b2d65cbb151fa149608f99791543290d6d' as Address
const TOKEN_ADDRESS_MAIN = '0xd8a698486782d0d3fa336C0F8dd7856196C97616' as Address

const TOKENS_MAP = {
    84532: TOKEN_ADDRESS_TEST,
    8453: TOKEN_ADDRESS_MAIN
}

export default function ClaimButton() {
    const { user } = usePrivy()
    const chainId = useChainId()
    const address  = user?.wallet?.address as Address
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const { data: tokenBalance, isLoading, isError, error } = useReadContract({
        address: TOKENS_MAP[chainId as keyof typeof TOKENS_MAP],
        abi: dropletTokenAbi,
        functionName: 'balanceOf',
        args: address ? [address] : undefined, 
    })

    console.log(`[ClaimButton] error gettign balance? ${isError}`, error)
    console.log(`[ClaimButton] tokenBalance`, tokenBalance?.toString())

    async function handleSubmitClaim() {
        if (!address) {
            setMessage('No wallet connected')
            return
        }

        setLoading(true)
        setMessage('Minting...')

        try {
            const response = await fetch('/api/mint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address }),
            })
            const data = await response.json()

            if (data.success) {
                setMessage(`Success! Tx Hash: ${data.txHash}`)
            } else {
                console.log('Error', data.error)
                setMessage(`Error: ${data.error}`)
            }
        } catch (error) {
            setMessage('Minting failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {!isLoading && !Number(tokenBalance) && (
                <div onClick={handleSubmitClaim} className='cursor-pointer mt-5 w-full inline-flex w-fit items-center gap-2 rounded-full bg-[#4078F4] hover:bg-[#5A94FF] transition-colors px-4 py-4 justify-center'>
                    <svg width='24' height='24' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path
                            d='M5.735 1.10967C5.80531 1.03944 5.90062 1 6 1C6.09938 1 6.19469 1.03944 6.265 1.10967C6.4665 1.31117 7.2645 2.17317 8.0145 3.29067C8.7545 4.39217 9.5 5.81717 9.5 7.12467C9.5 8.38667 9.127 9.36417 8.478 10.0277C7.8295 10.6897 6.9445 10.9997 6 10.9997C5.055 10.9997 4.1705 10.6902 3.522 10.0277C2.873 9.36417 2.5 8.38667 2.5 7.12467C2.5 5.81717 3.246 4.39217 3.9855 3.29067C4.7355 2.17317 5.5335 1.31067 5.735 1.10967Z'
                            fill='white'
                        />
                    </svg>
                    <span className='text-[16px] text-white'>
                        {loading ? 'Minting...' : 'Claim Tokens'}
                    </span>
                </div>
            )}
        </>
    )
}
