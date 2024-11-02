// import { NextResponse } from 'next/server'

// import 'server-only'

// export async function GET(req: Request) {
//     console.log('req', req)
//     console.log('stripe onramp API Hit')
//     try {
//         const response = await fetch('https://api.stripe.com/v1/crypto/onramp_sessions', {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY_TEST}`,
//                 'Content-Type': 'application/x-www-form-urlencoded',
//             },
//             body: new URLSearchParams({
//                 destination_currency: 'usdc',
//                 destination_network: 'base',
//             }).toString(),
//         })

//         const json = await response.json()
//         return NextResponse.json(json, { status: 200 })
//     } catch (error) {
//         console.error('There was a problem with the post operation:', error)
//     }
// }
