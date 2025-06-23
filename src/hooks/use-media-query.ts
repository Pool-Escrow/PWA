import { useEffect, useState } from 'react'

const useMediaQuery = (query: string): boolean => {
    const [matches, setMatches] = useState<boolean>(false)
    const [isClient, setIsClient] = useState<boolean>(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        if (!isClient) return

        const mediaQuery = window.matchMedia(query)
        setMatches(mediaQuery.matches)

        const handler = (event: MediaQueryListEvent) => setMatches(event.matches)
        mediaQuery.addEventListener('change', handler)

        return () => mediaQuery.removeEventListener('change', handler)
    }, [query, isClient])

    return isClient ? matches : false
}

export default useMediaQuery
