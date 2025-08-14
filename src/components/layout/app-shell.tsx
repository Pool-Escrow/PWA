'use client'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Suspense, useMemo } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useAuth } from '@/hooks/use-auth'
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
        className="mb-4 flex flex-col rounded-b-4xl bg-pool-blue px-safe-or-4"
        style={{ '--icon-color': 'white' } as React.CSSProperties}
      >
        <Suspense fallback={<HeroSkeleton />}>{hero}</Suspense>
      </div>
    )
  }
  return (
    <ErrorBoundary fallback={error != null ? error : <ErrorFallback />}>
      <HeaderContext value={contextValue}>
        <div>
          {renderHeader()}
          {renderHero()}
          <main className="flex flex-col gap-4 px-safe-or-2">
            <Suspense fallback={loading != null ? loading : <PageSkeleton />}>{children}</Suspense>
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
                className="fixed bottom-0 left-0 z-30 w-full"
              >
                <nav className={`
                  mx-auto flex h-24 max-w-screen-md items-center rounded-t-3xl bg-neutral-100/50 px-safe-or-4 pb-3
                  shadow shadow-black/60 backdrop-blur-2xl
                `}
                >
                  <Button
                    className={`
                      pool-button mb-3 h-[46px] w-full rounded-[2rem] px-4 py-[11px] text-center text-base
                      leading-normal font-semibold text-white
                    `}
                    onClick={onLogin ?? login}
                  >
                    Login
                  </Button>
                </nav>
              </motion.footer>
            </AnimatePresence>
          )}
        </div>
      </HeaderContext>
    </ErrorBoundary>
  )
}
