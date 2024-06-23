import frog from '@/../public/images/frog.png'
import Container from './container'
import PoolCardRow from './pool-card-row'
import SectionContent from './section-content'
import SectionTitle from './section-title'

const mockClaimablePrizes = [
    { name: 'Pool Poker Party', prize: '250 USD', result: 'winner', image: frog.src },
    { name: 'EthCC Founders Basket', prize: '75 USD', result: 'winner', image: frog.src },
    { name: 'Aleo learn2earn Brussels 2024', prize: '60 USD', result: 'winner', image: frog.src },
]

export default function ClaimablePrizesList() {
    return (
        <Container>
            <SectionTitle />
            <SectionContent>
                {mockClaimablePrizes.map((pool, index) => (
                    <PoolCardRow key={index} {...pool} />
                ))}
            </SectionContent>
        </Container>
    )
}
