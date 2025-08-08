'use client'

import { Button } from '@/components/ui/button'
import Icon from '@/components/ui/icon'
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
      {hidden ? <Icon.eyeOff /> : <Icon.eye />}
    </Button>
  )
}
