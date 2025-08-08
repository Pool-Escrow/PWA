'use client'

import { Button } from '@/components/ui/button'
import Icon from '@/components/ui/icon'
import usePrivacy from '@/hooks/use-privacy'

export default function PrivacyButton() {
  const { hidden, toggle } = usePrivacy()

  const EyeIcon = hidden ? Icon.eyeOff : Icon.eye

  return (
    <Button
      variant="ghost"
      className={`
        rounded-full
        hover:bg-black/10
      `}
      size="icon"
      onClick={() => {
        void toggle()
      }}
    >
      <EyeIcon className="size-6" />
    </Button>
  )
}
