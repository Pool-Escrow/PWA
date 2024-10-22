import locationTimezone from 'node-location-timezone'

export type City = {
    value: string
    label: string
    country: string
    countryCode: string
}

export const featuredCities: City[] = [
    { value: 'Bangkok', label: 'Bangkok', country: 'Thailand', countryCode: 'TH' },
    { value: 'Chiang Mai', label: 'Chiang Mai', country: 'Thailand', countryCode: 'TH' },
]

export const commonCities: City[] = [
    { value: 'San Francisco', label: 'San Francisco', country: 'United States', countryCode: 'US' },
    { value: 'Paris', label: 'Paris', country: 'France', countryCode: 'FR' },
    { value: 'Singapore', label: 'Singapore', country: 'Singapore', countryCode: 'SG' },
    { value: 'Hong Kong', label: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK' },
]

export const allCities: City[] = locationTimezone
    .getLocations()
    .map(location => ({
        value: `${location.city}-${location.country.iso2}`,
        label: location.city,
        country: location.country.name,
        countryCode: location.country.iso2,
    }))
    .filter((city, index, self) => index === self.findIndex(t => t.value === city.value))
