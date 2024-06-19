import * as TabsPrimitive from '@radix-ui/react-tabs'
import withForwardRef from '../shared/hocs/with-forward-ref'

const Tabs = TabsPrimitive.Root
const TabsList = withForwardRef(TabsPrimitive.List, {
    className:
        'inline-flex w-full h-[54px] items-center justify-center rounded-full bg-muted p-1 text-muted-foreground',
})
const TabsTrigger = withForwardRef(TabsPrimitive.Trigger, {
    className:
        'inline-flex items-center justify-center rounded-full h-full text-sm font-medium transition-all data-[state=active]:text-white text-zinc-400 hover:text-zinc-600/70 data-[state=active]:shadow-sm w-1/2 transparent-tap bg-transparent',
})
const TabsContent = withForwardRef(TabsPrimitive.Content, {
    className:
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
})

export { Tabs, TabsContent, TabsList, TabsTrigger }
