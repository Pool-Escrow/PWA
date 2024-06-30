import { Textarea } from '@/components/ui/textarea'

export type TextAreaValue = string

interface TextAreaProps {
    value: TextAreaValue
    setValue: React.Dispatch<React.SetStateAction<TextAreaValue>>
}

export const TextArea = ({ value, setValue }: TextAreaProps) => {
    const maxLength = 200
    return (
        <div>
            <Textarea
                className='content-size resize-y rounded-[20px] p-6 font-normal leading-tight text-black backdrop-blur-[2px]'
                maxLength={maxLength}
                value={value}
                onChange={e => {
                    console.log('change', e.target.value)
                    setValue(e.target.value)
                }}
            />
            <div className='absolute right-7 -mt-5 w-auto rounded-full bg-[#fffd] px-1 text-right text-xs font-medium text-[#B2B2B2]'>
                {value?.length}/{maxLength}
            </div>
        </div>
    )
}
