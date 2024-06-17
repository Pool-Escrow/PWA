import * as DialogPrimitive from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'
import withClassNameDiv from '../shared/hocs/with-classname-div'
import withForwardRef from '../shared/hocs/with-forward-ref'

const Dialog: React.FC<DialogPrimitive.DialogProps> & {
	Trigger: typeof DialogPrimitive.Trigger
	Content: typeof DialogPrimitive.Content
	Header: typeof DialogHeader
	Footer: typeof DialogFooter
	Title: typeof DialogPrimitive.Title
	Description: typeof DialogPrimitive.Description
} = (props) => <DialogPrimitive.Root {...props} />

const DialogOverlay = withForwardRef(DialogPrimitive.Overlay, {
	className:
		'fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
})

const DialogContent = withForwardRef(DialogPrimitive.Content, {
	className:
		'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
	outer: (content) => (
		<DialogPrimitive.Portal>
			<DialogOverlay />
			{content}
		</DialogPrimitive.Portal>
	),
	inner: (children) => (
		<>
			{children}
			<DialogPrimitive.Close className='absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'>
				<XIcon className='h-4 w-4' />
				<span className='sr-only'>Close</span>
			</DialogPrimitive.Close>
		</>
	),
})

const DialogTitle = withForwardRef(DialogPrimitive.Title, {
	className: 'text-lg font-semibold leading-none tracking-tight',
})

const DialogDescription = withForwardRef(DialogPrimitive.Description, {
	className: 'text-sm text-muted-foreground',
})

const DialogHeader = withClassNameDiv({
	className: 'flex flex-col space-y-1.5 text-center sm:text-left',
})

const DialogFooter = withClassNameDiv({
	className: 'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
})

Dialog.Trigger = DialogPrimitive.Trigger
Dialog.Content = DialogContent
Dialog.Header = DialogHeader
Dialog.Title = DialogTitle
Dialog.Description = DialogDescription
Dialog.Footer = DialogFooter

export { Dialog }
