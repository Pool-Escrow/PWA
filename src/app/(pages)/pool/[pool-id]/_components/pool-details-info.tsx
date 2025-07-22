import DOMPurify from 'dompurify'
import { ExternalLinkIcon } from 'lucide-react'
import { marked } from 'marked'
import Link from 'next/link'
import { useEffect, useState } from 'react'

function PoolDetailsTermsUrl({ termsUrl }: { termsUrl: string }) {
    return (
        <Link
            href={termsUrl}
            target='_blank'
            rel='external noopener noreferrer nofollow'
            legacyBehavior>
            <div className='inline-flex w-full justify-between self-center'>
                Terms and conditions
                <ExternalLinkIcon className='size-4' />
            </div>
        </Link>
    );
}

interface PoolDetailsInfoProps {
    description: string
    price: number
    tokenSymbol: string
    termsUrl?: string
}

export default function PoolDetailsInfo({ description, price, tokenSymbol, termsUrl }: PoolDetailsInfoProps) {
    const [sanitizedDescription, setSanitizedDescription] = useState<string>('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const parseDescription = async () => {
            try {
                const parsed = await marked.parse(DOMPurify.sanitize(description))
                setSanitizedDescription(parsed)
            } catch (error) {
                console.error('Error parsing description:', error)
                setSanitizedDescription(DOMPurify.sanitize(description))
            } finally {
                setIsLoading(false)
            }
        }

        void parseDescription()
    }, [description])

    const items = [
        {
            title: 'Description',
            value: isLoading ? (
                <div className='text-sm text-gray-500'>Loading description...</div>
            ) : (
                <div
                    dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                    className='prose prose-sm max-w-none [&>a]:text-blue-500 [&>a]:underline [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-3 [&>blockquote]:italic [&>code]:rounded [&>code]:bg-gray-100 [&>code]:px-1 [&>code]:py-0.5 [&>h1]:mb-2 [&>h1]:text-xl [&>h1]:font-bold [&>h2]:mb-2 [&>h2]:text-lg [&>h2]:font-bold [&>hr]:my-4 [&>hr]:border-t-2 [&>ol]:ml-5 [&>ol]:list-decimal [&>p]:mb-3 [&>pre]:overflow-x-auto [&>pre]:rounded [&>pre]:bg-gray-100 [&>pre]:p-3 [&>ul]:ml-5 [&>ul]:list-disc'
                />
            ),
        },
        { title: 'Buy-In', value: `$${price} ${tokenSymbol}` },
        { title: 'Terms', value: termsUrl ? <PoolDetailsTermsUrl termsUrl={termsUrl} /> : 'No terms provided' },
    ]

    return (
        <div className='space-y-3 rounded-[2.875rem]'>
            {items.map((item, index) => (
                <PoolDetailsInfoItem key={index} title={item.title} value={item.value} />
            ))}
        </div>
    )
}
function PoolDetailsInfoItem({ title, value }: { title: string; value: React.ReactNode }) {
    return (
        <div className='space-y-4'>
            <div className='w-full border-b-[0.5px] pb-2 text-xs font-semibold'>{title}</div>
            <div>{value}</div>
        </div>
    )
}
