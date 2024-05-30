import Cookies from 'js-cookie'
import { useState } from 'react'
import jwt from 'jsonwebtoken'
import { useEffect } from 'react'
import { getAccessToken, usePrivy } from '@privy-io/react-auth'

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

	const saveJwt = (tokenString: string) => {
		setCurrentJwt(tokenString)
	}

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
