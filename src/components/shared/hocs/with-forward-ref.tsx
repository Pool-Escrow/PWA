import { cn } from '@/lib/utils/tailwind'
import {
	ComponentPropsWithoutRef,
	ComponentType,
	ForwardRefExoticComponent,
	PropsWithChildren,
	ReactNode,
	RefAttributes,
	forwardRef,
} from 'react'

interface WithForwardRefOptions {
	className?: string | string[]
	inner?: (children: ReactNode) => ReactNode
	outer?: (content: ReactNode) => ReactNode
}

function withForwardRef<
	T extends ComponentType<any> | ForwardRefExoticComponent<any>,
>(
	PrimitiveComponent: T,
	{ className: defaultClassName, inner, outer }: WithForwardRefOptions,
) {
	type Ref =
		T extends ForwardRefExoticComponent<infer Props>
			? Props extends RefAttributes<infer RefType>
				? RefType
				: never
			: never

	type Props = PropsWithChildren<
		ComponentPropsWithoutRef<T> & { className?: string | string[] }
	>

	const Component = forwardRef<Ref, Props>((props, ref) => {
		const { className, children, ...otherProps } = props
		const finalClassName = cn(defaultClassName, className)
		const processedChildren = inner ? inner(children) : children

		const content = (
			<PrimitiveComponent
				ref={ref}
				className={finalClassName}
				{...(otherProps as any)}
			>
				{processedChildren}
			</PrimitiveComponent>
		)

		return outer ? outer(content) : content
	})

	Component.displayName = PrimitiveComponent.displayName

	return Component
}

export default withForwardRef
