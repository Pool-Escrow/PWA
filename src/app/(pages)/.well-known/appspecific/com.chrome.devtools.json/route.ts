// app/.well-known/appspecific/com.chrome.devtools.json/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    const isDev = process.env.NODE_ENV === 'development'
    if (!isDev) {
        return new NextResponse(null, { status: 204 })
    }

    const workspaceRoot = process.env.WORKSPACE_ROOT || process.cwd()
    const uuid = process.env.DEVTOOLS_UUID || generateUuid()

    return NextResponse.json({
        workspace: {
            root: workspaceRoot,
            uuid,
        },
    })
}

// Simple UUID generator (v4-ish):
function generateUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}
