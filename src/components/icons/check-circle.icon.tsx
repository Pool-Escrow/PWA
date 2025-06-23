import type { SVGProps } from 'react'
import { memo } from 'react'
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none' {...props}>
        <path
            fill='url(#a)'
            d='M6 0a6 6 0 1 0 6 6 6.007 6.007 0 0 0-6-6Zm3.463 4.1L6.041 8.745a.505.505 0 0 1-.715.094L2.882 6.883a.5.5 0 0 1 .625-.78l2.038 1.63 3.114-4.226a.5.5 0 1 1 .804.592Z'
        />
        <defs>
            <linearGradient id='a' x1={6} x2={6} y1={0} y2={12} gradientUnits='userSpaceOnUse'>
                <stop stopColor='#6987FF' />
                <stop offset={1} stopColor='#4360D6' />
            </linearGradient>
        </defs>
    </svg>
)
const Memo = memo(SvgComponent)
export default Memo
