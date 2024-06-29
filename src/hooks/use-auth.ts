import { usePrivy } from '@privy-io/react-auth'
import { useEffect, useState } from 'react'
import { getAuthStatus } from '@/lib/server/auth.action'
import { Address } from 'viem'

export function useAuth() {
    const { ready, authenticated } = usePrivy()
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        isAdmin: false,
        address: null as Address | null,
    })

    useEffect(() => {
        async function checkAuthStatus() {
            if (ready && authenticated) {
                const status = await getAuthStatus()
                setAuthState({
                    isAuthenticated: status.isAuthenticated,
                    isAdmin: status.isAdmin,
                    address: status.address,
                })
            }
        }

        checkAuthStatus()
    }, [ready, authenticated])

    return authState
}
