import { getAccessToken, usePrivy } from '@privy-io/react-auth'
import Cookies from 'js-cookie'
import { useCallback, useEffect, useState } from 'react'

export function getTokenCookie(): string | undefined {
    return Cookies.get('token')
}

export function removeTokenCookie() {
    Cookies.remove('token')
}

export function useCookie() {
    const [isJwtValid, setIsJwtValid] = useState(false)
    const [currentJwt, setCurrentJwt] = useState<string | null>()

    const { ready, authenticated } = usePrivy()

    const saveJwt = useCallback((tokenString: string) => {
        setCurrentJwt(tokenString)
    }, [])

    const retrieveAccessToken = async () => {
        const token = await getAccessToken()
        setCurrentJwt(token)
    }

    useEffect(() => {
        if (ready && authenticated) {
            retrieveAccessToken()
        }
    }, [currentJwt, saveJwt, ready, authenticated])

    return { currentJwt, saveJwt, isJwtValid }
}
