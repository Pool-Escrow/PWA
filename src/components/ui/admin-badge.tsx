'use client'

import { Badge } from '@/components/ui/badge'

interface AdminBadgeProps {
  variant?: 'admin' | 'host' | 'sponsor'
  size?: 'sm' | 'md'
  className?: string
}

export default function AdminBadge({ variant = 'admin', size = 'sm', className = '' }: AdminBadgeProps) {
  const getBadgeConfig = () => {
    switch (variant) {
      case 'admin':
        return {
          text: 'Admin',
          className: 'bg-red-500 text-white border-red-600',
        }
      case 'host':
        return {
          text: 'Host',
          className: 'bg-blue-800 text-white border-blue-600',
        }
      case 'sponsor':
        return {
          text: 'Sponsor',
          className: 'bg-green-500 text-white border-green-600',
        }
      default:
        return {
          text: 'Admin',
          className: 'bg-red-500 text-white border-red-600',
        }
    }
  }

  const config = getBadgeConfig()
  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'

  return (
    <Badge
      variant="outline"
      className={`
        ${config.className}
        ${sizeClass}
        ${className}
      `}
    >
      {config.text}
    </Badge>
  )
}
