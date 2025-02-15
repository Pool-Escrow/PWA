export interface Explorer {
    name: string
    url: string
    standard: string
}

export interface NativeCurrency {
    name: string
    symbol: string
    decimals: number
}

export interface Chain {
    name: string
    chain: string
    rpc: string[]
    faucets: string[]
    nativeCurrency: NativeCurrency
    infoURL: string
    shortName: string
    chainId: number
    networkId: number
    slip44?: number
    status?: string
    explorers?: Explorer[]
}

// Si necesitas el tipo para el array completo
export interface ChainsData {
    chains: Chain[]
}
