import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendOtpEmail, generateOtp } from "@/lib/email"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email } = body

        // Validate input
        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            )
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        })

        // Always return success to prevent email enumeration
        if (!user) {
            return NextResponse.json({
                message: "If an account exists with this email, you will receive a verification code",
            })
        }

        // Rate limiting: Check for recent OTPs (max 3 in 15 minutes)
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
        const recentOtps = await prisma.otp.count({
            where: {
                email,
                type: 'PASSWORD_RESET',
                createdAt: { gte: fifteenMinutesAgo },
            },
        })

        if (recentOtps >= 3) {
            return NextResponse.json(
                { error: "Too many attempts. Please try again in 15 minutes" },
                { status: 429 }
            )
        }

        // Invalidate any existing unused OTPs for this email
        await prisma.otp.updateMany({
            where: {
                email,
                type: 'PASSWORD_RESET',
                used: false,
            },
            data: {
                used: true,
            },
        })

        // Generate new OTP
        const code = generateOtp()
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

        // Store OTP in database
        await prisma.otp.create({
            data: {
                email,
                code,
                type: 'PASSWORD_RESET',
                expiresAt,
            },
        })

        // Send OTP email
        const emailSent = await sendOtpEmail({
            to: email,
            otp: code,
            type: 'PASSWORD_RESET',
        })

        if (!emailSent) {
            return NextResponse.json(
                { error: "Failed to send verification email. Please try again." },
                { status: 500 }
            )
        }

        return NextResponse.json({
            message: "If an account exists with this email, you will receive a verification code",
        })
    } catch (error: any) {
        console.error("Forgot password error:", error)
        return NextResponse.json(
            {
                error: error.message || "Failed to process request",
                details: process.env.NODE_ENV !== 'production' ? error.stack : undefined
            },
            { status: 500 }
        )
    }
}
