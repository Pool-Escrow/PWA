import { Button } from './button'
import { Skeleton } from './skeleton'

export default function PoolsSkeleton({ length }: { length: number }) {
  return (
    <div className="mt-3 flex w-full flex-col space-y-4">
      {Array.from({ length }, (_, index) => (
        <Skeleton
          key={index}
          className="flex h-24 items-center gap-[14px] overflow-hidden rounded-[2rem] bg-transparent p-3 pr-4"
          style={{
            animationDelay: `${index * 0.2}s`,
            backgroundSize: '200% 100%',
            backgroundImage: 'linear-gradient(to left, #f4f4f4 8%, #f8f8f8 18%, #f4f4f4 33%)',
          }}
        >
          <Skeleton className="size-[72px] rounded-[16px] bg-[#36a0f7]/10" />
          <div className="flex flex-col gap-[5px]">
            <Skeleton className="h-4 w-10 bg-[#36a0f7]/10" />
            <Skeleton className="h-4 w-16 bg-[#36a0f7]/10" />
            <Skeleton className="h-4 w-28 bg-[#36a0f7]/10" />
          </div>
        </Skeleton>
      ))}
    </div>
  )
}

export function HeaderSkeleton() {
  return (
    <header className="z-30 bg-transparent text-white">
      <nav className="mx-auto h-[68px] max-w-screen-md px-safe-or-6">
        <div className="grid h-24 grid-cols-[1fr_auto_1fr] items-center">
          <div className="size-6 animate-pulse rounded bg-white/20" />
          <div className="h-4 w-24 animate-pulse rounded bg-white/20" />
          <div className="flex items-center gap-2 justify-self-end">
            <div className="size-6 animate-pulse rounded bg-white/20" />
            <div className="size-8 animate-pulse rounded-full bg-white/20" />
          </div>
        </div>
      </nav>
    </header>
  )
}

export function HeroSkeleton() {
  return (
    <div className="mx-auto flex max-w-screen-md flex-col px-safe-or-6">
      {/* User Balance Skeleton */}
      <section className="flex flex-col">
        <div className="h-4 w-24 animate-pulse rounded bg-white/20" />
        <div className="mt-2 h-12 w-48 animate-pulse rounded bg-white/20" />
        <div className="mt-2 h-6 w-32 animate-pulse rounded-full bg-white/20" />
      </section>

      {/* Action Bar Skeleton */}
      <div className="mt-4">
        <div className="mx-auto h-[55px] w-full max-w-[340px] animate-pulse rounded-[12px] bg-white/20" />
      </div>
      <div className="h-6" />
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
      <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
      <div className="h-32 w-full animate-pulse rounded bg-gray-200" />
    </div>
  )
}

export function ErrorFallback({
  error: _error,
  resetErrorBoundary,
}: {
  error?: Error
  resetErrorBoundary?: () => void
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
        <p className="mt-2 text-gray-600">We encountered an error loading this page.</p>
        {resetErrorBoundary && (
          <Button
            onClick={resetErrorBoundary}
            className={`
              mt-4 rounded-md bg-blue-600 px-4 py-2 text-white
              hover:bg-blue-700
            `}
          >
            Try again
          </Button>
        )}
      </div>
    </div>
  )
}
