import dynamic from 'next/dynamic'

// Dynamic imports for form components
const CurrencyAmount = dynamic(() => import('@/app/_components/forms-controls/currency-amount.control'), {
    ssr: false,
})
const DateTimeRange = dynamic(() => import('@/app/_components/forms-controls/date-time-range.control'), {
    ssr: false,
})
const ImageUploader = dynamic(() => import('@/app/_components/forms-controls/image-uploader.control'), {
    ssr: false,
})
const NumberControl = dynamic(() => import('@/app/_components/forms-controls/number.control'), { ssr: false })
const TextArea = dynamic(() => import('@/app/_components/forms-controls/text-area.control'), { ssr: false })
const Text = dynamic(() => import('@/app/_components/forms-controls/text.control'), { ssr: false })
const Switch = dynamic(() => import('@/app/_components/forms-controls/switch.control'), { ssr: false })

export const formFields = [
    {
        key: 'bannerImage',
        name: 'bannerImage',
        label: 'Choose Image',
        description: 'Update a banner photo; ideal aspect ratio is 2:1',
        component: ImageUploader,
    },
    {
        key: 'name',
        name: 'name',
        label: 'Name of Pool',
        description: 'Enter a name for your Pool',
        component: Text,
    },
    {
        key: 'dateRange',
        name: 'dateRange',
        label: 'Date of Event',
        description: 'Select the start and end date and time of the Pool',
        component: DateTimeRange,
    },
    {
        key: 'description',
        name: 'description',
        label: 'Description',
        description: 'Enter a description for your Pool',
        component: TextArea,
    },
    {
        key: 'price',
        name: 'price',
        label: 'Buy in',
        description: 'What is the price to participate in the Pool?',
        component: CurrencyAmount,
    },
    {
        key: 'softCap',
        name: 'softCap',
        label: 'Soft Cap',
        description: 'Enter the max amount of paid entries allowed to join',
        component: NumberControl,
    },
    {
        key: 'termsURL',
        name: 'termsURL',
        label: 'Link to T&C, rules, or Code of Conduct',
        description: 'Paste a link to the pool terms document',
        component: Text,
    },
    {
        key: 'requiredAcceptance',
        name: 'requiredAcceptance',
        label: 'Required Acceptance',
        description: 'Select if participants must accept the rules, terms, and conditions',
        component: Switch,
    },
] as const

export type FormFieldKey = (typeof formFields)[number]['key']
