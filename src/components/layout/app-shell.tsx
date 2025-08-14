'use client'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Suspense, useMemo } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils/tailwind'
import { Button } from '../ui/button'
import { ErrorFallback, HeaderSkeleton, HeroSkeleton, PageSkeleton } from '../ui/skeletons'
import Header from './header'
import { HeaderContext } from './header-context'

interface AppShellProps {
  children: ReactNode
  header?: {
    backButton?: boolean | 'rounded'
    title?: string
    rightContent?: ReactNode
    className?: string
  }
  hero?: ReactNode // For the blue section with balance
  loading?: ReactNode
  error?: ReactNode
  onLogin?: () => void
}
export function AppShell({ children, header, hero, loading, error, onLogin }: AppShellProps) {
  const { authenticated, login } = useAuth()
  const hasHero = hero != null
  const contextValue = useMemo(() => ({ hasHero }), [hasHero])

  const renderHeader = () => {
    if (!header)
      return null
    const { className: headerClassName, ...headerProps } = header
    return (
      <Suspense fallback={<HeaderSkeleton />}>
        <Header
          {...headerProps}
          className={`
            ${hasHero && '-mb-0.5 bg-pool-blue shadow-none'}
            ${headerClassName}
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
        className="flex flex-col rounded-b-4xl bg-pool-blue px-safe-or-4"
        style={{ '--icon-color': 'white' } as React.CSSProperties}
      >
        <Suspense fallback={<HeroSkeleton />}>{hero}</Suspense>
      </div>
    )
  }
  return (
    <ErrorBoundary fallback={error != null ? error : <ErrorFallback />}>
      <HeaderContext value={contextValue}>
        <div className="fixed inset-0 flex flex-col">
          {renderHeader()}
          <main className={cn('flex flex-1 flex-col overflow-hidden')}>
            <Suspense fallback={loading != null ? loading : <PageSkeleton />}>
              {renderHero()}
              {children}
            </Suspense>
          </main>
          {!authenticated && (
            <AnimatePresence presenceAffectsLayout>
              <motion.footer
                initial={{ opacity: 0.7, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0.7, y: 100 }}
                transition={{
                  duration: 0.2,
                  ease: 'easeInOut',
                }}
                className="fixed inset-x-0 bottom-0 z-50"
              >
                <div className="main-home-login-button rounded-t-[2rem] pb-safe-or-6">
                  <div className="mx-auto max-w-screen-md pt-[15px] px-safe-or-6">
                    <Button
                      variant="pool"
                      className={`
                        mb-3 h-[46px] w-full rounded-[2rem] px-4 py-[11px] text-center text-base leading-normal
                        font-semibold
                      `}
                      onClick={onLogin ?? login}
                    >
                      Login
                    </Button>
                  </div>
                </div>
              </motion.footer>
            </AnimatePresence>
          )}
        </div>
      </HeaderContext>
    </ErrorBoundary>
  )
}
