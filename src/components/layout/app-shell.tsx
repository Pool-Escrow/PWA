'use client'

import type { ReactNode } from 'react'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorFallback, HeaderSkeleton, HeroSkeleton, PageSkeleton } from '../ui/skeletons'
import Header from './header'

interface AppShellProps {
  children: ReactNode
  header?: {
    backButton?: boolean | 'rounded'
    title?: string
    rightContent?: ReactNode
    className?: string
  }
  hero?: ReactNode // For the blue section with balance
  bottom?: ReactNode // For fixed buttons at the bottom
  loading?: ReactNode
  error?: ReactNode
}

export function AppShell({ children, header, hero, bottom, loading, error }: AppShellProps) {
  const renderHeader = () => {
    if (!header)
      return null
    return (
      <Suspense fallback={<HeaderSkeleton />}>
        <Header
          {...header}
          className={`
            ${hero != null && 'shadow-none'}
            ${header.className}
          `}
        />
      </Suspense>
    )
  }

  const renderHero = () => {
    if (hero == null)
      return null
    return (
      <div
        className={`
          mb-4 flex flex-col rounded-b-4xl bg-pool-blue px-safe-or-4
          ${header && 'pt-15'}
        `}
      >
        <Suspense fallback={<HeroSkeleton />}>{hero}</Suspense>
      </div>
    )
  }

  return (
    <ErrorBoundary fallback={error != null ? error : <ErrorFallback />}>
      <div>
        {renderHeader()}
        {renderHero()}

        <main className="flex flex-col gap-4 px-safe-or-2">
          <Suspense fallback={loading != null ? loading : <PageSkeleton />}>{children}</Suspense>
        </main>

        {bottom != null && (
          <div className="fixed right-0 bottom-0 left-0 z-50 mb-safe-or-4 border-t border-gray-200 bg-white p-4">
            {bottom}
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}
