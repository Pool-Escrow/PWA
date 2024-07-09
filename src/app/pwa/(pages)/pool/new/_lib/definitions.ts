import { z } from 'zod'

const MAX_FILE_SIZE = 5_000_000 // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

// const description = formData.get('description') as string
// const termsURL = formData.get('termsURL') as string
// const softCap = formData.get('softCap') as string
// const startDate = formData.get('startDate') as string
// const endDate = formData.get('endDate') as string
// const price = formData.get('price') as string
// const tokenAddress = formData.get('tokenAddress') as string

const dateTimeSchema = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Invalid date-time format. Expected format: YYYY-MM-DDTHH:MM')

const futureDateTimeSchema = dateTimeSchema.refine(
    dateTime => {
        const date = new Date(dateTime)
        const now = new Date()
        return date > now
    },
    {
        message: 'Date and time must be in the future',
    },
)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ethereumAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Token address format')

export const CreatePoolFormSchema = z
    .object({
        name: z
            .string()
            .min(5, 'The name must have at least 5 characters')
            .max(50, 'The name cannot have more than 50 characters'),
        bannerImage: z.string().optional(),
        // bannerImage: z.instanceof(File),
        // .refine(file => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
        // .refine(
        //     file => ACCEPTED_IMAGE_TYPES.includes(file?.type),
        //     'Only .jpg, .jpeg, .png and .webp formats are supported.',
        // ),
        description: z
            .string()
            .min(5, 'The description must have at least 5 characters')
            .max(200, 'The description cannot have more than 200 characters'),
        termsURL: z.string().url('Invalid URL').optional(),
        softCap: z.number().int().min(1, 'The soft cap must be a positive number'),
        dateRange: z.object({
            start: futureDateTimeSchema,
            end: futureDateTimeSchema,
        }),
        price: z.number().int().min(1, 'The price must be a positive number'),
        // tokenAddress: ethereumAddressSchema,
    })
    .refine(
        data => {
            const startDate = new Date(data.dateRange.start)
            const endDate = new Date(data.dateRange.end)
            return endDate > startDate
        },
        {
            message: 'endDate must be after startDate',
            path: ['dateRange'],
        },
    )
