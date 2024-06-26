'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useBottomBarStore } from '@/providers/bottom-bar.provider'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AvatarUploader } from '../common/forms/avatar-uploader.control'
import { Text } from '@/components/common/forms/text.control'
import { Database } from '@/types/db'
import { updateUserProfile } from './profile.action'
import { useUserStore } from '@/stores/profile.store'

type ProfileUpdate = Pick<Database['public']['Tables']['users']['Update'], 'displayName' | 'avatar'>

interface FormField {
    name: keyof ProfileUpdate
    label: string
    description: string
    component: React.ComponentType<any>
    value: string
    setValue: (value: string) => void
}

export default function CreateProfilePage() {
    const [formFields, setFormFields] = useState<FormField[]>([])
    const { updateProfile } = useUserStore()

    const router = useRouter()
    const { showBar, setContent } = useBottomBarStore(state => state)
    const queryClient = useQueryClient()

    const updateProfileMutation = useMutation({
        mutationFn: async (profileData: ProfileUpdate) => updateUserProfile(profileData),
        onSuccess: updatedProfile => {
            toast.success('Profile updated successfully')
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            router.push('/pools')
        },
        onError: (error: Error) => {
            console.error('updateProfileMutation Error:', error)
            toast.error('Failed to update profile', { description: error.message })
        },
    })

    const handleFormSubmission = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const profileData = formFields.reduce(
            (acc, field) => ({ ...acc, [field.name]: field.value }),
            {},
        ) as ProfileUpdate
        const updatingToastId = toast.loading('Updating Profile', { description: 'Please wait...' })
        try {
            await updateProfileMutation.mutateAsync(profileData)
        } finally {
            toast.dismiss(updatingToastId)
        }
    }

    useEffect(() => {
        const submitButton = (
            <Button
                type='submit'
                disabled={updateProfileMutation.isPending}
                className='mb-3 h-[46px] w-full rounded-[2rem] bg-cta px-6 py-[11px] text-center text-base font-semibold leading-normal text-white shadow-button active:shadow-button-push'
                onClick={() => document.querySelector('form')?.requestSubmit()}>
                {updateProfileMutation.isPending ? 'Updating...' : 'Continue'}
            </Button>
        )
        setContent(submitButton)
        showBar()
    }, [setContent, showBar, updateProfileMutation.isPending])

    useEffect(() => {
        setFormFields([
            {
                name: 'avatar',
                label: 'User Image',
                description: 'Choose your account image',
                component: AvatarUploader,
                value: '',
                setValue: v => setFormFields(prev => updateField(prev, 0, v)),
            },
            {
                name: 'displayName',
                label: 'User Name',
                description: 'Choose a user name',
                component: Text,
                value: '',
                setValue: v => setFormFields(prev => updateField(prev, 1, v)),
            },
        ])
    }, [])

    const updateField = (prev: FormField[], index: number, value: string) => {
        const newFields = [...prev]
        newFields[index] = { ...newFields[index], value }
        return newFields
    }

    return (
        <form className='flex w-full flex-col gap-6 py-6' onSubmit={handleFormSubmission}>
            <section className='flex flex-1 flex-col gap-6'>
                {formFields.map((field, index) => (
                    <div key={index}>
                        <Label className='text-base font-medium text-[#090909]'>{field.label}</Label>
                        <p className='mb-4 mt-1.5 text-xs font-medium text-[#b2b2b2]'>{field.description}</p>
                        <field.component value={field.value} setValue={field.setValue} />
                    </div>
                ))}
            </section>
        </form>
    )
}
