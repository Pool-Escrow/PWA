import { createBrowserClient } from '@supabase/ssr'

const supabaseBrowserClient = createBrowserClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
export function getSupabaseBrowserClient() {
	// Create a supabase client on the browser with project's credentials
	return supabaseBrowserClient
}
