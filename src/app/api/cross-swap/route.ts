
import 'server-only'

import { NextResponse } from 'next/server'


import crypto from 'crypto'
import type { SignOptions } from 'jsonwebtoken'
import { sign } from 'jsonwebtoken'
import { API_paths, sendGetRequest } from '@/app/(pages)/profile/cross-swap/_components/utils'
export async function POST(req: Request) {
    console.log('API Hit')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const requestData = await req.json()

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {  address, chains } = requestData
    console.log('req:', requestData)

    const { path, call } = API_paths['history']
    console.log('path', path)
    const response = await sendGetRequest(path, requestData);
    console.log('response', response)
    if (!response.code === '0') {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.data;
    // eslint-disable-next-line
    if (response.msg != 'success') {
        // eslint-disable-next-line
        console.error('Error:', response.message)
        // eslint-disable-next-line
        return NextResponse.json({ message: response.message }, { status: 500 })
    } else {
        // Success
        return NextResponse.json({ data }, { status: 200 })
    }
}

// eslint-disable-next-line

