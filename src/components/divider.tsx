import { cn } from '@/lib/utils/tailwind'

const Divider = ({ className }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('mx-0 my-[1rem] border-t border-[#e2e8f0]', className)} />
)

export default Divider
