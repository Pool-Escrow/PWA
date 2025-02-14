import { create } from 'zustand'

interface EncryptState {
    isEncoded: boolean
    toggleEncryption: () => void
}

export const useEncryptStore = create<EncryptState>(set => ({
    isEncoded: false,
    toggleEncryption: () => set(state => ({ isEncoded: !state.isEncoded })),
}))
