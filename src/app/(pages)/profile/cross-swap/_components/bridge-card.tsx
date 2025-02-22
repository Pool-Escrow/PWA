'use client'

import { Card, CardContent } from '@/app/_components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import type { BridgeInfo } from '../types'
import { formatCurrency } from '../utils/formatters'

export interface BridgeInfoCardProps {
    bridgeInfo: BridgeInfo
}

export function BridgeInfoCard({ bridgeInfo }: BridgeInfoCardProps) {
    const rate = Number(bridgeInfo.rate.to.amount) / Number(bridgeInfo.rate.from.amount)

    return (
        <Card className='detail_card mx-auto w-full rounded-[24px]'>
            <CardContent className='space-y-3 p-4'>
                <BridgeHeader protocol={bridgeInfo.protocol} />
                <BridgeDetail
                    label='Rate'
                    value={`1 ${bridgeInfo.rate.from.token} = ${formatCurrency(rate)} ${bridgeInfo.rate.to.token}`}
                />
                <BridgeDetail
                    label='Est. network fee'
                    value={`${formatCurrency(Number(bridgeInfo.fee.networkFee))} ${bridgeInfo.fee.token}`}
                />
                <BridgeDetail label='Est. time' value={bridgeInfo.estimatedTime} />
                <BridgeDetail
                    label='Slippage'
                    value={`${Number(bridgeInfo.slippage) * 100}%`}
                    tooltip='The maximum difference between expected and executed price'
                />
            </CardContent>
        </Card>
    )
}

function BridgeHeader({ protocol }: { protocol: string }) {
    return (
        <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
                <span className='text-sm text-foreground'>{protocol}</span>
            </div>
        </div>
    )
}

interface BridgeDetailProps {
    label: string
    value: string
    tooltip?: string
}

function BridgeDetail({ label, value, tooltip }: BridgeDetailProps) {
    const LabelContent = (
        <span className='flex items-center gap-1 text-sm text-muted-foreground'>
            {label}
            {tooltip && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <Info className='size-4' />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{tooltip}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </span>
    )

    return (
        <div className='flex items-center justify-between'>
            {LabelContent}
            <span className='text-sm font-medium'>{value}</span>
        </div>
    )
}
