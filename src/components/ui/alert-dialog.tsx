import withClassNameDiv from '@/components/hocs/with-classname-div'
import withForwardRef from '@/components/hocs/with-forward-ref'
import { cn } from '@/lib/utils/tailwind'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import type { DialogProps } from '@radix-ui/react-dialog'
import { buttonVariants } from './button'

const AlertDialog: React.FC<DialogProps> & {
    Action: typeof AlertDialogPrimitive.Action
    Cancel: typeof AlertDialogPrimitive.Cancel
    Content: typeof AlertDialogPrimitive.Content
    Description: typeof AlertDialogPrimitive.Description
    Footer: typeof AlertDialogFooter
    Header: typeof AlertDialogHeader
    Title: typeof AlertDialogPrimitive.Title
    Trigger: typeof AlertDialogPrimitive.Trigger
} = props => <AlertDialogPrimitive.Root {...props} />

const AlertDialogAction = withForwardRef<HTMLButtonElement, AlertDialogPrimitive.AlertDialogActionProps>(
    AlertDialogPrimitive.Action,
    {
        className: buttonVariants(),
    },
)

const AlertDialogCancel = withForwardRef<HTMLButtonElement, AlertDialogPrimitive.AlertDialogCancelProps>(
    AlertDialogPrimitive.Cancel,
    {
        className: cn(buttonVariants({ variant: 'outline' }), 'mt-2 sm:mt-0'),
    },
)

const AlertDialogContent = withForwardRef<HTMLDivElement, AlertDialogPrimitive.AlertDialogContentProps>(
    AlertDialogPrimitive.Content,
    {
        className:
            'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
        renderOuter: content => (
            <AlertDialogPrimitive.Portal>
                <AlertDialogOverlay />
                {content}
            </AlertDialogPrimitive.Portal>
        ),
    },
)

const AlertDialogDescription = withForwardRef<HTMLParagraphElement, AlertDialogPrimitive.AlertDialogDescriptionProps>(
    AlertDialogPrimitive.Description,
    {
        className: 'text-sm text-muted-foreground',
    },
)

const AlertDialogFooter = withClassNameDiv({
    className: 'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
})

const AlertDialogHeader = withClassNameDiv({
    className: 'flex flex-col space-y-2 text-center sm:text-left',
})

const AlertDialogOverlay = withForwardRef(AlertDialogPrimitive.Overlay, {
    className:
        'fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
})

const AlertDialogTitle = withForwardRef<HTMLHeadingElement, AlertDialogPrimitive.AlertDialogTitleProps>(
    AlertDialogPrimitive.Title,
    {
        className: 'text-lg font-semibold',
    },
)

AlertDialog.Action = AlertDialogAction
AlertDialog.Cancel = AlertDialogCancel
AlertDialog.Content = AlertDialogContent
AlertDialog.Description = AlertDialogDescription
AlertDialog.Footer = AlertDialogFooter
AlertDialog.Header = AlertDialogHeader
AlertDialog.Title = AlertDialogTitle
AlertDialog.Trigger = AlertDialogPrimitive.Trigger

export { AlertDialog }
