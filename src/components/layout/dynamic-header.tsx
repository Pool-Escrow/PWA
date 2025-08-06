'use client'

import { cn } from '@/lib/utils/tailwind'
import BackButton from './back-button'

interface DynamicHeaderProps {
  backButton?: boolean | 'rounded'
  title?: string
  rightContent?: React.ReactNode
  className?: string
}

export function DynamicHeader({ backButton, title, rightContent, className }: DynamicHeaderProps) {
  return (
    <header className={cn('fixed top-0 right-0 left-0 z-50 bg-white shadow-sm', className)}>
      <div className={`
        mx-auto flex max-w-screen-md items-center justify-between px-4 py-3
      `}
      >
        <nav className="flex min-w-0 flex-1 items-center">
          {backButton != null && <BackButton rounded={backButton === 'rounded'} />}
        </nav>
        <title className="min-w-0 flex-1 truncate text-center font-semibold">{title}</title>
        <nav className="flex min-w-0 flex-1 items-center justify-end gap-2">{rightContent}</nav>
      </div>
    </header>
  )
}
