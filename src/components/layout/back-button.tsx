'use client'

import { useTransitionRouter } from 'next-view-transitions'
import { Button } from '@/components/ui/button'

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
      <svg xmlns="http://www.w3.org/2000/svg" className="size-7" viewBox="0 0 24 24" fill="none">
        <path
          d="M14.0002 18L15.4102 16.59L10.8302 12L15.4102 7.41L14.0002 6L8.00016 12L14.0002 18Z"
          fill="#5472E9"
        />
      </svg>
    </Button>
  )
}
