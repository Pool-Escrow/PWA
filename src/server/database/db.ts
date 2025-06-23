import 'server-only'

import { createSupabaseServerClient } from '@/lib/supabase'

let _db: ReturnType<typeof createSupabaseServerClient> | null = null

/**
 * Get the Supabase database client
 * This is lazy-loaded to prevent environment variable access during build time
 */
export function getDb() {
    if (!_db) {
        _db = createSupabaseServerClient()
    }
    return _db
}

/**
 * @deprecated Use getDb() instead for better lazy loading
 * Legacy db export for backward compatibility
 */
export const db = new Proxy({} as ReturnType<typeof createSupabaseServerClient>, {
    get(_target, prop, _receiver) {
        const dbInstance = getDb()
        const value = dbInstance[prop as keyof typeof dbInstance]

        // Bind methods to the correct context
        if (typeof value === 'function') {
            return value.bind(dbInstance)
        }

        return value
    },
    has(_target, prop) {
        const dbInstance = getDb()
        return prop in dbInstance
    },
    ownKeys(_target) {
        const dbInstance = getDb()
        return Reflect.ownKeys(dbInstance)
    },
    getOwnPropertyDescriptor(_target, prop) {
        const dbInstance = getDb()
        return Reflect.getOwnPropertyDescriptor(dbInstance, prop)
    },
})
