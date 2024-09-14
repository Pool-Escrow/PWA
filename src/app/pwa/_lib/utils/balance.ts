export function formatBalance(balance?: bigint, decimals?: number): { integerPart: number; fractionalPart: number } {
    if (balance === 0n || !decimals) {
        return {
            integerPart: 0,
            fractionalPart: 0,
        }
    }

    const balanceString = balance?.toString().padStart(decimals + 1, '0') || '0'
    const integerPart = parseInt(balanceString.slice(0, -decimals) || '0')
    const fractionalPart = parseInt(balanceString.slice(-decimals).padEnd(4, '0').slice(0, 4))

    return {
        integerPart,
        fractionalPart,
    }
}
