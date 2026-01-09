import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, code, type } = body

        // Validate input
        if (!email || !code || !type) {
            return NextResponse.json(
                { error: "Email, code, and type are required" },
                { status: 400 }
            )
        }

        if (!['REGISTRATION', 'PASSWORD_RESET'].includes(type)) {
            return NextResponse.json(
                { error: "Invalid OTP type" },
                { status: 400 }
            )
        }

        // Find the OTP
        const otp = await prisma.otp.findFirst({
            where: {
                email,
                code,
                type,
                used: false,
                expiresAt: { gt: new Date() },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        if (!otp) {
            return NextResponse.json(
                { error: "Invalid or expired verification code" },
                { status: 400 }
            )
        }

        // Valid OTP found - do not mark as used yet (will be used in registration/reset)
        // Just return success


        return NextResponse.json({
            message: "Verification successful",
            verified: true,
        })
    } catch (error) {
        console.error("Verify OTP error:", error)
        return NextResponse.json(
            { error: "Verification failed" },
            { status: 500 }
        )
    }
}
