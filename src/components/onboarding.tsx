'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import useOnboarding from '@/hooks/use-onboarding'
import { ONBOARDING_STEPS } from '@/lib/constants'

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()
  const { setCompleted } = useOnboarding()

  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1
  const isFirstStep = currentStep === 0

  const handleNext = () => {
    if (isLastStep) {
      void setCompleted().then(() => router.refresh())
    }
    else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <main className="flex h-screen w-full flex-col" role="main">
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="max-w-md space-y-4 text-center">
          <header>
            <h1 className="text-2xl font-bold">{ONBOARDING_STEPS[currentStep].title}</h1>
            <p className="text-sm text-muted-foreground">{ONBOARDING_STEPS[currentStep].description}</p>
          </header>

          {/* Progress indicator for screen readers */}
          <div className="sr-only" aria-live="polite">
            Step
            {' '}
            {currentStep + 1}
            {' '}
            of
            {' '}
            {ONBOARDING_STEPS.length}
          </div>

          {/* Visual progress indicator */}
          <div
            className="mt-6 flex justify-center gap-2"
            role="progressbar"
            aria-valuenow={currentStep + 1}
            aria-valuemin={1}
            aria-valuemax={ONBOARDING_STEPS.length}
            aria-label={`Onboarding progress: step ${currentStep + 1} of ${ONBOARDING_STEPS.length}`}
          >
            {ONBOARDING_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`
                  h-2 w-8 rounded-full
                  ${index <= currentStep ? `bg-primary` : `bg-muted`}
                `}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>

      <nav className="p-6" aria-label="Onboarding navigation">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Button
            className="w-32"
            onClick={handlePrev}
            variant="outline"
            disabled={isFirstStep}
            type="button"
            aria-describedby="prev-description"
          >
            Previous
          </Button>
          <span id="prev-description" className="sr-only">
            {isFirstStep ? 'You are on the first step' : 'Go to previous step'}
          </span>

          <Button className="w-32" onClick={handleNext} type="button" aria-describedby="next-description">
            {isLastStep ? 'Get Started' : 'Next'}
          </Button>
          <span id="next-description" className="sr-only">
            {isLastStep ? 'Complete onboarding and start using the app' : 'Go to next step'}
          </span>
        </div>
      </nav>
    </main>
  )
}
