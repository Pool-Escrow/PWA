'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAccount } from 'wagmi'
import frog from '@/../public/images/frog.png'
import { useUserStore } from '@/stores/profile.store'

import SponsoredTxn from '@/components/sponsored-txn/sponsored-txn-CoinbaseSmartWallet'
import { dropletAbi, dropletAddress } from '@/types/droplet'
import { wagmi } from '@/providers/configs'
import { useRouter } from 'next/navigation'
import { Route } from 'next'
import OnrampStripe from '@/components/onramps/Stripe'
import Unlimit from '@/components/onramps/unlimit'

import { useEffect, useState } from 'react'
import Container from '@/components/common/other/container'
import SectionContent from '@/components/common/other/section-content'
import { useUserDetailsDB } from '@/lib/hooks/use-user-details-db'
import externalLinkIcon from '@/../public/images/external_link_icon.svg'
import Image from 'next/image'

export default function ProfileHeader() {
    const account = useAccount()
    const { profile } = useUserStore()
    const router = useRouter()

    if (!account.address) {
        // router.push('/' as Route)
        console.log('No account address found in the profile!')
    }

    const truncatedAddress = account.address?.slice(0, 6) + '...' + account.address?.slice(-4)
    const { userDetailsDB, isLoading, error } = useUserDetailsDB(account.address as string)
    return (
        <Container>
            <SectionContent>
                <div className='mx-4 flex flex-row justify-between'>
                    <div className='flex flex-row gap-x-4'>
                        <Avatar className='size-[73px] cursor-pointer' aria-label='User Avatar'>
                            <AvatarImage alt='User Avatar' src={profile?.avatar || frog.src} />
                            <AvatarFallback className='bg-[#d9d9d9]' />
                        </Avatar>
                        <div className='flex flex-col justify-center'>
                            <p className='text-[16pt] font-medium text-[#0B0B0B]'>
                                {userDetailsDB?.userDetail?.displayName}
                            </p>
                            <p className='text-[12pt] text-[#5472E9]'>{truncatedAddress}</p>
                        </div>
                    </div>

                    <div className='flex flex-row items-center justify-center'>
                        <a
                            href={`https://etherscan.io/address/${account.address}`}
                            target='_blank'
                            rel='noopener noreferrer nofollow'>
                            <Image src={externalLinkIcon} alt='Link to etherscan' width={24} height={24} />
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
