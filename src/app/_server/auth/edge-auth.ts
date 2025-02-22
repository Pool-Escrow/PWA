import type { JWTPayload } from 'jose'
import { importSPKI, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const PRIVY_PUBLIC_KEY = process.env.PRIVY_PUBLIC_KEY
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID

export async function verifyAuthInEdge(): Promise<JWTPayload | null> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('privy-token')?.value

        if (!token || !PRIVY_PUBLIC_KEY || !PRIVY_APP_ID) {
            console.debug('[edge-auth] Missing token or env vars:', {
                hasToken: !!token,
                hasPublicKey: !!PRIVY_PUBLIC_KEY,
                hasAppId: !!PRIVY_APP_ID,
            })
            return null
        }

        const verificationKey = await importSPKI(PRIVY_PUBLIC_KEY, 'ES256')
        const verified = await jwtVerify(token, verificationKey, {
            issuer: 'privy.io',
            audience: PRIVY_APP_ID,
        })

        return verified.payload
    } catch (error) {
        if (error instanceof Error) {
            console.error('[edge-auth] Verification failed:', error.message)
        }
        return null
    }
}
