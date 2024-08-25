import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(__dirname, '.env.local') })
// runs a clean after each test case (e.g. clearing jsdom)
afterEach(() => {
    cleanup()
})
