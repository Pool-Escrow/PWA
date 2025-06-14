import { XIcon } from 'lucide-react'

interface GuidanceStep {
    id: number
    title: string
    message: string
    type: 'scroll' | 'deposit' | 'bridge'
}

interface GuidanceTooltipProps {
    step: GuidanceStep
    currentStepIndex: number
    totalSteps: number
    onNext: () => void
    onClose: () => void
    triangleDirection?: 'up' | 'down'
    trianglePosition?: number // exact pixel position from left edge of tooltip
}

export default function GuidanceTooltip({
    step,
    currentStepIndex,
    totalSteps,
    onNext,
    onClose,
    triangleDirection = 'down',
    trianglePosition = 138, // default centered position (150 - 12)
}: GuidanceTooltipProps) {
    return (
        <div className='relative'>
            {/* Main Tooltip */}
            <div
                className='h-[194px] w-[300px] rounded-3xl bg-white shadow-[0px_0px_5.5px_0px_rgba(0,0,0,0.12)] backdrop-blur-[13.15px]'
                onClick={e => e.stopPropagation()}>
                {/* Message */}
                <div className="absolute left-[18px] top-[54px] w-[264px] justify-start font-['Inter'] text-lg font-medium leading-normal text-black">
                    {step.message}
                </div>

                {/* Step Counter */}
                <div className="absolute left-[18px] top-[166px] justify-start font-['Lay_Grotesk_-_Trial'] text-[10px] font-medium leading-[10px] text-[#4078f4]">
                    {currentStepIndex + 1}/{totalSteps}
                </div>

                {/* Header */}
                <div className='absolute left-[18px] top-[20px] inline-flex items-center justify-start gap-2'>
                    <div className="justify-start font-['Raleway'] text-[10px] font-extrabold leading-[13px] text-black">
                        {step.title}
                    </div>
                </div>

                {/* Close Button */}
                <button
                    className='absolute left-[264px] top-[18px] flex size-[18px] items-center justify-center overflow-hidden'
                    onClick={onClose}>
                    <XIcon className='size-3 text-black' />
                </button>

                {/* Action Button */}
                <div
                    className='absolute left-[202px] top-[142px] inline-flex h-[34px] items-center justify-center gap-2.5 rounded-[26px] bg-[#4078f4] px-6 py-[9px]'
                    onClick={onNext}>
                    <div className="justify-start text-center font-['Inter'] text-xs font-semibold text-white">
                        {currentStepIndex === totalSteps - 1 ? 'Dive in' : 'Got it'}
                    </div>
                </div>
            </div>

            {/* Triangle Pointer */}
            {triangleDirection === 'down' && (
                <div className='absolute top-full' style={{ left: `${trianglePosition}px` }}>
                    <div className='size-0 border-x-[12px] border-t-[12px] border-x-transparent border-t-white' />
                </div>
            )}

            {triangleDirection === 'up' && (
                <div className='absolute top-0 -translate-y-full' style={{ left: `${trianglePosition}px` }}>
                    <div className='size-0 border-x-[12px] border-b-[12px] border-x-transparent border-b-white' />
                </div>
            )}
        </div>
    )
}
