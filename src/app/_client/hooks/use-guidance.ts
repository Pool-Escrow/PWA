'use client'

import { useEffect, useState } from 'react'

const GUIDANCE_STORAGE_KEY = 'pool-guidance-completed'

export function useGuidance() {
    const [shouldShowGuidance, setShouldShowGuidance] = useState(false)
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        // Check if user has already seen guidance
        const hasSeenGuidance = localStorage.getItem(GUIDANCE_STORAGE_KEY)
        setShouldShowGuidance(!hasSeenGuidance)
        setIsChecking(false)
    }, [])

    const markGuidanceComplete = () => {
        localStorage.setItem(GUIDANCE_STORAGE_KEY, 'true')
        setShouldShowGuidance(false)
    }

    const resetGuidance = () => {
        localStorage.removeItem(GUIDANCE_STORAGE_KEY)
        setShouldShowGuidance(true)
    }

    return {
        shouldShowGuidance,
        isChecking,
        markGuidanceComplete,
        resetGuidance,
    }
}
