import { cn } from '@/lib/utils/tailwind'

const Divider = ({ className }: { className?: any }) => (
    <div className={cn('mx-0 my-[1rem] border-t border-[#e2e8f0]', className)}></div>
)

export default Divider
