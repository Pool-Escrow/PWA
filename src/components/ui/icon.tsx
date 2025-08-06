import iconBundle from '@/lib/icons/bundle.json'
import { cn } from '@/lib/utils/tailwind'

interface IconProps {
  name: string
  size?: string | number
  className?: string
  color?: string
  [key: string]: unknown
}

interface IconData {
  body: string
  viewBox: string
}

function Icon({ ref, name, size = 24, className, color = 'white', ...props }: IconProps & { ref?: React.RefObject<SVGSVGElement | null> }) {
  // Always use local bundle for consistency and to avoid CSP issues
  try {
    const iconData = iconBundle[name as keyof typeof iconBundle] as IconData
    if (iconData == null) {
      console.warn(`Icon not found: ${name}`)
      return <div className={cn('inline-block', className as string)} style={{ width: size, height: size }} />
    }

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox={iconData.viewBox}
        className={cn('inline-block', className as string)}
        style={{ color }}
        {...props}
        // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
        dangerouslySetInnerHTML={{ __html: iconData.body }}
      />
    )
  }
  catch (error) {
    console.warn(`Failed to load icon: ${name}`, error)
    return <div className={cn('inline-block', className as string)} style={{ width: size, height: size }} />
  }
}

Icon.displayName = 'Icon'

export { Icon }
