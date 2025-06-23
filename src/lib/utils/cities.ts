import type { Location } from '@/lib/utils/location-timezone'
import { getLocations } from '@/lib/utils/location-timezone'

export type City = {
    value: string
    label: string
    country: string
    countryCode: string
}

export const featuredCities: City[] = [
    { value: 'Cannes', label: 'Cannes', country: 'France', countryCode: 'FR' },
    { value: 'New York', label: 'New York', country: 'United States', countryCode: 'US' },
    { value: 'Bangkok', label: 'Bangkok', country: 'Thailand', countryCode: 'TH' },
    { value: 'Taipei', label: 'Taipei', country: 'Taiwan', countryCode: 'TW' },
]

export const commonCities: City[] = [
    { value: 'San Francisco', label: 'San Francisco', country: 'United States', countryCode: 'US' },
    { value: 'Paris', label: 'Paris', country: 'France', countryCode: 'FR' },
    { value: 'Singapore', label: 'Singapore', country: 'Singapore', countryCode: 'SG' },
    { value: 'Hong Kong', label: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK' },
]

export const allCities: City[] = getLocations()
    .map((location: Location) => ({
        value: `${location.city}-${location.country.iso2}`,
        label: location.city,
        country: location.country.name,
        countryCode: location.country.iso2,
    }))
    .filter((city: City, index: number, self: City[]) => index === self.findIndex((t: City) => t.value === city.value))
