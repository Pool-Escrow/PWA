'use client'

import frog from '@/../public/images/frog.png'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/_components/ui/avatar'
import { Container, ExternalLinkIcon } from 'lucide-react'
import { useAccount } from 'wagmi'
import SectionContent from '../../claim-winning/_components/section-content'

export default function ProfileHeader() {
    const account = useAccount()

    if (!account.address) {
        console.log('No account address found in the profile!')
    }

    const truncatedAddress = account.address?.slice(0, 6) + '...' + account.address?.slice(-4)
    return (
        <Container>
            <SectionContent>
                <div className='mx-4 flex flex-row justify-between'>
                    <div className='flex flex-row gap-x-4'>
                        <Avatar className='size-[73px] cursor-pointer' aria-label='User Avatar'>
                            <AvatarImage alt='User Avatar' src={frog.src} />
                            <AvatarFallback className='bg-[#d9d9d9]' />
                        </Avatar>
                        <div className='flex flex-col justify-center'>
                            <p className='text-[16pt] font-medium text-[#0B0B0B]'>Frog User Name</p>
                            <p className='text-[12pt] text-[#5472E9]'>{truncatedAddress}</p>
                        </div>
                    </div>

                    <div className='flex flex-row items-center justify-center'>
                        <a
                            title='View on BaseScan'
                            href={`https://sepolia.basescan.org/address/${account.address}`}
                            target='_blank'
                            rel='noopener noreferrer nofollow'>
                            <ExternalLinkIcon width={24} height={24} />
                        </a>
                    </div>
                </div>

                {/* <SponsoredTxn
                    text='Mint 1000 USDC'
                    targetAddress={dropletAddress[wagmi.config.state.chainId as ChainId]}
                    abi={dropletAbi}
                    functionName='mint'
                    args={[account.address, '1000000000000000000000']}
                />
                <OnrampStripe />
                <Unlimit email='dev@poolpary.cc' amount='10' purchaseCurrency='ETH' /> */}
            </SectionContent>
        </Container>
    )
}
