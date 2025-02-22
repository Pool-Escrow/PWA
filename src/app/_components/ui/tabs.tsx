import * as TabsPrimitive from '@radix-ui/react-tabs'
import withForwardRef from '../hocs/with-forward-ref'

const Tabs = TabsPrimitive.Root
const TabsList = withForwardRef(TabsPrimitive.List, {
    className: 'inline-flex w-full h-[54px] items-center justify-end rounded-full bg-muted text-muted-foreground',
})
const TabsTrigger = withForwardRef(TabsPrimitive.Trigger, {
    className:
        'inline-flex items-center justify-center h-full text-sm font-medium transition-all data-[state=active]:text-black text-[#B2B2B2] hover:text-zinc-600/70 w-1/2 transparent-tap bg-transparent relative',
})
const TabsContent = withForwardRef(TabsPrimitive.Content, {
    className:
        'mt-2 ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
})

export { Tabs, TabsContent, TabsList, TabsTrigger }
