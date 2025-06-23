'use server'

import { authenticatedProcedure } from '@/server/procedures/authenticated'
import { updateProfileUseCase } from '@/server/use-cases/users/update-profile'
import { z } from 'zod'
import { CreateProfileFormSchema } from './_lib/definitions'

type FormState = {
    message?: string
    errors?: {
        displayName?: string[]
        avatar?: string[]
    }
}

export async function validateProfileAction(_prevState: FormState, formData: FormData): Promise<FormState> {
    const avatarFile = formData.get('avatar') as File | null
    const displayName = formData.get('displayName') as string

    console.log('validating profile form', { displayName, avatarFile })

    let avatarToUpdate: File | null | undefined

    if (avatarFile instanceof File) {
        if (avatarFile.size === 0) {
            // If size is 0, we want to delete the avatar
            avatarToUpdate = null
        } else if (avatarFile.size > 0) {
            // If size is greater than 0, we want to update the avatar
            avatarToUpdate = avatarFile
        }
    } else {
        // If avatarFile is null, we don't want to touch the avatar
        avatarToUpdate = undefined
    }

    try {
        console.log('Updating profile')
        const [, error] = await updateProfileAction({
            displayName,
            avatar: avatarToUpdate,
        })

        if (error) {
            return {
                message: 'Error updating profile',
                errors: {
                    displayName: error.fieldErrors?.displayName,
                    avatar: error.fieldErrors?.avatar,
                },
            }
        }

        return {
            message: 'Profile updated successfully',
        }
    } catch {
        return {
            message: 'Error updating profile',
        }
    }
}

export const updateProfileAction = authenticatedProcedure
    .createServerAction()
    .input(
        CreateProfileFormSchema.extend({
            avatar: z.union([z.instanceof(File), z.null(), z.undefined()]),
        }),
    )
    .output(
        z.object({
            message: z.string(),
            errors: z
                .object({
                    displayName: z.array(z.string()).optional(),
                    avatar: z.array(z.string()).optional(),
                })
                .optional(),
        }),
    )
    .handler(async ({ input, ctx: { user } }) => {
        try {
            await updateProfileUseCase(user.id, {
                displayName: input.displayName,
                avatar: input.avatar,
            })
            return {
                message: 'Profile updated successfully',
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            return {
                message: 'Error updating profile',
                errors: {
                    displayName: ['An unexpected error occurred'],
                },
            }
        }
    })
