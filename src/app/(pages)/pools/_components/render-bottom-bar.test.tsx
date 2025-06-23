import MainWrapper from '@/components/main-wrapper'
import { Providers } from '@/providers'
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import RenderBottomBar from './render-bottom-bar'

import BottomBar from '@/app/@bottombar/default'

// TODO: Fix this test, now we get the admin status from the server, so we need to mock the server
describe('RenderBottomBar', () => {
    it.todo('should render the "Create Pool" button when user is admin', () => {
        const container = render(
            <Providers cookie={null}>
                <MainWrapper>
                    <RenderBottomBar />
                </MainWrapper>
                <BottomBar />
            </Providers>,
        )
        const button = container.getByTestId('create-pool-button')
        expect(button).toBeVisible()
    })

    it.todo('should not render the "Create Pool" button when user is not admin', () => {
        const { queryByTestId } = render(
            <Providers cookie={null}>
                <MainWrapper>
                    <RenderBottomBar />
                </MainWrapper>
                <BottomBar />
            </Providers>,
        )
        const button = queryByTestId('create-pool-button')
        expect(button).not.toBeInTheDocument()
    })
})
