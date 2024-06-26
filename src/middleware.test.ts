// middleware.test.ts
import { middleware } from './middleware'
import { NextResponse, NextRequest } from 'next/server'
import { getWalletAddress, isAdmin } from './lib/server/auth'
import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('./lib/server/auth', () => ({
    getWalletAddress: vi.fn(),
    isAdmin: vi.fn(),
}))

vi.mock('next/server', async () => {
    const actual = await vi.importActual('next/server')
    return {
        ...actual,
        NextResponse: {
            ...(actual.NextResponse as any),
            redirect: vi.fn().mockImplementation(url => ({ type: 'redirect', url: url.toString() })),
            next: vi.fn().mockImplementation(() => ({ type: 'next' })),
        },
    }
})

describe('Middleware', () => {
    let req: NextRequest

    beforeEach(() => {
        req = new NextRequest(new URL('https://example.com'), {
            headers: {
                cookie: 'privy-token=test-token',
            },
        })
        vi.clearAllMocks()
    })

    it('should allow access to open routes without authentication', async () => {
        req.nextUrl.pathname = '/pools'
        const response = await middleware(req)
        expect(response?.type).toBe('next')
    })

    it('should allow access to dynamic pool routes without authentication', async () => {
        req.nextUrl.pathname = '/pool/123'
        const response = await middleware(req)
        expect(response?.type).toBe('next')
    })

    it('should redirect to /pools if no auth token is present for protected routes', async () => {
        req.nextUrl.pathname = '/protected'
        req.cookies.delete('privy-token')
        const response = await middleware(req)
        expect(response?.type).toBe('redirect')
        expect(response?.url).toContain('/pools')
    })

    it('should allow access to protected routes if auth token is present', async () => {
        req.nextUrl.pathname = '/protected'
        vi.mocked(getWalletAddress).mockResolvedValue('0x123')
        const response = await middleware(req)
        expect(response?.type).toBe('next')
    })

    it("should redirect to /pools if user tries to access another user's profile", async () => {
        req.nextUrl.pathname = '/profile/0x123'
        vi.mocked(getWalletAddress).mockResolvedValue('0x456')
        const response = await middleware(req)
        expect(response?.type).toBe('redirect')
        expect(response?.url).toContain('/pools')
    })

    it("should allow access to user's own profile", async () => {
        req.nextUrl.pathname = '/profile/0x123'
        vi.mocked(getWalletAddress).mockResolvedValue('0x123')
        const response = await middleware(req)
        expect(response?.type).toBe('next')
    })

    it('should redirect to /pools if non-admin tries to access /pool/new', async () => {
        req.nextUrl.pathname = '/pool/new'
        vi.mocked(getWalletAddress).mockResolvedValue('0x123')
        vi.mocked(isAdmin).mockResolvedValue(false)

        const response = await middleware(req)

        console.log('Middleware response:', response)

        expect(response).toBeDefined()
        expect(response?.type).toBe('redirect')
        expect(response?.url).toContain('/pools')
    })

    it('should allow access to /pool/new for admin users', async () => {
        req.nextUrl.pathname = '/pool/new'
        vi.mocked(getWalletAddress).mockResolvedValue('0x123')
        vi.mocked(isAdmin).mockResolvedValue(true)
        const response = await middleware(req)
        expect(response?.type).toBe('next')
    })

    it('should not interfere with static assets', async () => {
        const paths = [
            '/_next/static/chunks/main.js',
            '/_next/image/optimize.png',
            '/favicon.ico',
            '/images/some-image.png',
            '/manifest.json',
        ]

        for (const path of paths) {
            req.nextUrl.pathname = path
            const response = await middleware(req)
            expect(response?.type).toBe('next')
        }
    })

    it('should not interfere with API routes', async () => {
        req.nextUrl.pathname = '/api/some-endpoint'
        const response = await middleware(req)
        expect(response?.type).toBe('next')
    })

    it('should handle requests to manifest.json', async () => {
        req.nextUrl.pathname = '/manifest.json'
        const response = await middleware(req)
        expect(response?.type).toBe('next')
    })
})
