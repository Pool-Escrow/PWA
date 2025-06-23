import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import type { City } from '@/lib/utils/cities'
import { cn } from '@/lib/utils/tailwind'
import { Check, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type ComboboxContentProps = {
    searchTerm: string
    setSearchTerm: (term: string) => void
    filteredCities: City[]
    handleChange: (value: string, countryCode: string) => void
    setOpen: (open: boolean) => void
    value: string
    isMobile: boolean
    isSearching: boolean
    onKeyboardChange?: (height: number) => void
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
    onKeyboardChange,
}: ComboboxContentProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [keyboardVisible, setKeyboardVisible] = useState(false)

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus()
        }

        if (typeof window !== 'undefined' && window.visualViewport) {
            const handleResize = () => {
                const viewport = window.visualViewport!
                const heightDiff = window.innerHeight - viewport.height
                const isKeyboardVisible = heightDiff > 150

                console.log('Viewport metrics:', {
                    viewportHeight: viewport.height,
                    windowHeight: window.innerHeight,
                    heightDiff,
                    isKeyboardVisible,
                })

                setKeyboardVisible(isKeyboardVisible)
                onKeyboardChange?.(isKeyboardVisible ? heightDiff : 0)
            }

            window.visualViewport.addEventListener('resize', handleResize)
            handleResize() // Initial check
            return () => window.visualViewport?.removeEventListener('resize', handleResize)
        }
    }, [onKeyboardChange])

    return (
        <Command className={cn('flex h-full flex-col', isMobile && 'h-full')}>
            <CommandInput
                ref={inputRef}
                placeholder='Search city...'
                value={searchTerm}
                onValueChange={setSearchTerm}
                className='sticky top-0 z-10 bg-white'
                onFocus={() => console.log('CommandInput focused')}
                onBlur={() => console.log('CommandInput blurred')}
            />
            <div className='px-2 py-1 text-xs text-gray-500'>
                {keyboardVisible ? 'Keyboard is visible' : 'Keyboard is hidden'}
            </div>
            <CommandList className={cn('flex-1 overflow-y-auto px-1', isMobile && 'h-full')}>
                {isSearching ? (
                    <div className='flex items-center justify-center py-6'>
                        <Loader2 className='size-6 animate-spin text-gray-500' />
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
