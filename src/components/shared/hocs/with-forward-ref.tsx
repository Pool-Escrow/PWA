import { cn } from '@/lib/utils/tailwind'
import type { ComponentType, ForwardedRef, ReactNode } from 'react'
import { forwardRef } from 'react'
import type { ClassNameValue } from 'tailwind-merge'

interface ForwardRefOptions {
    className?: ClassNameValue
    renderInner?: (children: ReactNode) => ReactNode
    renderOuter?: (content: ReactNode) => ReactNode
}

type ForwardRefProps<P> = P & {
    className?: ClassNameValue
    children?: ReactNode
}

function withForwardRef<T extends HTMLElement, P extends object>(
    Component: ComponentType<P>,
    options: ForwardRefOptions = {},
) {
    const { className: baseClassName, renderInner, renderOuter } = options

    const EnhancedComponent = forwardRef<T, ForwardRefProps<P>>((props, ref: ForwardedRef<T>) => {
        const { className, children, ...remainingProps } = props
        const content = renderInner ? renderInner(children) : children
        const combinedClassName = cn(baseClassName, className)

        const element = (
            <Component ref={ref} className={combinedClassName} {...(remainingProps as P)}>
                {content}
            </Component>
        )

        return renderOuter ? renderOuter(element) : element
    })

    EnhancedComponent.displayName = `withEnhancedForwardRef(${Component.displayName || Component.name || 'Component'})`

    return EnhancedComponent
}

export default withForwardRef
