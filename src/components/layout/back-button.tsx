'use client'

import { useTransitionRouter } from 'next-view-transitions'
import { Button } from '@/components/ui/button'
import Icon from '@/components/ui/icon'

interface BackButtonProps {
  rounded?: boolean
}

export default function BackButton({ rounded = false }: BackButtonProps = {}) {
  const router = useTransitionRouter()
  return (
    <Button
      onClick={() => router.back()}
      variant="ghost"
      className={`
        rounded-full
        active:bg-gray-100
        ${rounded ? 'bg-white p-2 shadow-md' : ''}
      `}
      size="icon"
    >
      <Icon.chevronLeft className="size-7" />
    </Button>
  )
}
