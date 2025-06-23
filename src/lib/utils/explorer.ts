import { explorerUrl } from '@/server/blockchain/server-config'

export const openEtherscanAddress = (address: string) => {
    window.open(`${explorerUrl}/address/${address}`, '_blank', 'noopener,noreferrer')
}
