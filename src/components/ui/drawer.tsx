import { DialogProps } from '@radix-ui/react-dialog'
import { Drawer as DrawerPrimitive } from 'vaul'
import withClassNameDiv from '../shared/hocs/with-classname-div'
import withForwardRef from '../shared/hocs/with-forward-ref'

interface DrawerProps extends DialogProps {
	shouldScaleBackground?: boolean
}

const Drawer: React.FC<DrawerProps> & {
	Close: typeof DrawerPrimitive.Close
	Content: typeof DrawerPrimitive.Content
	Description: typeof DrawerPrimitive.Description
	Footer: typeof DrawerFooter
	Header: typeof DrawerHeader
	Title: typeof DrawerPrimitive.Title
	Trigger: typeof DrawerPrimitive.Trigger
} = ({ shouldScaleBackground = true, children, ...props }) => (
	<DrawerPrimitive.Root
		shouldScaleBackground={shouldScaleBackground}
		{...props}
	>
		{children}
	</DrawerPrimitive.Root>
)

const DrawerOverlay = withForwardRef(DrawerPrimitive.Overlay, {
	className: 'fixed inset-0 z-50 bg-black/80',
})

const DrawerContent = withForwardRef(DrawerPrimitive.Content, {
	className:
		'fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background',
	outer: (content) => (
		<DrawerPrimitive.Portal>
			<DrawerOverlay />
			{content}
		</DrawerPrimitive.Portal>
	),
	inner: (children) => (
		<>
			<div className='mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted' />
			{children}
		</>
	),
})

const DrawerHeader = withClassNameDiv({
	className: 'grid gap-1.5 p-4 text-center sm:text-left',
})

const DrawerFooter = withClassNameDiv({
	className: 'mt-auto flex flex-col gap-2 p-4',
})

const DrawerTitle = withForwardRef(DrawerPrimitive.Title, {
	className: 'text-lg font-semibold leading-none tracking-tight',
})

const DrawerDescription = withForwardRef(DrawerPrimitive.Description, {
	className: 'text-sm text-muted-foreground',
})

Drawer.Close = DrawerPrimitive.Close
Drawer.Content = DrawerContent
Drawer.Description = DrawerDescription
Drawer.Footer = DrawerFooter
Drawer.Header = DrawerHeader
Drawer.Title = DrawerTitle
Drawer.Trigger = DrawerPrimitive.Trigger

export { Drawer }
