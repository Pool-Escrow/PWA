'use client'

import Text from '@/app/_components/forms-controls/text.control'
import { Button } from '@/app/_components/ui/button'
import { Label } from '@/app/_components/ui/label'
import { appActions, appStore$ } from '@/app/stores/app.store'
import { Tables } from '@/types/db'
import { use$ } from '@legendapp/state/react'
import { usePrivy } from '@privy-io/react-auth'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
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

type FormFieldKey = (typeof formFields)[number]['key']

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
    const isRouting = use$(appStore$.settings.isRouting)
    const [avatarChanged, setAvatarChanged] = useState(false)
    const [state, formAction] = useActionState(validateProfileAction, initialState)

    useEffect(() => {
        if (!isRouting) {
            appActions.setBottomBarContent(
                <Button
                    type='submit'
                    form='profile-form'
                    className='bg-cta shadow-button active:shadow-button-push mb-3 h-[46px] w-full rounded-[2rem] px-6 py-[11px] text-center text-base leading-normal font-semibold text-white'>
                    Save
                </Button>,
            )
        }

        return () => {
            appActions.setBottomBarContent(null)
        }
    }, [isRouting])

    useEffect(() => {
        if (state?.message) {
            toast(state.message)
        }
        if (!ready || user?.id == null) {
            return
        }
        if (state?.message === 'Profile updated successfully') {
            queryClient.invalidateQueries({
                queryKey: ['user-info', user.id],
            })
            router.back()
        }
    }, [state?.message, router, ready, user?.id, queryClient])

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
                const errors = state?.errors && field.key in state.errors ? state.errors[field.key as FormFieldKey] : []
                let defaultValue: string | undefined

                if (field.key === 'displayName') {
                    defaultValue = userInfo?.displayName || undefined
                } else if (field.key === 'avatar') {
                    defaultValue = userInfo?.avatar || undefined
                }

                return (
                    <section key={field.key} className='mb-6 flex flex-1 flex-col'>
                        <Label className='text-base font-medium text-[#090909]'>{field.label}</Label>
                        <p className='mt-1.5 mb-4 text-xs font-medium text-[#b2b2b2]'>{field.description}</p>
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
