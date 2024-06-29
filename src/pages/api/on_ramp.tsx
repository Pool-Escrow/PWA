import 'server-only'

import { getUser, verifyToken } from '@/lib/server/auth'
import { generateOnRampURL } from '@coinbase/cbpay-js'
import { WalletWithMetadata } from '@privy-io/react-auth'

import crypto from 'crypto'
import { SignOptions, sign } from 'jsonwebtoken'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const requestData = await req.body
    const { chainName, jwtString } = requestData

    let jwtAddress: string = '0x'
    let user
    try {
        const claims = await verifyToken(jwtString)
        if (claims === null) {
            throw new Error('Invalid JWT')
        }
        user = await getUser(claims!.userId)
        const walletWithMetadata = user?.linkedAccounts[0] as WalletWithMetadata
        jwtAddress = walletWithMetadata?.address?.toLowerCase()
        console.log('user', user)
        console.log('walletWithMetadata', walletWithMetadata)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to decode Jwt.' })
        return
    }

    const key_name = process.env.COINBASE_KEY_NAME
    const key_secret = process.env.COINBASE_KEY_SECRET

    if (!key_name || !key_secret) {
        console.error('Coinbase key name or secret not found')
        res.status(500).json({ error: 'Coinbase key' })
        return
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

    // const reqBody = JSON.parse(req.body)
    jwtAddress = user!.wallet!.address
    console.log('jwtAddress', jwtAddress)

    const body = {
        destination_wallets: [
            {
                address: jwtAddress,
                blockchains: ['base', 'ethereum'],
            },
        ],
    }

    fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { Authorization: 'Bearer ' + jwt },
    })
        .then(response => response.json())
        .then(json => {
            if (json.message) {
                console.error('Error:', json.message)
                res.status(500).json({ error: json.message })
            } else {
                // Success

                const onRampUrl = generateOnRampURL({
                    sessionToken: json.token,
                    destinationWallets: [{ address: jwtAddress, assets: [chainName] }],
                    theme: 'light',
                })

                res.status(200).json({ onRampUrl })
            }
        })
        .catch(error => {
            console.log('Caught error: ', error)
            res.status(500)
        })
}

const constructURL = (token: string) => {
    return `https://pay.coinbase.com/buy/select-asset?sessionToken=${token}`
}
