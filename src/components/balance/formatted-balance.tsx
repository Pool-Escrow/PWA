import NumberTicker from '@/components/ui/number-ticker'
import { cn } from '@/lib/utils/tailwind'

export default function FormattedBalance({
    integerPart,
    fractionalPart,
    symbol = '',
    size = 'default',
    showCurrencySymbol = true,
    icon: Icon,
}: {
    integerPart: number
    fractionalPart: number
    symbol?: string
    size?: 'default' | 'small'
    showCurrencySymbol?: boolean
    icon?: React.ReactNode
}) {
    const integerSize = size === 'default' ? 'text-4xl' : 'text-sm'
    const fractionalSize = size === 'default' ? 'text-2xl' : 'text-xs'
    const symbolSize = size === 'default' ? 'text-sm' : 'text-xs'
    const dollarSize = size === 'default' ? 'text-4xl' : 'text-sm'

    return (
        <span className='inline-flex items-baseline'>
            {Icon && <span className='mr-2'>{Icon}</span>}
            {showCurrencySymbol && <span className={dollarSize}>$</span>}
            <NumberTicker value={integerPart} className={integerSize} />
            <span>.</span>
            <NumberTicker value={fractionalPart} className={fractionalSize} padding={2} />
            <span className={cn(size === 'default' ? 'ml-2' : 'ml-1', symbolSize)}>{symbol}</span>
        </span>
    )
}
