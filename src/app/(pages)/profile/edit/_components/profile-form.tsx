'use client'

import Text from '@/components/forms-controls/text.control'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/providers/app-store.provider'
import type { Tables } from '@/types/db'
import { usePrivy } from '@privy-io/react-auth'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useFormState } from 'react-dom'
import { toast } from 'sonner'
import { validateProfileAction } from '../actions'
import AvatarUploader from './avatar-uploader'

const formFields = [
    {
        key: 'avatar' as const,
        name: 'avatar',
        label: 'User Image',
        description: 'Choose your account image',
        component: AvatarUploader,
        propName: 'avatar',
    },
    {
        key: 'displayName' as const,
        name: 'displayName',
        label: 'User Name',
        description: 'Choose a user name',
        component: Text,
        propName: 'name',
    },
] as const

const initialState = {
    message: '',
    errors: {
        displayName: [],
        avatar: [],
    },
}

interface ProfilePageProps {
    userInfo?: Pick<Tables<'users'>, 'avatar' | 'displayName'> | null
}

export default function ProfileForm({ userInfo }: ProfilePageProps) {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { user, ready } = usePrivy()

    const { setBottomBarContent, isRouting } = useAppStore(s => ({
        setBottomBarContent: s.setBottomBarContent,
        isRouting: s.isRouting,
    }))
    const [avatarChanged, setAvatarChanged] = useState(false)

    const [state, formAction] = useFormState(validateProfileAction, initialState)

    useEffect(() => {
        if (!isRouting) {
            setBottomBarContent(
                <Button
                    type='submit'
                    form='profile-form'
                    className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'>
                    Save
                </Button>,
            )
        }

        return () => {
            setBottomBarContent(null)
        }
    }, [setBottomBarContent, isRouting])

    useEffect(() => {
        if (state?.message) {
            toast(state.message)
        }
        if (!ready || user?.id == null) {
            return
        }
        if (state?.message === 'Profile updated successfully') {
            void queryClient.invalidateQueries({
                queryKey: ['user-info', user.id],
            })
            router.push('/pools')
        }
    }, [state.message, router, ready, user?.id, queryClient])

    const handleChange = (value: string) => {
        if (value === 'avatar') {
            setAvatarChanged(true)
        }
    }

    return (
        <form
            id='profile-form'
            action={formData => {
                if (!avatarChanged) formData.delete('avatar')
                console.log('Formdata entries to send', Array.from(formData.entries()))
                toast('Saving profile...')
                formAction(formData)
            }}
            className='mx-auto flex w-full max-w-full flex-col'>
            {formFields.map(field => {
                const errors = state?.errors && field.key in state.errors ? state.errors[field.key] : []
                let defaultValue: string | undefined

                if (field.key === 'displayName') {
                    defaultValue = userInfo?.displayName || undefined
                } else if (field.key === 'avatar') {
                    defaultValue = userInfo?.avatar || undefined
                }

                return (
                    <section key={field.key} className='mb-6 flex flex-1 flex-col'>
                        <Label className='text-base font-medium text-[#090909]'>{field.label}</Label>
                        <p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>{field.description}</p>
                        <field.component name={field.name} defaultValue={defaultValue} onChange={handleChange} />
                        {errors && errors.length > 0 && (
                            <p className='mt-1 text-xs text-red-500'>{errors.join(', ')}</p>
                        )}
                    </section>
                )
            })}
        </form>
    )
}
