// src/stores/user.store.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { updateUserProfile, getUserProfile } from '@/components/profile/profile.action'
import { Database } from '@/types/db'

type UserProfile = Database['public']['Tables']['users']['Row']

interface UserStoreState {
    profile: UserProfile | null
    isLoading: boolean
    error: Error | null
}

type UserStoreActions = {
    setProfile: (profile: UserProfile | null) => void
    loadProfile: () => Promise<void>
    updateProfile: (profileData: Partial<UserProfile>) => Promise<void>
    clearProfile: () => void
    setError: (error: Error | null) => void
}

export const useUserStore = create<UserStoreState & UserStoreActions>()(
    devtools(
        persist(
            (set, get) => ({
                profile: null,
                isLoading: false,
                error: null,
                setProfile: profile => set({ profile, isLoading: false }),
                loadProfile: async () => {
                    set({ isLoading: true })
                    try {
                        const profile = await getUserProfile()
                        set({ profile, isLoading: false })
                    } catch (error) {
                        set({ error: error as Error, isLoading: false })
                    }
                },
                updateProfile: async profileData => {
                    set({ isLoading: true })
                    try {
                        const updatedProfile = await updateUserProfile(profileData)
                        set({ profile: updatedProfile, isLoading: false })
                    } catch (error) {
                        set({ error: error as Error, isLoading: false })
                    }
                },
                clearProfile: () => set({ profile: null }),
                setError: error => set({ error, isLoading: false }),
            }),
            {
                name: 'user-storage',
            },
        ),
    ),
)
