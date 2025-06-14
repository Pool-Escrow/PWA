'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import OnboardingStep from './onboarding-step'

const onboardingSteps = [
    {
        id: 1,
        title: 'Join a prize pool today',
        description: 'Dive in with frens and win bigger, together.',
        buttonText: 'Continue',
        showSkip: true,
    },
    {
        id: 2,
        title: 'Reel in your winnings',
        description: 'Claim prizes after the event ends - may the tide be in your favour!',
        buttonText: 'Continue',
        showSkip: true,
    },
    {
        id: 3,
        title: 'Create your own pool',
        description: 'Collect funds, disperse prizes, make waves.',
        buttonText: 'Dive in',
        showSkip: false,
    },
]

export default function OnboardingFlow() {
    const [currentStep, setCurrentStep] = useState(0)
    const router = useRouter()

    const handleContinue = () => {
        if (currentStep < onboardingSteps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            // On final step, redirect to home page (pools)
            router.push('/pools')
        }
    }

    const handleSkip = () => {
        // Skip to home page (pools)
        router.push('/pools')
    }

    return (
        <div className='mx-auto h-screen w-full max-w-[393px] overflow-hidden bg-white'>
            <OnboardingStep
                step={onboardingSteps[currentStep]}
                currentStepIndex={currentStep}
                totalSteps={onboardingSteps.length}
                onContinue={handleContinue}
                onSkip={handleSkip}
            />
        </div>
    )
}
