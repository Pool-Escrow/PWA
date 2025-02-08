import { Info } from 'lucide-react'
import { Card, CardContent } from '@/app/_components/ui/card'
import { Badge } from '@/app/_components/ui/badge'

interface BridgeInfoProps {
    bridgeInfo: {
        protocol: string
        rate: {
            from: { amount: number; token: string }
            to: { amount: number; token: string }
        }
        fee: {
            networkFee: number
            token: string
        }
        estimatedTime: string
        slippage: string
    }
}

export function BridgeInfoCard({ bridgeInfo }: BridgeInfoProps) {
    return (
        <Card className='detail_card mx-auto w-full rounded-[24px]'>
            <CardContent className='space-y-3 p-4'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <span className='text-sm text-foreground'>{bridgeInfo.protocol}</span>
                        {/* <Badge variant="success" className="bg-green-100 text-green-700 hover:bg-green-100">
              {bridgeInfo.speed}
            </Badge> */}
                    </div>
                </div>

                {/* Rate */}
                <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>Rate</span>
                    <span className='text-sm'>
                        1 {bridgeInfo.rate.from.token} = {bridgeInfo.rate.to.amount} {bridgeInfo.rate.to.token}
                    </span>
                </div>

                {/* Fee */}
                <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>Est. network fee</span>
                    <span className='text-sm'>
                        {bridgeInfo.fee.networkFee} {bridgeInfo.fee.token}
                    </span>
                </div>

                {/* Estimated Time */}
                <div className='flex items-center justify-between'>
                    <span className='text-sm text-muted-foreground'>Est. time</span>
                    <span className='text-sm'>{bridgeInfo.estimatedTime}</span>
                </div>

                {/* Slippage */}
                <div className='flex items-center justify-between'>
                    <span className='flex items-center gap-1 text-sm text-muted-foreground'>
                        Slippage <Info className='h-4 w-4' />
                    </span>
                    <span className='text-sm'>{bridgeInfo.slippage}</span>
                </div>

                {/* Minimum Received
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Minimum received</span>
          <span className="text-sm">
            {bridgeInfo.minimumReceived.amount} {bridgeInfo.minimumReceived.token}
          </span>
        </div> */}
            </CardContent>
        </Card>
    )
}
