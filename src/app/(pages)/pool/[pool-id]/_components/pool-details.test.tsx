import { getByTestId, queryByTestId, render, screen, waitFor } from '@testing-library/react'
import { Providers } from '@/app/_client/providers'
import '@testing-library/jest-dom'
import MainContentWrapper from '@/app/_components/main-wrapper'

import BottomBar from '@/app/@bottombar/default'
import PoolDetails from './pool-details'
import { POOLSTATUS, type PoolDetailsDTO } from '../_lib/definitions'

// Mock the 'server-only' module
vi.mock('server-only', () => {
    return {
        __esModule: true,
        default: () => {
            // You can add a console.log here to see if this gets called
            console.log('server-only mock called')
            return null
        },
    }
})

describe('PoolDetailsTest', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it('should show progressbar when pool has not ended', async () => {
        let pool: PoolDetailsDTO = {
            numParticipants: 1,
            price: 1,
            participants: [],
            name: 'test',
            imageUrl: 'test',
            startDate: new Date().toDateString(),
            endDate: new Date().toDateString(),
            hostName: 'test',
            claimableAmount: 1,
            tokenSymbol: 'test',
            contractId: BigInt(1),
            status: POOLSTATUS.STARTED,
            goal: 1,
            poolBalance: 1,
            description: 'test description',
            termsUrl: 'http://terms.com',
            codeOfConductUrl: 'http://terms.com',
            requiredAcceptance: false,
            tokenDecimals: 18,
            progress: 1,
            softCap: 1,
        }

        const { queryByTestId } = render(
            <Providers cookie={null}>
                <MainContentWrapper>
                    <PoolDetails pool={pool} />
                </MainContentWrapper>
                <BottomBar />
            </Providers>,
        )
        const poolDetailsProgress = queryByTestId('pool-details-progress')
        expect(poolDetailsProgress).toBeVisible()
    })

    it('should not render progress bar when pool has ended', () => {
        let pool: PoolDetailsDTO = {
            numParticipants: 1,
            price: 1,
            participants: [],
            name: 'test',
            imageUrl: 'test',
            startDate: new Date().toDateString(),
            endDate: new Date().toDateString(),
            hostName: 'test',
            claimableAmount: 1,
            tokenSymbol: 'test',
            contractId: BigInt(1),
            status: POOLSTATUS.ENDED,
            goal: 1,
            poolBalance: 1,
            description: 'test description',
            termsUrl: 'http://terms.com',
            codeOfConductUrl: 'http://terms.com',
            tokenDecimals: 18,
            progress: 1,
            softCap: 1,
            requiredAcceptance: false,
        }
        const { queryByTestId } = render(
            <Providers cookie={null}>
                <MainContentWrapper>
                    <PoolDetails pool={pool} />
                </MainContentWrapper>
                <BottomBar />
            </Providers>,
        )
        // const button = queryByTestId('create-pool-button')
        // expect(button).not.toBeInTheDocument()
        const poolDetailsProgress = queryByTestId('pool-details-progress')
        expect(poolDetailsProgress).not.toBeVisible()
    })
})
