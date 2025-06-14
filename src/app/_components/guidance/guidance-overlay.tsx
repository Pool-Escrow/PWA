'use client'

import { useEffect, useState } from 'react'
import GuidanceTooltip from './guidance-tooltip'

const GUIDANCE_STORAGE_KEY = 'pool-guidance-completed'

// Triangle positions for easy adjustment
const TRIANGLE_POSITIONS = {
    step1: 64, // centered (150 - 12)
    step2: 98, // 24px left of center (138 - 24)
    step3: 182, // 24px right of center (138 + 24)
}

const guidanceSteps = [
    {
        id: 1,
        title: 'Welcome to pool',
        message: 'Find upcoming top pool events to participate in.',
        type: 'scroll' as const,
    },
    {
        id: 2,
        title: 'Welcome to pool',
        message: 'Deposit funds to join pools with your friends',
        type: 'deposit' as const,
    },
    {
        id: 3,
        title: 'Welcome to pool',
        message: 'Use the bridge to receive your funds from other blockchains',
        type: 'bridge' as const,
    },
]

// Deposit Icon Component
const DepositIcon = () => (
    <svg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
            d='M25.6667 8.06V7.66667C25.6667 6.69421 25.2804 5.76158 24.5927 5.07394C23.9051 4.38631 22.9725 4 22 4H7C6.58822 4.00007 6.18085 4.08491 5.80328 4.24924C5.42571 4.41357 5.08601 4.65388 4.80534 4.95519C4.52466 5.2565 4.30902 5.61237 4.17185 6.00063C4.03467 6.3889 3.9789 6.80125 4.008 7.212C4.0029 7.25225 4.00023 7.29276 4 7.33333V23.6667C4 24.8159 4.45655 25.9181 5.2692 26.7308C6.08186 27.5435 7.18406 28 8.33333 28H25C25.9725 28 26.9051 27.6137 27.5927 26.9261C28.2804 26.2384 28.6667 25.3058 28.6667 24.3333V11.6667C28.6669 10.8097 28.367 9.97964 27.8189 9.32077C27.2709 8.6619 26.5094 8.21582 25.6667 8.06ZM7 6H22C22.92 6 23.6667 6.74667 23.6667 7.66667V8H7C6.73478 8 6.48043 7.89464 6.29289 7.70711C6.10536 7.51957 6 7.26522 6 7C6 6.73478 6.10536 6.48043 6.29289 6.29289C6.48043 6.10536 6.73478 6 7 6ZM21.6667 17.3333H24.3333C24.5985 17.3333 24.8529 17.4387 25.0404 17.6262C25.228 17.8138 25.3333 18.0681 25.3333 18.3333C25.3333 18.5986 25.228 18.8529 25.0404 19.0404C24.8529 19.228 24.5985 19.3333 24.3333 19.3333H21.6667C21.4014 19.3333 21.1471 19.228 20.9596 19.0404C20.772 18.8529 20.6667 18.5986 20.6667 18.3333C20.6667 18.0681 20.772 17.8138 20.9596 17.6262C21.1471 17.4387 21.4014 17.3333 21.6667 17.3333Z'
            fill='white'
        />
    </svg>
)

// Bridge Icon Component
const BridgeIcon = () => (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M18.3753 13.7087C18.0755 14.8277 17.4864 15.848 16.6672 16.6671C15.8481 17.4863 14.8278 18.0754 13.7089 18.3753C12.5899 18.6752 11.4118 18.6753 10.2928 18.3756C9.17379 18.0759 8.15339 17.4869 7.33413 16.6679L6.95973 16.2947H9.87933C10.118 16.2947 10.3469 16.1999 10.5157 16.0311C10.6845 15.8624 10.7793 15.6334 10.7793 15.3947C10.7793 15.1561 10.6845 14.9271 10.5157 14.7584C10.3469 14.5896 10.118 14.4947 9.87933 14.4947H4.78773C4.54903 14.4947 4.32011 14.5896 4.15133 14.7584C3.98255 14.9271 3.88773 15.1561 3.88773 15.3947V20.4851C3.88773 20.7238 3.98255 20.9528 4.15133 21.1215C4.32011 21.2903 4.54903 21.3851 4.78773 21.3851C5.02642 21.3851 5.25534 21.2903 5.42412 21.1215C5.59291 20.9528 5.68773 20.7238 5.68773 20.4851V17.5691L6.05973 17.9411C7.10234 18.984 8.40112 19.734 9.82551 20.1158C11.2499 20.4976 12.7497 20.4976 14.1741 20.116C15.5985 19.7344 16.8974 18.9844 17.9401 17.9417C18.9828 16.8989 19.7326 15.6 20.1141 14.1755C20.1762 13.945 20.1441 13.6992 20.025 13.4923C19.9058 13.2853 19.7093 13.1342 19.4787 13.0721C19.2481 13.0101 19.0024 13.0422 18.7954 13.1613C18.5885 13.2805 18.4374 13.4782 18.3753 13.7087ZM19.8513 9.24115C20.0197 9.07233 20.1142 8.84359 20.1141 8.60515V3.51475C20.1141 3.27605 20.0193 3.04713 19.8505 2.87835C19.6817 2.70957 19.4528 2.61475 19.2141 2.61475C18.9754 2.61475 18.7465 2.70957 18.5777 2.87835C18.4089 3.04713 18.3141 3.27605 18.3141 3.51475V6.43195L17.9421 6.05995C16.8995 5.01708 15.6007 4.26706 14.1763 3.88529C12.752 3.50352 11.2522 3.50345 9.82776 3.88509C8.40334 4.26674 7.10449 5.01664 6.06179 6.05942C5.01909 7.1022 4.26927 8.4011 3.88773 9.82555C3.85305 9.94088 3.84187 10.062 3.85486 10.1817C3.86784 10.3015 3.90472 10.4174 3.96332 10.5226C4.02192 10.6278 4.10104 10.7202 4.19599 10.7943C4.29094 10.8684 4.3998 10.9226 4.51611 10.9539C4.63242 10.9851 4.75382 10.9927 4.87311 10.9762C4.9924 10.9597 5.10717 10.9194 5.2106 10.8577C5.31404 10.796 5.40404 10.7142 5.47528 10.6171C5.54652 10.5199 5.59754 10.4095 5.62533 10.2923C5.92481 9.17284 6.51379 8.15192 7.33303 7.33226C8.15227 6.5126 9.17288 5.92309 10.2922 5.62303C11.4116 5.32297 12.5902 5.32293 13.7096 5.62292C14.829 5.92291 15.8496 6.51234 16.6689 7.33195L17.0421 7.70395H14.1237C13.885 7.70395 13.6561 7.79877 13.4873 7.96755C13.3185 8.13633 13.2237 8.36525 13.2237 8.60395C13.2237 8.84264 13.3185 9.07156 13.4873 9.24034C13.6561 9.40913 13.885 9.50395 14.1237 9.50395H19.2153C19.4538 9.50405 19.6825 9.40954 19.8513 9.24115Z'
            fill='white'
        />
    </svg>
)

interface GuidanceOverlayProps {
    onComplete?: () => void
}

export default function GuidanceOverlay({ onComplete }: GuidanceOverlayProps) {
    const [currentStep, setCurrentStep] = useState(0)
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        // Check if user has already seen guidance
        const hasSeenGuidance = localStorage.getItem(GUIDANCE_STORAGE_KEY)
        if (!hasSeenGuidance) {
            setIsVisible(true)
        }
    }, [])

    const handleNext = () => {
        if (currentStep < guidanceSteps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            handleComplete()
        }
    }

    const handleComplete = () => {
        // Mark guidance as completed in localStorage
        localStorage.setItem(GUIDANCE_STORAGE_KEY, 'true')
        setIsVisible(false)
        onComplete?.()
    }

    const handleClose = () => {
        handleComplete()
    }

    const handleOverlayClick = () => {
        handleNext()
    }

    if (!isVisible) {
        return null
    }

    const step = guidanceSteps[currentStep]

    return (
        <div className='fixed inset-0 z-50 overflow-hidden bg-black/90 backdrop-blur-sm' onClick={handleOverlayClick}>
            {/* Step 1: Mock Pool Card */}
            {step.type === 'scroll' && (
                <>
                    {/* Mock Pool Card */}
                    <div className='absolute left-[24px] top-[344px] h-[92px] w-[345px] rounded-3xl bg-white' />
                    <div className='absolute left-[34px] top-[354px] size-[72px] rounded-2xl bg-gradient-to-br from-[#8ed8fb] to-[#2dca35]' />
                    <div className="absolute left-[120px] top-[366px] justify-start font-['Inter'] text-sm font-semibold text-black">
                        Brunch with Flow
                    </div>
                    <div className="absolute left-[120px] top-[395px] justify-start font-['Inter'] text-xs font-medium text-black">
                        188/300 Registered
                    </div>
                    {/* Tooltip positioned above */}
                    <div className='absolute left-[47px] top-[127px]'>
                        <GuidanceTooltip
                            step={step}
                            currentStepIndex={currentStep}
                            totalSteps={guidanceSteps.length}
                            onNext={handleNext}
                            onClose={handleClose}
                            triangleDirection='down'
                            trianglePosition={TRIANGLE_POSITIONS.step1}
                        />
                    </div>
                </>
            )}

            {/* Step 2: Deposit Icon */}
            {step.type === 'deposit' && (
                <>
                    <div className='absolute left-[128.83px] top-[188px] inline-flex w-[44.95px] flex-col items-center justify-start gap-[9.36px]'>
                        <div className='relative size-[29.96px] overflow-hidden'>
                            <DepositIcon />
                        </div>
                        <div className="justify-center self-stretch text-center font-['Inter'] text-[10.30px] font-semibold text-white">
                            Deposit
                        </div>
                    </div>
                    {/* Tooltip positioned above */}
                    <div className='absolute left-[47px] top-[280px]'>
                        <GuidanceTooltip
                            step={step}
                            currentStepIndex={currentStep}
                            totalSteps={guidanceSteps.length}
                            onNext={handleNext}
                            onClose={handleClose}
                            triangleDirection='up'
                            trianglePosition={TRIANGLE_POSITIONS.step2}
                        />
                    </div>
                </>
            )}

            {/* Step 3: Bridge Icon */}
            {step.type === 'bridge' && (
                <>
                    <div className='absolute left-[219.75px] top-[188px] inline-flex w-[44.95px] flex-col items-center justify-start gap-[9.36px]'>
                        <div className='relative flex size-[29.96px] items-center justify-center overflow-hidden'>
                            <BridgeIcon />
                        </div>
                        <div className="justify-center self-stretch text-center font-['Inter'] text-[10.30px] font-semibold text-white">
                            Bridge
                        </div>
                    </div>
                    {/* Tooltip positioned above */}
                    <div className='absolute left-[47px] top-[280px]'>
                        <GuidanceTooltip
                            step={step}
                            currentStepIndex={currentStep}
                            totalSteps={guidanceSteps.length}
                            onNext={handleNext}
                            onClose={handleClose}
                            triangleDirection='up'
                            trianglePosition={TRIANGLE_POSITIONS.step3}
                        />
                    </div>
                </>
            )}
        </div>
    )
}
