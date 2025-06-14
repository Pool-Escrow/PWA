'use client'

import { useAuth } from '@/app/_client/hooks/use-auth'
import { useGuidance } from '@/app/_client/hooks/use-guidance'
import GuidanceOverlay from '@/app/_components/guidance/guidance-overlay'
import { useEffect, useState } from 'react'

interface GuidanceWrapperProps {
    children: React.ReactNode
}

export default function GuidanceWrapper({ children }: GuidanceWrapperProps) {
    const { authenticated, ready } = useAuth()
    const { shouldShowGuidance, markGuidanceComplete, isChecking } = useGuidance()
    const [showGuidance, setShowGuidance] = useState(false)

    useEffect(() => {
        // Wait for both auth and guidance to be ready
        if (ready && !isChecking) {
            if (authenticated && shouldShowGuidance) {
                setShowGuidance(true)
            } else {
                setShowGuidance(false)
            }
        }
    }, [ready, authenticated, shouldShowGuidance, isChecking])

    const handleGuidanceComplete = () => {
        setShowGuidance(false)
        markGuidanceComplete()
    }

    return (
        <>
            {children}
            {showGuidance && <GuidanceOverlay onComplete={handleGuidanceComplete} />}
        </>
    )
}
