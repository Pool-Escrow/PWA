// import { getAllIndicesMatching, getRowsByColumnValue, getValuesFromIndices } from '@/lib/utils/database'

interface ClaimablePoolRowProps {
    poolId: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ClaimablePoolRow: React.FC<ClaimablePoolRowProps> = ({ poolId }) => {
    // const { wallets } = useWallets()

    // const { data: poolData } = useQuery({
    //     queryKey: ['fetchAllPoolDataFromDB', poolId],
    //     queryFn: fetchAllPoolDataFromDB,
    //     enabled: !_.isEmpty(poolId),
    // })

    // const { data: poolWinnersDetails } = useQuery({
    //     queryKey: ['fetchWinnersDetailsFromSC', poolId?.toString() ?? ' '],
    //     queryFn: fetchWinnersDetailsFromSC,
    //     enabled: !!poolId,
    // })
    // const matchingAddressIndices = getAllIndicesMatching(poolWinnersDetails?.[0], wallets?.[0]?.address)
    // const userWonDetails = getValuesFromIndices(poolWinnersDetails?.[1], matchingAddressIndices)

    // const claimableDetails = getRowsByColumnValue(userWonDetails, 3, false)
    // const totalWinningAmount = userWonDetails?.reduce((acc: number, curr: any) => acc + curr[0], BigInt(0))

    return (
        <div className='flex flex-row space-x-4 py-4'>
            ClaimablePoolRow
            {/* <Image
                src={poolData?.poolImageUrl}
                className='flex size-14 rounded-xl object-cover'
                alt='avatar'
                width={56}
                height={56}
            /> */}
            <div className='flex flex-1 flex-col'>
                {/* <h4 className='text-lg font-medium'>{poolData?.poolDBInfo?.['pool_name'] ?? ` Pool Id ${poolId}`}</h4> */}
                <p className={`fontCheckedIn font-semibold`}>Winner</p>
            </div>
            {
                <div className='flex flex-row items-center justify-center space-x-2'>
                    <div>
                        {/* <Image className='size-6' src={circleTick.src} alt='circle-tick' height={24} width={24} /> */}
                    </div>
                    <div className='paidBackground fontCheckedIn rounded-2xl px-6 py-4 font-medium'>
                        {/* {ethers.formatEther(totalWinningAmount ?? 0).toString()} USD */}
                    </div>
                </div>
            }
        </div>
    )
}

export default ClaimablePoolRow
