import type { City } from '@/lib/utils/cities'
import { allCities, commonCities, featuredCities } from '@/lib/utils/cities'
import Fuse from 'fuse.js'
import { useEffect, useMemo, useState } from 'react'

const fuse = new Fuse(allCities, {
    keys: ['label', 'country', 'countryCode'],
    threshold: 0.3,
})

function debounce<T extends (...args: string[]) => unknown>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

export function useCitySearch(searchTerm: string) {
    const [results, setResults] = useState<City[]>([...featuredCities, ...commonCities])
    const [isSearching, setIsSearching] = useState(false)

    const debouncedSearch = useMemo(
        () =>
            debounce((term: string) => {
                if (!term) {
                    setResults([...featuredCities, ...commonCities])
                    setIsSearching(false)
                } else {
                    const searchResults = fuse
                        .search(term)
                        .map(result => result.item)
                        .slice(0, 100)
                    // Use a Map to ensure uniqueness based on both city name and country code
                    const uniqueResults = Array.from(
                        new Map(searchResults.map(city => [`${city.label}-${city.countryCode}`, city])).values(),
                    )
                    setResults(uniqueResults)
                    setIsSearching(false)
                }
            }, 300),
        [],
    )

    useEffect(() => {
        setIsSearching(true)
        debouncedSearch(searchTerm)

        return () => {
            // Cambiar el .cancel() por una función vacía ya que nuestra implementación no necesita cancel
            // debouncedSearch.cancel()
        }
    }, [searchTerm, debouncedSearch])

    return { results, isSearching }
}
