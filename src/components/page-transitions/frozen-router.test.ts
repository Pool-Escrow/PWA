// import { renderHook } from '@testing-library/react-hooks'
import { vi } from 'vitest'

vi.mock('next/navigation', () => ({
    usePathname: vi.fn(),
}))

describe('useFrozenRouter', () => {
    // it('should call useFrozenRouter and track calls', () => {
    //     const mockPathname = '/initial-path'
    //     const setState = vi.fn()
    //     const useStateMock = init => [init, setState]
    //     vi.spyOn(React, 'useState').mockImplementation(useStateMock)
    //     const { result } = renderHook(() => useFrozenRouter())
    //     expect(result.current).toBe(mockPathname)
    //     // expect(usePathname).toHaveBeenCalled()
    //     // expect(setState).not.toHaveBeenCalled()
    //     // Simula un cambio en el pathname
    //     usePathname.mockReturnValue('/new-path')
    //     result.rerender()
    //     expect(setState).toHaveBeenCalledWith('/new-path')
    // })
})
