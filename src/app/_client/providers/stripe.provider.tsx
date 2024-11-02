// import React, { createContext, useContext, useEffect, useState } from 'react'

// // Define the shape of the Stripe Onramp object
// interface StripeOnramp {
//     createSession: (options: StripeOnrampOptions) => {
//         mount: (element: HTMLElement) => void
//     }
//     // Add other methods as needed
// }

// // Define the options for creating a Stripe Onramp session
// interface StripeOnrampOptions {
//     clientSecret: string
//     appearance?: StripeOnrampAppearance
// }

// // Define the appearance options (you may need to adjust this based on Stripe's actual API)
// interface StripeOnrampAppearance {
//     theme?: 'light' | 'dark'
//     // Add other appearance properties as needed
// }

// // Define the shape of the context
// interface StripeOnrampContextType {
//     onramp: StripeOnramp | undefined
// }

// // Define the type for the function that initializes Stripe Onramp
// type StripeOnrampInitializer = () => Promise<StripeOnramp>

// // Create the context
// const StripeOnrampContext = createContext<StripeOnrampContextType | undefined>(undefined)

// // Define the props for the provider component
// interface StripeOnrampProviderProps {
//     stripeOnrampInitializer: StripeOnrampInitializer
//     children: React.ReactNode
// }

// // Create the provider component
// export const StripeOnrampProvider: React.FC<StripeOnrampProviderProps> = ({ stripeOnrampInitializer, children }) => {
//     const [ctx, setContext] = useState<StripeOnrampContextType>({ onramp: undefined })

//     useEffect(() => {
//         let isMounted = true

//         const initializeOnramp = async () => {
//             try {
//                 const onramp = await stripeOnrampInitializer()
//                 if (isMounted) {
//                     setContext({ onramp })
//                 }
//             } catch (error) {
//                 console.error('Error initializing Stripe Onramp:', error)
//             }
//         }

//         void initializeOnramp()

//         return () => {
//             isMounted = false
//         }
//     }, [stripeOnrampInitializer])

//     return <StripeOnrampContext.Provider value={ctx}>{children}</StripeOnrampContext.Provider>
// }

// // Create the hook to use the Stripe Onramp context
// export const useStripeOnramp = (): StripeOnramp | undefined => {
//     const context = useContext(StripeOnrampContext)
//     if (!context) {
//         throw new Error('useStripeOnramp must be used within StripeOnrampProvider')
//     }
//     return context.onramp
// }
