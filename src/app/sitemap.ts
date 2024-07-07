import { headers } from 'next/headers'

export default function Sitemap() {
    const headersList = headers()
    const domain = headersList.get('host')?.replace('.localhost:3000', `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)

    return [
        {
            url: `https://${domain}`,
            lastModified: new Date(),
        },
    ]
}
