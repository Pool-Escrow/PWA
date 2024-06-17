import { Database } from '@/types/db'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function getSupabaseBrowserClient() {
	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error('Missing Supabase URL or anon key')
	}

	return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
