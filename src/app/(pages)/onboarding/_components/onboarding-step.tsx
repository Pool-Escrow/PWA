interface OnboardingStepProps {
    step: {
        id: number
        title: string
        description: string
        buttonText: string
        showSkip: boolean
    }
    currentStepIndex: number
    totalSteps: number
    onContinue: () => void
    onSkip: () => void
}

export default function OnboardingStep({
    step,
    currentStepIndex,
    totalSteps,
    onContinue,
    onSkip,
}: OnboardingStepProps) {
    return (
        <div className='relative flex h-full w-full flex-col bg-white'>
            {/* Pool Logo */}
            <div className='mx-auto mt-[68.72px] flex h-[26.51px] w-[60px] items-center justify-center'>
                <img src='/app/icons/svg/pool-1.svg' alt='Pool logo' className='h-full w-auto' />
            </div>

            {/* Onboarding Image */}
            <div className='mt-[13px] h-[355px] w-full'>
                <img
                    src={`/app/images/onboard-${step.id}.png`}
                    alt={`Onboarding step ${step.id}`}
                    className='h-full w-full object-cover'
                />
            </div>

            {/* Content */}
            <div className='flex flex-1 flex-col justify-between px-12 pb-8'>
                <div className='mt-[15px] text-center'>
                    <h1 className="mb-6 font-['Raleway'] text-[32px] font-bold leading-[41.92px] text-[#141516]">
                        {step.title}
                    </h1>
                    <p className="font-['Inter'] text-[15px] font-normal leading-snug text-[#6a6a6a]">
                        {step.description}
                    </p>
                </div>

                <div className='flex flex-col items-center gap-6'>
                    {/* Progress Indicators */}
                    <div className='flex items-center gap-1.5'>
                        {Array.from({ length: totalSteps }).map((_, index) => (
                            <div
                                key={index}
                                className={`h-2.5 w-2.5 rounded-full ${
                                    index === currentStepIndex ? 'bg-[#4078f4]' : 'bg-[#d9d9d9]'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Continue Button */}
                    <button
                        onClick={onContinue}
                        className='flex h-[46px] w-[297px] items-center justify-center rounded-[32px] bg-[#4078f4] shadow-[inset_0px_1.75px_0px_0px_rgba(255,255,255,0.25)] transition-colors hover:bg-[#4078f4]/90'>
                        <span className="font-['Inter'] text-base font-semibold text-white">{step.buttonText}</span>
                    </button>

                    {/* Skip Button - Always reserve space to maintain button position */}
                    <div className='h-[21px] w-[297px]'>
                        {step.showSkip && (
                            <button
                                onClick={onSkip}
                                className="w-full text-center font-['Inter'] text-[15px] font-normal leading-snug text-[#4078f4] transition-colors hover:text-[#4078f4]/80">
                                Skip
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
