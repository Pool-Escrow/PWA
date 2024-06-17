import { cn } from '@/lib/utils/tailwind'

type WithClassNameDivOptions = {
	className?: string | string[]
}

/**
 * A higher order component that creates a div element with combined className.
 *
 * @param options Object containing a className string or array.
 * @returns A React component that renders a div with the combined className.
 *
 * @example
 * const DialogFooter = withClassNameDiv({ className: "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2" });
 */
function withClassNameDiv({
	className: defaultClassName,
}: WithClassNameDivOptions) {
	const Component = ({
		className,
		...props
	}: React.HTMLAttributes<HTMLDivElement>) => {
		const combinedClassName = cn(defaultClassName, className)
		return <div className={combinedClassName} {...props} />
	}

	return Component
}

export default withClassNameDiv
