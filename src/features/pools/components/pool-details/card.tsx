import { cn } from '@/lib/utils/tailwind'

export default function PoolDetailsCard({ children, className }: { children: React.ReactNode; className?: string }) {
    return <section className={cn('detail_card rounded-[2.875rem] p-[1.12rem]', className)}>{children}</section>
}
