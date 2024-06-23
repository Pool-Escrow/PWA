import 'server-only'

import type { Database } from '@/types/db'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export function createServiceClient() {
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase URL or service key')
    }

    const cookieStore = cookies()

    return createServerClient<Database>(supabaseUrl, supabaseServiceKey, {
        cookies: {
            get(name: string) {
                return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: ResponseCookie) {
                try {
                    cookieStore.set(name, value, options)
                } catch (error) {
                    // The `set` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                }
            },
            remove(name: string, options: ResponseCookie) {
                try {
                    cookieStore.set(name, '', options)
                } catch (error) {
                    // The `delete` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                }
            },
        },
    })
}
