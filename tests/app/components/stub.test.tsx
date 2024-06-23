import * as tailwindUtils from '@/lib/utils/tailwind'
import { describe, expect, it, vi } from 'vitest'

// Mock the cn function for the first test
vi.mock('@/lib/utils/tailwind', () => ({
    cn: vi.fn(),
}))

describe('Stub Tests', () => {
    it('should call mocked cn function', () => {
        // Define a function that calls cn
        const testFunction = () => {
            tailwindUtils.cn('test-class')
        }

        // Call the test function
        testFunction()

        // Check if cn was called
        expect(tailwindUtils.cn).toHaveBeenCalled()
    })

    it('should spy on cn function', async () => {
        // Reset modules to use the real implementation
        vi.resetModules()

        // Import the real module
        const realTailwindUtils = await import('@/lib/utils/tailwind')

        // Spy on the cn function
        const cnSpy = vi.spyOn(realTailwindUtils, 'cn')

        // Define a function that calls cn
        const testFunction = () => {
            realTailwindUtils.cn('spy-test-class', 'another-class')
        }

        // Call the test function
        testFunction()

        // Check if cn was called with the correct arguments
        expect(cnSpy).toHaveBeenCalledWith('spy-test-class', 'another-class')

        // Restore the original implementation
        cnSpy.mockRestore()
    })
})
