import 'server-only'

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { getUser, verifyToken } from '@/lib/server/auth'
import { generateOnRampURL } from '@coinbase/cbpay-js'
import { WalletWithMetadata } from '@privy-io/react-auth'

import crypto from 'crypto'
import { SignOptions, sign } from 'jsonwebtoken'
import type { NextApiRequest, NextApiResponse } from 'next'
export async function POST(req: Request) {
    console.log('on_ramp_coinbase API Hit')
    const requestData = await req.json()

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
            // @ts-expect-error
            nonce: crypto.randomBytes(16).toString('hex'),
        },
    }

    const jwt = sign(payload, key_secret, signOptions)

    const body = {
        destination_wallets: [
            {
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
    const data = await response.json()
    console.log('Data:', data)
    if (data.message) {
        console.error('Error:', data.message)
        return NextResponse.json({ message: data.message }, { status: 500 })
    } else {
        // Success

        const onRampUrl = generateOnRampURL({
            sessionToken: data.token,
            destinationWallets: [{ address: address, assets: [chainName] }],
            theme: 'light',
        })

        return NextResponse.json({ onRampUrl }, { status: 200 })
    }
}

const constructURL = (token: string) => {
    return `https://pay.coinbase.com/buy/select-asset?sessionToken=${token}`
}
