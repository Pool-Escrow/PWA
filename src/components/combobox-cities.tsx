import React, { useState, useCallback, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/app/_components/ui/popover'
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription, DrawerTrigger } from '@/app/_components/ui/drawer'
import { Button } from '@/app/_components/ui/button'
import useMediaQuery from '@/app/_client/hooks/use-media-query'
import { allCities } from '@/lib/utils/cities'
import { ComboboxContent } from './combobox-content'
import { useCitySearch } from '@/hooks/use-city-search'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import locationTimezone from 'node-location-timezone'

type ComboboxCitiesProps = {
    value: string
    onChangeId: string
    onCityChange: (city: string, countryCode: string, timezone: string) => void
}

export function ComboboxCities({ value, onChangeId, onCityChange }: ComboboxCitiesProps) {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const isDesktop = useMediaQuery('(min-width: 768px)')
    const [selectedValue, setSelectedValue] = useState(value)
    const [selectedCityObject, setSelectedCityObject] = useState<(typeof allCities)[0] | null>(null)
    const [keyboardHeight, setKeyboardHeight] = useState(0)

    const { results: filteredCities, isSearching } = useCitySearch(searchTerm)

    const handleKeyboardChange = useCallback((height: number) => {
        console.log('Keyboard height changed:', height)
        setKeyboardHeight(height)
    }, [])

    useEffect(() => {
        if (!selectedValue) {
            const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
            const [continent, cityName] = userTimezone.split('/')
            const locations = locationTimezone.findLocationsByCountryName(cityName, true)
            const defaultCityLocation = locations.find(loc => loc.timezone === userTimezone)

            if (defaultCityLocation) {
                const defaultCityValue = `${defaultCityLocation.city}-${defaultCityLocation.country.iso2}`
                setSelectedValue(defaultCityValue)
                handleChange(defaultCityLocation.city, defaultCityLocation.country.iso2)

                // Set the selectedCityObject based on the default location
                const cityObject = allCities.find(
                    city =>
                        city.value.toLowerCase() === defaultCityLocation.city.toLowerCase() &&
                        city.countryCode === defaultCityLocation.country.iso2,
                )
                setSelectedCityObject(cityObject || null)
            }
        } else {
            // If there's an initial value, set the selectedCityObject
            const cityObject = allCities.find(city => `${city.value}-${city.countryCode}` === selectedValue)
            setSelectedCityObject(cityObject || null)
        }
    }, [])

    const handleChange = useCallback(
        (newValue: string, countryCode: string) => {
            if (typeof window !== 'undefined') {
                const locations = locationTimezone.findLocationsByCountryIso(countryCode)
                const cityLocation = locations.find(loc => loc.city.toLowerCase() === newValue.toLowerCase())
                if (cityLocation) {
                    const timezone = cityLocation.timezone
                    console.log(`Selected city: ${newValue} (${countryCode}), Timezone: ${timezone}`)
                    onCityChange(newValue, countryCode, timezone)
                    window.dispatchEvent(
                        new CustomEvent(onChangeId, { detail: { city: newValue, countryCode, timezone } }),
                    )
                } else {
                    console.error(`Location not found for city: ${newValue} in country: ${countryCode}`)
                }
            }
            setSearchTerm('')
            setOpen(false)

            // Update both selectedValue and selectedCityObject
            const newSelectedValue = `${newValue}-${countryCode}`
            setSelectedValue(newSelectedValue)

            const newCityObject = allCities.find(
                city => city.value.toLowerCase() === newValue.toLowerCase() && city.countryCode === countryCode,
            )
            setSelectedCityObject(newCityObject || null)
        },
        [onChangeId, onCityChange],
    )

    const buttonContent = selectedCityObject
        ? `${selectedCityObject.label} (${selectedCityObject.countryCode})`
        : selectedValue
          ? selectedValue.split('-').join(' (') + ')'
          : 'Select city...'

    const ComboboxButton = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof Button>>(
        (props, ref) => (
            <Button
                ref={ref}
                variant='outline'
                role='combobox'
                aria-expanded={open}
                className='relative h-[38px] w-full justify-between rounded-[70px] border border-[#ebebeb] pr-6 text-sm font-normal leading-tight text-black'
                {...props}>
                {buttonContent}
                <span className='ml-2 h-4 w-4 shrink-0 opacity-50' />
            </Button>
        ),
    )
    ComboboxButton.displayName = 'ComboboxButton'

    const ComboboxShell: React.FC<React.PropsWithChildren> = ({ children }) => (
        <>
            {children}
            <ComboboxContent
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filteredCities={filteredCities}
                handleChange={handleChange}
                setOpen={setOpen}
                value={selectedValue}
                isMobile={!isDesktop}
                isSearching={isSearching}
                onKeyboardChange={handleKeyboardChange}
            />
        </>
    )

    if (isDesktop) {
        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <ComboboxButton />
                </PopoverTrigger>
                <PopoverContent className='w-[200px] p-0'>
                    <ComboboxShell />
                </PopoverContent>
            </Popover>
        )
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <ComboboxButton />
            </DrawerTrigger>
            <DrawerContent
                className='bg-white'
                style={{
                    height: keyboardHeight ? `calc(100vh - ${keyboardHeight}px)` : '40vh',
                    transition: 'height 0.2s ease-out',
                    willChange: 'height',
                }}>
                <div className='mt-4 flex h-full flex-col border-t'>
                    <VisuallyHidden.Root>
                        <DrawerTitle>Search city</DrawerTitle>
                        <DrawerDescription>Set the city to find its timezone</DrawerDescription>
                    </VisuallyHidden.Root>
                    <ComboboxShell />
                </div>
            </DrawerContent>
        </Drawer>
    )
}
