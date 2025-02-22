import "server-only"

import { HttpClient } from "@/app/(pages)/profile/cross-swap/_components/api/http-client"
import { CONFIG } from "@/app/(pages)/profile/cross-swap/_components/config"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const httpClient = HttpClient.getInstance()

        const requestData = (await req.json()) as Record<string, unknown>
        if (!requestData.address || !requestData.chains) {
            return NextResponse.json({ message: "Invalid request data" }, { status: 400 })
        }
        requestData.chains = [...new Set(Array.isArray(requestData.chains) ? requestData.chains : [requestData.chains])]
        const response = await httpClient.get(CONFIG.API.ENDPOINTS["history"].path, requestData)
        if (response.code !== "0") {
            return NextResponse.json({ message: "Error in the server response" }, { status: 400 })
        }
        if (response.msg !== "success") {
            return NextResponse.json({ message: response.msg || "Unknown error" }, { status: 500 })
        }
        console.log("FETCHED TRANSACTION HISTORY FROM OKX...... RELAYING IT TO THE CLIENT")
        return NextResponse.json({ data: response.data }, { status: 200 })
    } catch (error) {
        console.error("Error in the API:", error)
        return NextResponse.json({ message: "Internal server error" }, { status: 500 })
    }
}
