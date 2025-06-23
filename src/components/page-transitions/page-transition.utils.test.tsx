import { act, render } from '@testing-library/react'
import { vi } from 'vitest'
import PageTransitionEffect from './page-transition'

const mockUseFrozenRouter = vi.fn()
const mockGetTransitionProps = vi.fn()

export const setupTest = (_initialRoute: string, _transitionProps: Record<string, string | number>) => {
    // Configura los mocks antes de importar el componente que los usa
    vi.mock('./frozen-router', async importActual => {
        const actual = await importActual()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
        return { ...(actual as any), useFrozenRouter: mockUseFrozenRouter }
    })

    vi.mock('./get-transition-props', async importActual => {
        const actual = await importActual()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
        return { ...(actual as any), getTransitionProps: mockGetTransitionProps }
    })

    return { useFrozenRouter: mockUseFrozenRouter, getTransitionProps: mockGetTransitionProps }
}

export const renderWithTransition = async (initialContent: string, newContent: string) => {
    const { rerender, container } = render(
        <PageTransitionEffect>
            <div data-testid='content'>{initialContent}</div>
        </PageTransitionEffect>,
    )

    act(() => {
        rerender(
            <PageTransitionEffect>
                <div data-testid='content'>{newContent}</div>
            </PageTransitionEffect>,
        )
    })

    // Esperar a que la animación termine
    await new Promise(resolve => setTimeout(resolve, 350))

    return container
}
