import * as ct from 'countries-and-timezones'

type CTTimezone = {
    name: string
    countries: string[]
}

export interface Location {
    city: string
    timezone: string
    country: {
        iso2: string
        name: string
    }
}

// Build an in-memory catalogue of locations once at module load.
const locations: Location[] = (() => {
    const tzData = ct.getAllTimezones()
    const tmp: Location[] = []

    // Iterate over every IANA timezone entry
    Object.values(tzData as Record<string, CTTimezone>).forEach((tz: CTTimezone) => {
        const [, citySlug] = tz.name.split('/')
        // Skip timezones without a city component, e.g. "UTC"
        if (!citySlug) return

        const city = citySlug.replace(/_/g, ' ')

        tz.countries.forEach((countryIso: string) => {
            const country = ct.getCountry(countryIso)
            tmp.push({
                city,
                timezone: tz.name,
                country: {
                    iso2: countryIso,
                    name: country?.name ?? countryIso,
                },
            })
        })
    })

    return tmp
})()

export function getLocations(): Location[] {
    return locations
}

export function findLocationsByCountryName(cityName: string, ignoreCase = true): Location[] {
    if (!cityName) return []
    const target = ignoreCase ? cityName.toLowerCase() : cityName
    return locations.filter(loc => (ignoreCase ? loc.city.toLowerCase() === target : loc.city === target))
}

export function findLocationsByCountryIso(countryIso: string): Location[] {
    if (!countryIso) return []
    const iso = countryIso.toUpperCase()
    return locations.filter(loc => loc.country.iso2 === iso)
}

const locationTimezone = {
    getLocations,
    findLocationsByCountryName,
    findLocationsByCountryIso,
}

export default locationTimezone
