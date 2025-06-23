export function formatAddress(address: string, charNum: number = 4) {
    return `${address?.slice(0, 6)}...${address?.slice(-charNum)}`
}
