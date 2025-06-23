import { createSupabaseBrowserClient } from '@/lib/supabase'
import type { Database } from '@/types/db'
import type { SupabaseClient } from '@supabase/supabase-js'

// We create the Supabase client once and reuse it across hook/component calls.
// This avoids spawning multiple websocket connections and excessive HTTP requests
// that can indirectly contribute to RPC rate-limit issues due to overall network
// saturation.
let browserClientSingleton: SupabaseClient<Database> | null = null

export function getSupabaseBrowserClient() {
    if (!browserClientSingleton) {
        browserClientSingleton = createSupabaseBrowserClient()
    }

    return browserClientSingleton
}
