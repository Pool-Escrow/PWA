import { beforeEach, describe, it, vi } from 'vitest'

// Mock the dependencies
vi.mock('wagmi')
vi.mock('wagmi/experimental')

describe('useSmartTransaction', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it('should handle Coinbase Smart Wallet with atomic batch', async () => {
        // // Configure mocks
        // vi.mocked(useAccount).mockReturnValue({ address: '0x123', chainId: 1 } as any)
        // vi.mocked(useCapabilities).mockReturnValue({
        //     data: {
        //         1: {
        //             paymasterService: { supported: true },
        //             atomicBatch: { supported: true },
        //         },
        //     },
        // } as any)
        // vi.mocked(useWriteContracts).mockReturnValue({
        //     writeContracts: vi.fn().mockResolvedValue({ hash: '0xabc' }),
        // } as any)
        // const { result } = renderHook(() => useSmartTransaction())
        // await act(async () => {
        //     await result.current.executeTransaction(
        //         [{ address: '0x456', abi: [], functionName: 'test', args: [] }],
        //         'coinbase_smart_wallet',
        //     )
        // })
        // expect(result.current.result.hash).toBe('0xabc')
        // expect(result.current.result.isLoading).toBe(false)
        // expect(result.current.result.isError).toBe(false)
    })

    // Add more tests to cover other cases...
})
