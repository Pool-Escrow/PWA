import 'server-only'

import { NextResponse } from 'next/server'

import crypto from 'crypto'
import type { SignOptions } from 'jsonwebtoken'
import { sign } from 'jsonwebtoken'

export async function POST(req: Request) {
    console.log('on_ramp_coinbase API Hit')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const requestData = await req.json()

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { chainName, address } = requestData
    console.log('chainName:', chainName)
    console.log('address:', address)
    const key_name = process.env.COINBASE_KEY_NAME
    const key_secret = process.env.COINBASE_KEY_SECRET

    if (!key_name || !key_secret) {
        console.error('Coinbase key name or secret not found')

        return NextResponse.json({ message: 'No Coinbase Key found' }, { status: 500 })
    }

    const request_method = 'POST'
    const host = 'api.developer.coinbase.com'
    const request_path = '/onramp/v1/token'
    const url = `https://${host}${request_path}`

    const uri = request_method + ' ' + host + request_path

    const payload = {
        iss: 'coinbase-cloud',
        nbf: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 120,
        sub: key_name,
        uri,
    }

    const signOptions: SignOptions = {
        algorithm: 'ES256',
        header: {
            kid: key_name,
            // TODO: fix this because it is not supposed to be here
            // eslint-disable-next-line
            // @ts-expect-error
            nonce: crypto.randomBytes(16).toString('hex'),
        },
    }

    const jwt = sign(payload, key_secret, signOptions)

    const body = {
        destination_wallets: [
            {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                address: address,
                blockchains: ['base'],
            },
        ],
    }

    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { Authorization: 'Bearer ' + jwt },
    })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await response.json()
    console.log('Data:', data)
    // eslint-disable-next-line
    if (data.message) {
        // eslint-disable-next-line
        console.error('Error:', data.message)
        // eslint-disable-next-line
        return NextResponse.json({ message: data.message }, { status: 500 })
    } else {
        // Success

        // Dynamic import to prevent client-side bundling of Coinbase's HeartbeatWorker
        const { generateOnRampURL } = await import('@coinbase/cbpay-js')

        const onRampUrl = generateOnRampURL({
            // eslint-disable-next-line
            sessionToken: data.token,
            // eslint-disable-next-line
            destinationWallets: [{ address: address, assets: [chainName] }],
            theme: 'light',
        })

        return NextResponse.json({ onRampUrl }, { status: 200 })
    }
}

// eslint-disable-next-line
const constructURL = (token: string) => {
    return `https://pay.coinbase.com/buy/select-asset?sessionToken=${token}`
}
