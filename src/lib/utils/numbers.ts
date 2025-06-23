export const formatNumberToMetric = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 10000) return `${(num / 1000).toFixed(0)}k`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
}
