'use client'

import { useEffect } from 'react'

export function PreloadResources() {
  useEffect(() => {
    // Preload sprite SVG for instant icon rendering
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = '/icons/sprite.svg'
    link.as = 'image'
    link.type = 'image/svg+xml'
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)

    return () => {
      // Cleanup if component unmounts
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [])

  return null
}
