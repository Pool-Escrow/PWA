'use client'

import { useWallets } from '@privy-io/react-auth'
import Container from '../../../claim-winning/_components/container'
import SectionContent from '../../../claim-winning/_components/section-content'

export default function WalletAccountSection() {
    const { wallets } = useWallets()
    console.log(wallets)
    const address = wallets?.[0]?.address
    return (
        <Container>
            <SectionContent>
                <div className='mx-2 flex flex-col justify-center'>
                    <h3 className='text-[11pt] font-semibold text-black'>Connected Account</h3>
                    <h3 className='text-[10pt] font-bold text-[#2785EA]'>
                        <span>{address}</span>
                    </h3>
                </div>
            </SectionContent>
        </Container>
    )
}
