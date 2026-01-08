import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            family: user.familyMember?.family || null,
            member: user.familyMember || null,
        })
    } catch (error) {
        console.error("Session error:", error)
        return NextResponse.json(
            { error: "Failed to get session" },
            { status: 500 }
        )
    }
}
