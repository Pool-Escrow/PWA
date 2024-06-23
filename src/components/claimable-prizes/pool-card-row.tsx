import { capitalize } from 'lodash'
import PoolCardRowImage from './pool-card-row-image'
import CircleCheckIcon from './circle-check.icon'
import { Badge } from '@/components/ui/badge'

interface PoolCardRowProps {
    name: string
    prize: string
    result: string
    image: string
}

const PoolCardRow = ({ name, prize, result, image }: PoolCardRowProps) => {
    return (
        <div className='flex items-center justify-start gap-[10px]'>
            <PoolCardRowImage image={image} />
            <div className='flex-1'>
                <div className='overflow-hidden text-ellipsis text-nowrap text-xs font-medium text-black'>{name}</div>
                <div className='text-[11px] font-semibold text-[#2989EC]'>{capitalize(result)}</div>
            </div>
            <div className='flex items-center gap-[6px] font-thin'>
                <CircleCheckIcon />
                <Badge className='inline-flex h-[30px] w-[70px] flex-nowrap items-center justify-center gap-1.5 rounded-[9px] bg-[#6993FF]/25 px-2.5 py-[5px]'>
                    <div className='text-center text-[10px] font-medium leading-tight text-[#2989EC]'>{prize}</div>
                </Badge>
            </div>
        </div>
    )
}

export default PoolCardRow
