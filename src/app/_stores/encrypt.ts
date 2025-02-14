import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface EncryptState {
    isEncoded: boolean
    toggleEncryption: () => void
}

export const useEncryptStore = create<EncryptState>()(
    persist(
        set =>
            ({
                isEncoded: false,
                toggleEncryption: () => set(state => ({ isEncoded: !state.isEncoded })),
            }) as EncryptState,
        {
            name: 'encrypt-storage',
        },
    ),
)
