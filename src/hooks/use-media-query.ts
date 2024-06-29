import { useState, useEffect } from 'react'

const useMediaQuery = (query: string): boolean => {
	const [matches, setMatches] = useState<boolean>(false)

	useEffect(() => {
		const mediaQuery = window.matchMedia(query)
		setMatches(mediaQuery.matches)

		const handler = (event: MediaQueryListEvent) => setMatches(event.matches)
		mediaQuery.addEventListener('change', handler)

		return () => mediaQuery.removeEventListener('change', handler)
	}, [query])

	return matches
}

export default useMediaQuery
