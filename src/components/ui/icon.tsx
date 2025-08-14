import React from 'react'
import { cn } from '@/lib/utils/tailwind'

// get the colection/icon names to alias from https://icones.js.org/
const ICON_MAP = {

  arrowLeft: 'lucide:arrow-left',
  chevronLeft: 'lucide:chevron-left',
  chevronRight: 'lucide:chevron-right',
  close: 'lucide:x',
  delete: 'lucide:trash-2',
  drop: 'ic:sharp-water-drop',
  edit: 'lucide:pencil',
  ellipsis: 'lucide:ellipsis',
  eye: 'mdi:eye',
  eyeOff: 'mdi:eye-off',
  loading: 'lucide:loader-circle',
  minus: 'lucide:minus',
  plus: 'lucide:plus',
  qr: 'fluent:qr-code-24-filled',
  search: 'lucide:search',
  spinner: 'lucide:loader',
  swap: 'jam:refresh',
  wallet: 'fluent:wallet-24-filled',
  withdraw: 'fluent:share-24-filled',
} satisfies Record<string, string>

export interface StaticIconProps {
  className?: string
  size?: number
}

// Base Icon component for rendering sprites
function BaseIcon({ name, className, size }: { name: keyof typeof ICON_MAP, className?: string, size?: number }) {
  const iconName = ICON_MAP[name]

  return (
    <svg
      className={cn('inline-block', className)}
      style={{
        width: size,
        height: size,
        color: 'var(--icon-color, currentColor)',
      }}
      aria-hidden="true"
      focusable="false"
    >
      <use href={`/icons/sprite.svg#${iconName}`} />
    </svg>
  )
}

// Main Icon component with static properties
const Icon = {} as {
  [K in keyof typeof ICON_MAP]: (props?: StaticIconProps) => React.JSX.Element
}

// Add static properties for each icon
Object.keys(ICON_MAP).forEach((iconKey) => {
  const key = iconKey as keyof typeof ICON_MAP
  Icon[key] = (props?: StaticIconProps) => <BaseIcon name={key} {...props} />
})

export default Icon
