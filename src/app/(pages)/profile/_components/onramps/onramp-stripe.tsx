// 'use client'

// import { Button } from '@/app/_components/ui/button'
// // import { loadStripeOnramp } from '@stripe/crypto'
// import { useEffect, useRef, useState } from 'react'
// // import { getSession } from './get-session'
// import { Dialog } from '@/app/_components/ui/dialog'

// interface StripeOnrampAppearance {
//     theme: 'light' | 'dark'
// }

// interface StripeOnrampSession {
//     clientSecret: string
//     appearance?: StripeOnrampAppearance
// }

// interface StripeOnramp {
//     createSession: (options: StripeOnrampSession) => {
//         mount: (element: HTMLElement) => void
//     }
// }

// interface OrampWithStripeProps extends React.HTMLAttributes<HTMLDivElement> {
//     appearance?: StripeOnrampAppearance
// }

// if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST) {
//     throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST not set')
// }

// export const OnrampWithStripe: React.FC<OrampWithStripeProps> = ({ appearance, ...props }) => {
//     const [stripeOnramp, setStripeOnramp] = useState<StripeOnramp | null>(null)
//     const onrampElementRef = useRef<HTMLDivElement>(null)
//     const [clientSecret, setClientSecret] = useState('')
//     const [showButton, setShowButton] = useState(true)
//     const [open, setOpen] = useState(false)

//     useEffect(() => {
//         loadStripeOnramp(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST!)
//             .then(setStripeOnramp)
//             .catch(console.error)
//     }, [])

//     const createSession = async () => {
//         const { client_secret: clientSecret } = await getSession()
//         if (clientSecret) {
//             setClientSecret(clientSecret)
//             setShowButton(false)
//         }
//     }

//     useEffect(() => {
//         const containerRef = onrampElementRef.current

//         if (containerRef && clientSecret && stripeOnramp) {
//             containerRef.innerHTML = ''

//             stripeOnramp
//                 .createSession({
//                     clientSecret,
//                     appearance,
//                 })
//                 .mount(containerRef)
//         }
//     }, [clientSecret, stripeOnramp, appearance])

//     return (
//         <>
//             <Dialog open={open} onOpenChange={setOpen}>
//                 <Dialog.Trigger asChild>
//                     <Button
//                         className='h-10 w-20 rounded-[2rem] bg-cta text-center text-xs font-semibold leading-normal text-white shadow-button active:shadow-button-push'
//                         onClick={createSession}>
//                         On Ramp
//                     </Button>
//                 </Dialog.Trigger>
//                 <Dialog.Content className='bg-white sm:max-w-[425px]'>
//                     <Dialog.Header>
//                         <Dialog.Title>Buy with Stripe</Dialog.Title>
//                         <Dialog.Description>Using cards, banks and international options.</Dialog.Description>
//                     </Dialog.Header>
//                     <div className='w-20' {...props} ref={onrampElementRef}></div>

//                     {/* <div ref={onrampElementRef} {...props}></div> */}
//                 </Dialog.Content>
//             </Dialog>
//         </>
//     )
// }
