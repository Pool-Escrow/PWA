import { getUserInfoAction } from '../actions'
import ProfileForm from '../new/_components/profile-form'

export default async function NewProfilePage() {
    const { data: userData, error } = await getUserInfoAction()

    if (error) {
        console.error(error)
        return <>Error loading user data</>
    }

    if (userData && 'needsRefresh' in userData) {
        return <>Loading...</>
    }

    return <ProfileForm userInfo={userData} />
}
