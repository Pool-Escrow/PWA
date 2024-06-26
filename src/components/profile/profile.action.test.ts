import { vi, describe, it, expect, beforeEach } from 'vitest'
import { handleUserAuthentication } from './profile.action'

// Mock the complete module
vi.mock('@/lib/server/db', () => ({
    createServiceClient: vi.fn(() => ({
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(),
                })),
            })),
            insert: vi.fn(() => ({
                single: vi.fn(),
            })),
            update: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(),
                })),
            })),
        })),
    })),
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

// Import the mocked module
import * as dbModule from '@/lib/server/db'

describe('handleUserAuthentication', () => {
    let mockSupabase: any

    beforeEach(() => {
        vi.clearAllMocks()
        mockSupabase = (dbModule.createServiceClient as any)()
    })

    it('should handle new user in Privy and DB', async () => {
        // Simulate user not found in DB
        mockSupabase
            .from()
            .select()
            .eq()
            .single.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
        // Simulate new user insertion
        mockSupabase
            .from()
            .insert()
            .single.mockResolvedValueOnce({ data: { id: 1 }, error: null })

        const result = await handleUserAuthentication('privy123', '0x123', true)

        expect(result).toEqual({ redirect: '/participant/new', user: { id: 1 } })
        expect(mockSupabase.from).toHaveBeenCalledWith('users')
        expect(mockSupabase.from().insert).toHaveBeenCalledWith({
            privyId: 'privy123',
            walletAddress: '0x123',
            role: 'user',
        })
    })

    it('should handle existing user in Privy and DB', async () => {
        mockSupabase
            .from()
            .select()
            .eq()
            .single.mockResolvedValueOnce({ data: { id: 1, walletAddress: '0x123' }, error: null })

        const result = await handleUserAuthentication('privy123', '0x123', false)

        expect(result).toEqual({ redirect: '/', user: { id: 1, walletAddress: '0x123' } })
        expect(mockSupabase.from).toHaveBeenCalledWith('users')
        expect(mockSupabase.from().select).toHaveBeenCalled()
        expect(mockSupabase.from().select().eq).toHaveBeenCalledWith('privyId', 'privy123')
    })

    it('should handle user existing in Privy but not in DB', async () => {
        // Simulate user not found in DB
        mockSupabase
            .from()
            .select()
            .eq()
            .single.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })
        // Simulate new user insertion
        mockSupabase
            .from()
            .insert()
            .single.mockResolvedValueOnce({ data: { id: 1 }, error: null })

        const result = await handleUserAuthentication('privy123', '0x123', false)

        expect(result).toEqual({ redirect: '/participant/new', user: { id: 1 } })
        expect(mockSupabase.from).toHaveBeenCalledWith('users')
        expect(mockSupabase.from().insert).toHaveBeenCalledWith({
            privyId: 'privy123',
            walletAddress: '0x123',
            role: 'user',
        })
    })
})
