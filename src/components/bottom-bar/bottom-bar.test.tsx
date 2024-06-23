import { useBottomBarStore } from '@/providers/bottom-bar.provider'
import { render, screen } from '@testing-library/react'
import { Mock } from 'vitest'
import BottomBar from './bottom-bar'

// Mock the useBottomBarStore hook
vi.mock('@/providers/bottom-bar.provider', () => ({
    useBottomBarStore: vi.fn(),
}))

describe('BottomBar', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it.only('should render correctly when visible', () => {
        // Set up the mock return value
        ;(useBottomBarStore as Mock).mockImplementation(selector =>
            selector({
                isVisible: true,
                content: <div>Test Content</div>,
            }),
        )

        render(<BottomBar />)
        const bottomBarElement = screen.getByRole('navigation')
        expect(bottomBarElement).toBeInTheDocument()
        expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should not render when not visible', () => {
        // Set up the mock return value
        ;(useBottomBarStore as Mock).mockImplementationOnce(selector =>
            selector({
                isVisible: false,
                content: null,
            }),
        )

        render(<BottomBar />)
        const bottomBarElement = screen.queryByRole('navigation')
        expect(bottomBarElement).not.toBeInTheDocument()
    })
})
