import type { ImageProps } from 'next/image'
import Image from 'next/image'

export function UnoptimizedImage(props: ImageProps) {
  return <Image {...props} unoptimized />
}
