import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFrozenRouter } from './frozen-router'
import PageTransitionEffect from './page-transition'
import { renderWithTransition, setupTest } from './page-transition.utils.test'

describe('PageTransitionEffect', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders children', async () => {
        // Arrange
        const initialRoute = '/pools'
        const transitionProps = { x: 0, y: 0 }
        await setupTest(initialRoute, transitionProps)

        render(
            <PageTransitionEffect>
                <div>Test Content</div>
            </PageTransitionEffect>,
        )
        expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('applies correct transition props and updates content', async () => {
        // Arrange
        const initialRoute = '/pools'
        const newRoute = '/my-pools'
        const transitionProps = { x: '-100%', y: 0 }
        const { getTransitionProps, useFrozenRouter } = await setupTest(initialRoute, transitionProps)

        // Act
        const container = await renderWithTransition(`${initialRoute} Content`, `${newRoute} Content`)

        // Assert
        const contentDiv = screen.getByTestId('content')
        expect(contentDiv).toHaveTextContent(`${newRoute} Content`)
        expect(screen.queryByText(`${initialRoute} Content`)).not.toBeInTheDocument()

        const motionDiv = container.querySelector('div[style]')
        expect(motionDiv).toHaveStyle('transform: none')
    })

    // it('calls getTransitionProps on initial render', async () => {
    //     // Arrange
    //     const initialRoute = '/pools'
    //     const transitionProps = { x: 0, y: 0 }
    //     // const { getTransitionProps, useFrozenRouter } = await setupTest(initialRoute, transitionProps)}

    //     const useFrozenRouterMock = vi.spyOn(frozen - router, 'useFrozenRouter')

    //     // Act
    //     render(
    //         <PageTransitionEffect>
    //             <div>Test Content</div>
    //         </PageTransitionEffect>,
    //     )

    //     // Assert
    //     expect(useFrozenRouter).toHaveBeenCalled()
    //     expect(getTransitionProps).toHaveBeenCalledTimes(1)
    //     expect(getTransitionProps).toHaveBeenCalledWith({ to: initialRoute })
    // })

    // it.skip('updates prevPath and applies transition on route change', async () => {
    //     useFrozenRouterMock.mockReturnValueOnce('/pools').mockReturnValueOnce('/my-pools')
    //     getTransitionPropsMock.mockReturnValue({ x: '-100%', y: 0 })

    //     const { rerender } = render(
    //         <PageTransitionEffect>
    //             <div>Pool Content</div>
    //         </PageTransitionEffect>,
    //     )

    //     await act(async () => {
    //         rerender(
    //             <PageTransitionEffect>
    //                 <div>My Pool Content</div>
    //             </PageTransitionEffect>,
    //         )
    //     })

    //     expect(getTransitionPropsMock).toHaveBeenCalledWith({
    //         from: '/pools',
    //         to: '/my-pools',
    //     })
    // })

    // it.skip('does not duplicate components after route change transition', async () => {
    //     useFrozenRouterMock.mockReturnValueOnce('/pools').mockReturnValueOnce('/my-pools')
    //     getTransitionPropsMock.mockReturnValue({ x: '-100%', y: 0 })

    //     const { rerender, container } = render(
    //         <PageTransitionEffect>
    //             <div>Pool Content</div>
    //         </PageTransitionEffect>,
    //     )

    //     await act(async () => {
    //         rerender(
    //             <PageTransitionEffect>
    //                 <div>My Pool Content</div>
    //             </PageTransitionEffect>,
    //         )
    //     })

    //     // Esperamos a que la animación termine
    //     await new Promise(resolve => setTimeout(resolve, 350)) // 350ms para dar margen

    //     const contentDivs = container.querySelectorAll('div:not([style])')
    //     expect(contentDivs.length).toBe(1)
    //     expect(screen.getByText('My Pool Content')).toBeInTheDocument()
    //     expect(screen.queryByText('Pool Content')).not.toBeInTheDocument()
    // })
})
