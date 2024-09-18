'use client'

import Divider from '@/app/_components/divider'
import { formatAddress } from '@/app/_lib/utils/addresses'
import Page from '@/components/page'
import Section from '@/components/section'
import { inter } from '@/lib/utils/fonts'
import { useWallets } from '@privy-io/react-auth'
import _ from 'lodash'
import Image from 'next/image'
import Link from 'next/link'
import OnRampCoinbaseButton from '../../_components/onramps/onramp-coinbase'
import ClaimablePoolRow from '../../claim-winning/_components/claimable-pool-row'

const Send = () => {
    const { profileImageUrl, poolIdsToClaimFrom } = {
        profileImageUrl: '',
        poolIdsToClaimFrom: ['1', '2', '3'],
    }
    const { wallets } = useWallets()

    const onClaimAllButtonClicked = () => {
        console.log('claim all button clicked')
    }

    return (
        <Page>
            <Section>
                <div className={`mt-20 flex min-h-screen w-full justify-center ${inter.className}`}>
                    <div className='flex w-full flex-col space-y-4 pb-8'>
                        <div className='flex w-full flex-col items-center justify-center space-y-4'>
                            {profileImageUrl && (
                                <Image
                                    className='z-0 aspect-square w-40 rounded-full object-cover'
                                    src={profileImageUrl}
                                    alt='avatar'
                                    width={160}
                                    height={160}
                                />
                            )}
                            {!_.isEmpty(wallets?.[0]?.address) && (
                                <h3 className='font-medium'>{formatAddress(wallets?.[0]?.address)}</h3>
                            )}
                        </div>
                        <div className='flex justify-center'>
                            <Link
                                className='barForeground w-full rounded-full bg-black px-8 py-2 text-center text-white'
                                href='/edit-user-profile'>
                                Edit Profile
                            </Link>
                        </div>
                        <div className='flex justify-center'>
                            <OnRampCoinbaseButton />
                        </div>
                        <div className={`cardBackground flex w-full flex-col rounded-3xl p-6 md:space-y-10 md:p-10`}>
                            <h2 className='font-medium'>Claimable</h2>
                            <Divider />
                            {poolIdsToClaimFrom?.map((poolId: string) => {
                                return <ClaimablePoolRow poolId={poolId.toString()} key={poolId.toString()} />
                            })}
                        </div>
                    </div>
                </div>
                <div className='fixed bottom-5 left-1/2 w-full max-w-screen-md -translate-x-1/2 px-6 md:bottom-6'>
                    <button
                        type='button'
                        // TODO: "focus:shadow-outline" was added but it does not exist
                        className='h-12 w-full rounded-full px-4 py-2 font-bold text-white focus:outline-none md:h-16 md:text-2xl'
                        onClick={onClaimAllButtonClicked}>
                        Claim All
                    </button>
                </div>
            </Section>
        </Page>
    )
}

export default Send
