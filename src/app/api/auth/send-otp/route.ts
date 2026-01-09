import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendOtpEmail, generateOtp } from "@/lib/email"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, type } = body

        // Validate input
        if (!email || !type) {
            return NextResponse.json(
                { error: "Email and type are required" },
                { status: 400 }
            )
        }

        if (!['REGISTRATION', 'PASSWORD_RESET'].includes(type)) {
            return NextResponse.json(
                { error: "Invalid OTP type" },
                { status: 400 }
            )
        }

        // For registration, check if user already exists
        if (type === 'REGISTRATION') {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            })

            if (existingUser) {
                return NextResponse.json(
                    { error: "User with this email already exists" },
                    { status: 400 }
                )
            }
        }

        // For password reset, check if user exists
        if (type === 'PASSWORD_RESET') {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            })

            if (!existingUser) {
                // Don't reveal if user exists or not for security
                return NextResponse.json({
                    message: "If an account exists with this email, you will receive a verification code"
                })
            }
        }

        // Rate limiting: Check for recent OTPs (max 3 in 15 minutes)
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
        const recentOtps = await prisma.otp.count({
            where: {
                email,
                type,
                createdAt: { gte: fifteenMinutesAgo },
            },
        })

        if (recentOtps >= 3) {
            return NextResponse.json(
                { error: "Too many attempts. Please try again in 15 minutes" },
                { status: 429 }
            )
        }

        // Invalidate any existing unused OTPs for this email and type
        await prisma.otp.updateMany({
            where: {
                email,
                type,
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
                type,
                expiresAt,
            },
        })

        // Send OTP email
        const emailSent = await sendOtpEmail({
            to: email,
            otp: code,
            type,
        })

        if (!emailSent) {
            return NextResponse.json(
                { error: "Failed to send verification email. Please try again." },
                { status: 500 }
            )
        }

        return NextResponse.json({
            message: "Verification code sent to your email",
        })
    } catch (error) {
        console.error("Send OTP error:", error)
        return NextResponse.json(
            { error: "Failed to send verification code" },
            { status: 500 }
        )
    }
}
