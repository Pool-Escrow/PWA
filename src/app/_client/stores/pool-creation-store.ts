// src/app/pwa/_client/stores/pool-creation-store.ts
import { create } from 'zustand'
import { toast } from 'sonner'

export enum Steps {
    Initial = 'initial',
    CreatingDB = 'creating-db',
    CreatingChain = 'creating-chain',
    UpdatingStatus = 'updating-status',
    Completed = 'completed',
    Error = 'error',
    UserRejected = 'user-rejected',
}

interface ToastOptions {
    type: 'info' | 'success' | 'warning' | 'error'
    message: string
    description?: string
    action?: {
        label: string
        onClick: () => void
    }
    alternativeAction?: {
        label: string
        onClick: () => void
    }
}

interface PoolCreationState {
    step: Steps
    internalPoolId: number | null
    onChainPoolId: number | null
    error: string | null
    setStep: (step: PoolCreationState['step']) => void
    setInternalPoolId: (id: number) => void
    setOnChainPoolId: (id: number) => void
    setError: (error: string) => void
    reset: () => void
    showToast: (options: ToastOptions) => void
}

export const usePoolCreationStore = create<PoolCreationState>((set, get) => ({
    step: Steps.Initial,
    internalPoolId: null,
    onChainPoolId: null,
    error: null,
    setStep: step => set({ step }),
    setInternalPoolId: id => set({ internalPoolId: id }),
    setOnChainPoolId: id => set({ onChainPoolId: id }),
    setError: error => set({ error, step: Steps.Error }),
    reset: () =>
        set({
            step: Steps.Initial,
            internalPoolId: null,
            onChainPoolId: null,
            error: null,
        }),
    showToast: (options: ToastOptions) => {
        toast.dismiss()
        const { type, message, description, action, alternativeAction } = options

        const toastOptions = {
            description,
            action: action
                ? {
                      label: action.label,
                      onClick: () => {
                          toast.dismiss()
                          action.onClick()
                      },
                  }
                : undefined,
            cancel: alternativeAction
                ? {
                      label: alternativeAction.label,
                      onClick: () => {
                          toast.dismiss()
                          alternativeAction.onClick()
                      },
                  }
                : undefined,
            duration: action || alternativeAction ? Infinity : 5000,
        }

        switch (type) {
            case 'info':
                toast.info(message, toastOptions)
                break
            case 'success':
                toast.success(message, toastOptions)
                break
            case 'warning':
                toast.warning(message, toastOptions)
                break
            case 'error':
                toast.error(message, toastOptions)
                break
        }
    },
}))
