import React, { ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerOverlay, DrawerTrigger } from '@/components/ui/drawer'
import { create } from 'lodash'
import { Dialog } from '../ui/dialog'

// ReactContext to simplify access of StripeOnramp object
const CryptoElementsContext = React.createContext({ onramp: null })

export const CryptoElements = ({ stripeOnramp, children }: { stripeOnramp: any; children: ReactNode }) => {
    const [ctx, setContext] = React.useState(() => ({ onramp: null }))

    React.useEffect(() => {
        let isMounted = true

        Promise.resolve(stripeOnramp).then(onramp => {
            if (onramp && isMounted) {
                setContext(ctx => (ctx.onramp ? ctx : { onramp }))
            }
        })

        return () => {
            isMounted = false
        }
    }, [stripeOnramp])

    return <CryptoElementsContext.Provider value={ctx}>{children}</CryptoElementsContext.Provider>
}

// React hook to get StripeOnramp from context
export const useStripeOnramp = () => {
    const context = React.useContext(CryptoElementsContext)
    return context?.onramp
}

const getSession = async () => {
    try {
        const response = await fetch('/api/onramp_stripe')
        if (!response.ok) {
            throw new Error('Network response was not ok')
        }
        const data = await response.json()
        console.log('data', data)
        return data
    } catch (error) {
        console.error('There was a problem with the post operation:', error)
    }
}

// React element to render Onramp UI
export const OnrampElement = ({ appearance, ...props }: { appearance?: any; [key: string]: any }) => {
    const stripeOnramp: any = useStripeOnramp()
    const onrampElementRef = React.useRef<HTMLDivElement>(null)
    const [clientSecret, setClientSecret] = React.useState('')
    const [showButton, setShowButton] = React.useState(true)
    const [open, setOpen] = useState(false)

    const createSession = async () => {
        const { client_secret: clientSecret } = await getSession()
        if (clientSecret) {
            setClientSecret(clientSecret)
            setShowButton(false)
        }
    }

    React.useEffect(() => {
        const containerRef = onrampElementRef.current

        if (containerRef) {
            containerRef.innerHTML = ''

            if (clientSecret && stripeOnramp) {
                stripeOnramp
                    ?.createSession({
                        clientSecret,
                        appearance,
                    })
                    .mount(containerRef)
                // createSession()
            }
        }
    }, [clientSecret, stripeOnramp])

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <Dialog.Trigger asChild>
                    <Button
                        className='h-10 w-20 rounded-[2rem] bg-cta text-center text-xs font-semibold leading-normal text-white shadow-button active:shadow-button-push'
                        onClick={createSession}>
                        On Ramp
                    </Button>
                </Dialog.Trigger>
                <Dialog.Content className='bg-white sm:max-w-[425px]'>
                    <Dialog.Header>
                        <Dialog.Title>Buy with Stripe</Dialog.Title>
                        <Dialog.Description>Using cards, banks and international options.</Dialog.Description>
                    </Dialog.Header>
                    <div {...props} ref={onrampElementRef}></div>

                    <div ref={onrampElementRef} {...props}></div>
                </Dialog.Content>
            </Dialog>
        </>
    )
}
