import Title from '../../_components/title'
import Balance from './_components/balance/balance'
import UserInfo from './_components/user-info/user-info'
import { getAddressBalanceAction, getUserInfoAction } from './actions'
import { ClaimablePrizes } from './claim-winning/_components'

export default async function ProfilePage() {
    // TODO: Merge data from server (less requests)
    const [userInfoResult] = await getUserInfoAction()
    const [balanceResult] = await getAddressBalanceAction()

    return (
        <div className='space-y-[0.94rem] bg-white p-2'>
            <Title title='User Profile' />
            <UserInfo initialUserInfo={userInfoResult} />
            <Balance initialBalance={balanceResult} />
            <ClaimablePrizes />
        </div>
    )
}
