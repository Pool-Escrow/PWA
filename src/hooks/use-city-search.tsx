import { useState, useEffect, useMemo } from 'react'
import { debounce } from 'lodash'
import Fuse from 'fuse.js'
import { allCities, commonCities, featuredCities, City } from '@/lib/utils/cities'

const fuse = new Fuse(allCities, {
    keys: ['label', 'country', 'countryCode'],
    threshold: 0.3,
})

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
            debouncedSearch.cancel()
        }
    }, [searchTerm, debouncedSearch])

    return { results, isSearching }
}
