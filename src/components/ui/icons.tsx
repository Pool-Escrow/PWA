import type { ComponentProps } from 'react'
import { Icon } from './icon'

type IconProps = Omit<ComponentProps<typeof Icon>, 'name'>

// Common icons used across the app
export const Icons = {
  // Loading states
  spinner: (props: IconProps) => <Icon name="lucide:loader" {...props} />,
  loading: (props: IconProps) => <Icon name="lucide:loader-circle" {...props} />,

  // Navigation
  chevronLeft: (props: IconProps) => <Icon name="lucide:chevron-left" {...props} />,
  chevronRight: (props: IconProps) => <Icon name="lucide:chevron-right" {...props} />,
  arrowLeft: (props: IconProps) => <Icon name="lucide:arrow-left" {...props} />,

  // Actions
  plus: (props: IconProps) => <Icon name="lucide:plus" {...props} />,
  minus: (props: IconProps) => <Icon name="lucide:minus" {...props} />,
  edit: (props: IconProps) => <Icon name="lucide:pencil" {...props} />,
  delete: (props: IconProps) => <Icon name="lucide:trash-2" {...props} />,

  // UI elements
  eye: (props: IconProps) => <Icon name="lucide:eye" {...props} />,
  eyeOff: (props: IconProps) => <Icon name="lucide:eye-off" {...props} />,
  search: (props: IconProps) => <Icon name="lucide:search" {...props} />,
  close: (props: IconProps) => <Icon name="lucide:x" {...props} />,

  // Custom icons (migrate from SVG files)
  drop: (props: IconProps) => <Icon name="ic:sharp-water-drop" {...props} />,
  bridge: (props: IconProps) => <Icon name="mdi:bridge" {...props} />,
  wallet: (props: IconProps) => <Icon name="mdi:wallet" {...props} />,
  qr: (props: IconProps) => <Icon name="fluent:qr-code-28-filled" {...props} />,
  withdraw: (props: IconProps) => <Icon name="mdi:cash-minus" {...props} />,
}
