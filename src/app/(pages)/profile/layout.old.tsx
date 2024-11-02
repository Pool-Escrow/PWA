import Script from 'next/script'

export default function ProfileLayout({ children }: React.PropsWithChildren) {
    return (
        // <>
        { children }
        // {/* <Script src='https://js.stripe.com/v3/' /> */}
        // {/* <Script src='https://crypto-js.stripe.com/crypto-onramp-outer.js' /> */}
        // {/* </> */}
    )
}
