'use client'

import { getUserInfoAction } from '@/app/pwa/(pages)/profile/actions'
import ProfileForm from '@/app/pwa/(pages)/profile/new/_components/profile-form'
import { Modal } from '@/app/pwa/_components/ui/modal'
import { useEffect, useState } from 'react'

export default function EditProfileModal() {
    const [userData, setUserData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchUserData() {
            const { data: userData, error } = await getUserInfoAction()
            if (error) {
                console.error(error)
                setError('Error loading user data')
            } else {
                setUserData(userData)
            }
        }
        fetchUserData()
    }, [])

    if (error) return <Modal>{error}</Modal>

    return <Modal>{userData ? <ProfileForm userInfo={userData} /> : 'Loading...'}</Modal>
}
