'use client'

import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import UserMenu from '@/components/user/user-menu'
import usePrivacy from '@/hooks/use-privacy'
import BackButton from './back-button'

interface TopBarProps {
  backButton?: boolean | 'rounded'
  actionButton?: React.ReactNode
  title?: string
}

export default function TopBar({ backButton, actionButton, title }: TopBarProps) {
  const { hidden, toggle } = usePrivacy()

  return (
    <header className="z-30 bg-transparent text-white">
      <nav className="mx-auto h-[68px] max-w-screen-md px-safe-or-6">
        <div className="grid h-24 grid-cols-[1fr_auto_1fr] items-center">
          <div className="w-6">{backButton === 'rounded' ? <BackButton rounded /> : backButton && <BackButton />}</div>
          <div className="text-center text-[14px] font-medium text-black">{Boolean(title) && title}</div>
          <div className="flex items-center gap-4 justify-self-end">
            <Button
              size="icon"
              variant="ghost"
              className={`
                z-10 size-6 text-white
                hover:bg-transparent
              `}
              onClick={() => {
                void toggle()
              }}
            >
              {hidden
                ? <Icons.eyeOff className="size-6" />
                : <Icons.eye className="size-6" />}
            </Button>
            {actionButton ?? <UserMenu />}
          </div>
        </div>
      </nav>
    </header>
  )
}
