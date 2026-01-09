import { NextResponse } from "next/server"
import { getSession, getCurrentUser } from "@/lib/auth"
import { cookies } from "next/headers"

export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("auth-token")?.value

        let session = null
        try {
            session = await getSession()
        } catch (e) {
            console.error("Session verification failed", e)
        }

        let user = null
        try {
            if (session) {
                user = await getCurrentUser()
            }
        } catch (e) {
            console.error("User fetch failed", e)
        }

        return NextResponse.json({
            status: "Debug Info",
            hasTokenCookie: !!token,
            tokenPartial: token ? `${token.substring(0, 15)}...` : "missing",
            sessionVerified: !!session,
            sessionPayload: session,
            userFoundInDb: !!user,
            userDetails: user ? {
                id: user.id,
                email: user.email,
                name: user.name,
                hasFamilyMember: !!user.familyMember,
                familyId: user.familyMember?.family?.id
            } : "User not found in DB via getCurrentUser",
            env: {
                hasJwtSecret: !!process.env.JWT_SECRET,
                dbUrlSet: !!process.env.DATABASE_URL
            }
        })
    } catch (error) {
        return NextResponse.json({
            error: "Debug Endpoint Critical Fail",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}
