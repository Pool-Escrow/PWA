import { formatUnits } from 'viem'

export function formatBalance(
    balance: bigint | { __type: 'bigint'; value: string },
    decimals = 18,
): { integerPart: number; fractionalPart: number } {
    let bigintValue: bigint
    if (typeof balance === 'object' && balance.__type === 'bigint') {
        bigintValue = BigInt(balance.value)
    } else if (typeof balance === 'bigint') {
        bigintValue = balance
    } else {
        console.log('[utils/balance] invalid balance type')
        return { integerPart: 0, fractionalPart: 0 }
    }

    const formatted = formatUnits(bigintValue, decimals)
    const [integerStr, fractionalStr = ''] = formatted.split('.')

    const result = {
        integerPart: parseInt(integerStr, 10),
        fractionalPart: parseInt(fractionalStr.padEnd(2, '0').slice(0, 2), 10),
    }

    return result
}
