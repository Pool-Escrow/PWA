import Title from '../../_components/title'
import Balance from '@/app/pwa/_components/balance/balance'
import UserInfo from './_components/user-info/user-info'
import { ClaimablePrizes } from './claim-winning/_components'

export default function ProfilePage() {
    return (
        <div className='space-y-[0.94rem] bg-white p-2'>
            <Title title='User Profile' />
            <UserInfo />
            <Balance color='#5472E9' />
            <ClaimablePrizes />
        </div>
    )
}
