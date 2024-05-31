import type { Database } from '@/types/db'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { safeLoadEnv } from '../environment'

const supabaseUrl = safeLoadEnv('NEXT_PUBLIC_SUPABASE_URL')
const supabaseServiceKey = safeLoadEnv('SERVICE_ROLE')

export function createServiceClient() {
	const cookieStore = cookies()

	return createServerClient<Database>(supabaseUrl, supabaseServiceKey, {
		cookies: {
			get(name: string) {
				return cookieStore.get(name)?.value
			},
			set(name: string, value: string, options: CookieOptions) {
				try {
					cookieStore.set({ name, value, ...options })
				} catch (error) {
					// The `set` method was called from a Server Component.
					// This can be ignored if you have middleware refreshing
					// user sessions.
				}
			},
			remove(name: string, options: CookieOptions) {
				try {
					cookieStore.set({ name, value: '', ...options })
				} catch (error) {
					// The `delete` method was called from a Server Component.
					// This can be ignored if you have middleware refreshing
					// user sessions.
				}
			},
		},
	})
}
