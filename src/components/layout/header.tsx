'use client'

import { use } from 'react'
import { cn } from '@/lib/utils/tailwind'
import BackButton from './back-button'
import { HeaderContext } from './header-context'

interface HeaderProps {
  backButton?: boolean | 'rounded'
  title?: string
  rightContent?: React.ReactNode
  className?: string
}

export default function Header({ backButton, title, rightContent, className }: HeaderProps) {
  const { hasHero } = use(HeaderContext)

  return (
    <header
      className={cn('relative flex h-12 items-center px-3', className)}
      style={{
        '--icon-color': hasHero ? 'white' : 'black',
      } as React.CSSProperties}
    >
      <div className="min-w-0">{backButton != null && <BackButton rounded={backButton === 'rounded'} />}</div>
      <div
        className="absolute left-1/2 max-w-[70%] -translate-x-1/2 truncate text-center"
        style={{
          color: hasHero ? 'white' : 'black',
        }}
      >
        {title}
      </div>
      <div className="ml-auto flex items-center gap-2">
        {rightContent}
      </div>
    </header>
  )
}
