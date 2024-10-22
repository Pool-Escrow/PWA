import React, { useRef, useEffect } from 'react'
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from '@/app/_components/ui/command'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/tailwind'
import { City } from '@/lib/utils/cities'

type ComboboxContentProps = {
    searchTerm: string
    setSearchTerm: (term: string) => void
    filteredCities: City[]
    handleChange: (value: string, countryCode: string) => void
    setOpen: (open: boolean) => void
    value: string
    isMobile: boolean
    isSearching: boolean
}

export function ComboboxContent({
    searchTerm,
    setSearchTerm,
    filteredCities,
    handleChange,
    setOpen,
    value,
    isMobile,
    isSearching,
}: ComboboxContentProps) {
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }, [])

    return (
        <Command className={cn(isMobile && 'h-[calc(100vh-10rem)]')}>
            <CommandInput
                ref={inputRef}
                placeholder='Search city...'
                value={searchTerm}
                onValueChange={setSearchTerm}
            />
            <CommandList className={cn('max-h-[300px] overflow-y-auto', isMobile && 'max-h-[calc(100%-3rem)]')}>
                {isSearching ? (
                    <div className='flex items-center justify-center py-6'>
                        <Loader2 className='h-6 w-6 animate-spin text-gray-500' />
                    </div>
                ) : filteredCities.length === 0 ? (
                    <CommandEmpty>No city found.</CommandEmpty>
                ) : (
                    <CommandGroup heading='Suggestions'>
                        {filteredCities.map(city => (
                            <CommandItem
                                key={city.value}
                                value={city.value}
                                onSelect={() => {
                                    handleChange(city.label, city.countryCode)
                                    setOpen(false)
                                    setSearchTerm('')
                                }}>
                                <Check
                                    className={cn('mr-2 h-4 w-4', value === city.value ? 'opacity-100' : 'opacity-0')}
                                />
                                {city.label} ({city.countryCode})
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </Command>
    )
}
