import { z } from 'zod'

const MAX_FILE_SIZE = 5_000_000 // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/avif', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']

// Predefined cities list - can be expanded
const CITIES = ['Cannes', 'Nice', 'Monaco', 'Antibes', 'Saint-Tropez', 'Marseille', 'Lyon', 'Paris', 'Other'] as const

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ethereumAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Token address format')

export const PoolObjectSchema = z.object({
    name: z
        .string({ required_error: 'Pool name is required' })
        .min(5, 'Pool name must be at least 5 characters long')
        .max(50, 'Pool name cannot exceed 50 characters'),
    bannerImage: z
        .instanceof(File, { message: 'Please select a banner image for your pool' })
        .refine(file => file.size > 0, 'Please select a banner image for your pool')
        .refine(file => file.size <= MAX_FILE_SIZE, 'Image file size must be less than 5MB')
        .refine(
            file => ACCEPTED_IMAGE_TYPES.includes(file.type),
            'Please upload a valid image file (.jpg, .jpeg, .png, .webp, or .avif)',
        ),
    description: z
        .string({ required_error: 'Description is required' })
        .min(5, 'Description must be at least 5 characters long')
        .max(500, 'Description cannot exceed 500 characters'),
    termsURL: z
        .string()
        .url('Please enter a valid URL starting with https://')
        .optional()
        .or(z.literal(''))
        .transform(val => (val === '' ? undefined : val)),
    softCap: z.coerce.number().int().default(1),
    dateRange: z.object({
        start: z.coerce.date({ required_error: 'Start date is required' }).default(new Date()),
        end: z.coerce
            .date({ required_error: 'End date is required' })
            .default(new Date(Date.now() + 1 * 60 * 60 * 1000)),
    }),
    // TODO: add a toggle to select between free and paid pool
    price: z.coerce.number().min(0, 'Entry price must be a positive number or zero').default(0),
    requiredAcceptance: z.boolean().optional().default(false),
    // tokenAddress: ethereumAddressSchema,
})

export const CreatePoolFormSchema = PoolObjectSchema.superRefine((data, ctx) => {
    const now = new Date()

    // Ensure start date-time is at least 5 minutes in the future
    if (data.dateRange.start.getTime() <= now.getTime() + 5 * 60 * 1000) {
        ctx.addIssue({
            path: ['dateRange', 'start'],
            code: z.ZodIssueCode.custom,
            message: 'Start date & time must be at least 5 minutes in the future',
        })
    }

    // Ensure end is after start (with at least 30 minutes duration)
    const minimumDuration = 30 * 60 * 1000 // 30 minutes
    if (data.dateRange.end.getTime() <= data.dateRange.start.getTime() + minimumDuration) {
        ctx.addIssue({
            path: ['dateRange', 'end'],
            code: z.ZodIssueCode.custom,
            message: 'End time must be at least 30 minutes after the start time',
        })
    }

    // Ensure event duration is reasonable (not more than 30 days)
    const maxDuration = 30 * 24 * 60 * 60 * 1000 // 30 days
    if (data.dateRange.end.getTime() - data.dateRange.start.getTime() > maxDuration) {
        ctx.addIssue({
            path: ['dateRange', 'end'],
            code: z.ZodIssueCode.custom,
            message: 'Event duration cannot exceed 30 days',
        })
    }

    // Require acceptance checkbox if terms URL provided
    if (data.termsURL && data.termsURL.trim() !== '' && !data.requiredAcceptance) {
        ctx.addIssue({
            path: ['requiredAcceptance'],
            code: z.ZodIssueCode.custom,
            message: 'Please tick this box so participants confirm the rules.',
        })
    }
})

// Set of required fields for client-side UI (asterisk, copy, etc.)
export const REQUIRED_FIELDS = new Set<keyof typeof PoolObjectSchema.shape>([
    'name',
    'bannerImage',
    'description',
    'softCap',
    'dateRange',
    'price',
])

// Export cities for use in components
export { CITIES }
