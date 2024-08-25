import { getByTestId, render, screen, waitFor } from '@testing-library/react'
import RenderBottomBar from './render-bottom-bar'
import { Providers } from '@/app/pwa/_client/providers'
import '@testing-library/jest-dom'
import MainContentWrapper from '@/app/pwa/_components/main-wrapper'

import BottomBar from '@/app/pwa/@bottombar/default'

describe('RenderBottomBar', () => {
    it('should render the "Create Pool" button when user is admin', async () => {
        let isAdmin = true
        const container = render(
            <Providers>
                <MainContentWrapper>
                    <RenderBottomBar isAdmin={isAdmin} />
                </MainContentWrapper>
                <BottomBar />
            </Providers>,
        )
        const button = container.getByTestId('create-pool-button')
        expect(button).toBeVisible()
    })

    it('should not render the "Create Pool" button when user is not admin', () => {
        let isAdmin = false
        const { queryByTestId } = render(
            <Providers>
                <MainContentWrapper>
                    <RenderBottomBar isAdmin={isAdmin} />
                </MainContentWrapper>
                <BottomBar />
            </Providers>,
        )
        const button = queryByTestId('create-pool-button')
        expect(button).not.toBeInTheDocument()
    })
})
