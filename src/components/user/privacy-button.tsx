'use client'

import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import usePrivacy from '@/hooks/use-privacy'

export default function PrivacyButton() {
  const { hidden, toggle } = usePrivacy()

  return (
    <Button
      variant="ghost"
      className="hover:bg-black/10"
      size="icon"
      onClick={() => {
        void toggle()
      }}
    >
      {hidden
        ? (
            <Icons.eyeOff className="size-6" />
          )
        : (
            <Icons.eye className="size-6" />
          )}
    </Button>
  )
}
