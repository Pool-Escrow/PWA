import 'server-only'

import type { NextApiRequest, NextApiResponse } from 'next'
import { HttpClient } from '../profile/cross-swap/_components/api/http-client'
import { CONFIG } from '../profile/cross-swap/_components/config'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { address } = req.query

        if (!address || typeof address !== 'string') {
            return res.status(400).json({ error: 'Address parameter is required' })
        }

        const { path } = CONFIG.API.ENDPOINTS['history']
        const httpClient = HttpClient.getInstance()

        const response = await httpClient.get(path, { address })

        if (!response.data) {
            throw new Error('No data received from API')
        }

        res.status(200).json(response.data)
    } catch (error) {
        console.error('Error fetching OKX API:', error)
        res.status(500).json({ error: 'Failed to fetch data' })
    }
}
