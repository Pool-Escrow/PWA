import NumberTicker from '@/app/pwa/_components/ui/number-ticker'

export default function FormattedBalance({
    integerPart,
    fractionalPart,
    symbol,
}: {
    integerPart: number
    fractionalPart: number
    symbol: string
}) {
    return (
        <>
            <span>
                <span className='text-4xl'>$</span>
                <NumberTicker value={integerPart} className='text-4xl' />
                <span>.</span>
                <NumberTicker value={fractionalPart} className='text-2xl' padding={2} />
            </span>
            <span className='ml-2 text-sm'>{symbol}</span>
        </>
    )
}
