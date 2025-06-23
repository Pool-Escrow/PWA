'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { usePrivy } from '@privy-io/react-auth'

export default function MainPageLoginButton() {
    const { login } = useAuth()
    const { ready, authenticated } = usePrivy()

    if (!ready || authenticated) return null

    return (
        <div className='main-home-login-button fixed inset-x-0 bottom-0 z-50 rounded-t-[2rem] bg-gradient-to-b from-white/80 to-white backdrop-blur-lg pb-safe-or-6'>
            <div className='mx-auto max-w-screen-md pt-[15px] px-safe-or-6'>
                <Button
                    className='pool-button mb-3 h-[46px] w-full rounded-[2rem] px-4 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'
                    onClick={login}>
                    Login
                </Button>
            </div>
        </div>
    )
}
