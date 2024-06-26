'use server'

import { cookies } from 'next/headers'
import { getWalletAddress, isAdmin } from '@/lib/server/auth'
import { Address } from 'viem'

export async function getAuthStatus(): Promise<{
    isAuthenticated: boolean
    isAdmin: boolean
    address: Address | null
}> {
    const cookieStore = cookies()
    const privyAuthToken = cookieStore.get('privy-token')?.value

    if (!privyAuthToken) {
        return { isAuthenticated: false, isAdmin: false, address: null }
    }

    try {
        const walletAddress = await getWalletAddress(privyAuthToken)

        if (!walletAddress) {
            return { isAuthenticated: false, isAdmin: false, address: null }
        }

        const adminStatus = await isAdmin(walletAddress)

        return {
            isAuthenticated: true,
            isAdmin: adminStatus,
            address: walletAddress,
        }
    } catch (error) {
        console.error('Error getting auth status:', error)
        return { isAuthenticated: false, isAdmin: false, address: null }
    }
}
