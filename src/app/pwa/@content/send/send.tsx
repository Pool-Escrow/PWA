import Appbar from '@/components/appbar'
import Divider from '@/components/divider'
import Page from '@/components/page'
import { fetchClaimablePoolsFromSC, fetchUserDisplayForAddress, handleClaimWinnings } from '@/lib/api/clientAPI'
import frogImage from '@/../public/images/frog.png'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import _ from 'lodash'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import OnRampCoinbaseButton from '@/components/onRampButton'
import { useCookie } from '@/hooks/use-cookie'
import { getAllIndicesMatching, getValuesFromIndices } from '@/lib/utils/database'
import { toast } from 'sonner'
import Section from '@/components/common/layout/section'
import { inter } from '@/lib/utils/fonts'
import { formatAddress } from '@/lib/utils/addresses'
import ClaimablePoolRow from '@/components/common/other/claimable-pool-row'
import { Route } from 'next'

const Send = () => {
    const router = useRouter()
    const { ready, authenticated } = usePrivy()

    const { wallets } = useWallets()

    const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(`${frogImage.src}`)

    const queryClient = useQueryClient()

    const { data: profileData } = useQuery({
        queryKey: ['loadProfileImage', wallets?.[0]?.address],
        queryFn: fetchUserDisplayForAddress,
        enabled: wallets.length > 0,
    })

    const { data: claimablePoolsInfo } = useQuery({
        queryKey: ['fetchClaimablePoolsFromSC', wallets?.[0]?.address],
        queryFn: fetchClaimablePoolsFromSC,
        enabled: !!wallets?.[0]?.address,
    })
    const poolIds = claimablePoolsInfo?.[0]
    const poolsClaimed = claimablePoolsInfo?.[1]
    const { currentJwt } = useCookie()

    const poolIdIndices = getAllIndicesMatching(poolsClaimed, false)

    const poolIdsToClaimFrom = getValuesFromIndices(poolIds, poolIdIndices)

    const claimAllMutation = useMutation({
        mutationFn: handleClaimWinnings,
        onSuccess: () => {
            toast('Transaction Suceess', {
                description: 'You have claimed your winnings.',
            })
            console.log('claimWinningsMutation Success')
            queryClient.invalidateQueries({
                queryKey: ['fetchClaimablePoolsFromSC', wallets?.[0]?.address],
            })
        },
        onError: () => {
            console.log('claimMutation Error')
        },
    })

    const onClaimAllButtonClicked = () => {
        toast('Requesting Transaction/s', {
            description: 'Approve claim winnings',
        })
        claimAllMutation.mutate({
            params: [poolIdsToClaimFrom, wallets],
        })
    }

    useEffect(() => {
        if (ready && !authenticated) {
            router.push('/login' as Route)
        }

        for (var i = 0; i < wallets.length; i++) {
            console.log(`Wallet ${i} Address: ${wallets[i].address}`)
        }

        if (profileData?.profileImageUrl) {
            setProfileImageUrl(profileData?.profileImageUrl)
        }

        console.log('displayName', profileData)
    }, [profileData, ready, authenticated, router, wallets])

    return (
        <Page>
            <Appbar backRoute='/' pageTitle='User Profile' />
            <Section>
                <div className={`mt-20 flex min-h-screen w-full justify-center ${inter.className}`}>
                    <div className='flex w-full flex-col space-y-4 pb-8'>
                        <div className='flex w-full flex-col items-center justify-center space-y-4'>
                            {profileImageUrl && (
                                <Image
                                    className='center z-0 aspect-square w-40 rounded-full object-cover'
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
                                href={'/edit-user-profile' as Route}>
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
                <div className='fixed bottom-5 left-1/2 w-full max-w-screen-md -translate-x-1/2 transform px-6 md:bottom-6'>
                    <button
                        type='button'
                        className={`barForeground focus:shadow-outline h-12 w-full rounded-full px-4 py-2 font-bold text-white focus:outline-none md:h-16 md:text-2xl`}
                        onClick={onClaimAllButtonClicked}>
                        Claim All
                    </button>
                </div>
            </Section>
        </Page>
    )
}

export default Send
