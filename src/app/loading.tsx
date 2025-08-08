import Icon from '@/components/ui/icon'

export default function Loading() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4">
      <Icon.loading className="size-10 animate-spin" />
      <div className="text-center text-2xl font-bold">Loading Pool App</div>
    </div>
  )
}
