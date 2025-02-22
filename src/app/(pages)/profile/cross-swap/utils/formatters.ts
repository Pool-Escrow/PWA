import type { OKXNetwork, OKXToken } from '../types'

export function formatCurrency(value: number, decimals = 6): string {
    if (isNaN(value)) return '0.00'

    // Si el valor es muy pequeño, usa notación científica
    if (value < 0.000001) {
        return value.toExponential(2)
    }

    // Para otros valores, usa formato decimal normal
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: decimals,
    }).format(value)
}

export function formatTime(seconds: number): string {
    if (seconds < 60) {
        return `${seconds} seconds`
    }
    if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60)
        return `${minutes} minute${minutes > 1 ? 's' : ''}`
    }
    const hours = Math.floor(seconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''}`
}

export function toDecimals(value: number, decimals: number): string {
    return (value * Math.pow(10, decimals)).toString()
}

export function toWholeNumber(value: string, decimals: number): string {
    return (Number(value) / Math.pow(10, decimals)).toString()
}

export const tokenAddressToName = (tokenAddress: string, tokens: OKXToken[]) => {
    const token = tokens.find(token => token.tokenContractAddress === tokenAddress)
    return token?.tokenSymbol
}

export const tokenAddressToLogo = (tokenAddress: string, tokens: OKXToken[]) => {
    const token = tokens.find(token => token.tokenContractAddress === tokenAddress)
    return token?.tokenLogoUrl
}

export const chainIdToName = (chainId: string, chains: OKXNetwork[]) => {
    const chain = chains.find(chain => chain.chainId === chainId)
    return chain?.chainName
}
