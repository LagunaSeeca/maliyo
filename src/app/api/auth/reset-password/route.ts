import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, code, newPassword } = body

        // Validate input
        if (!email || !code || !newPassword) {
            return NextResponse.json(
                { error: "Email, verification code, and new password are required" },
                { status: 400 }
            )
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            )
        }

        // Find the valid OTP
        const otp = await prisma.otp.findFirst({
            where: {
                email,
                code,
                type: 'PASSWORD_RESET',
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

        // Find the user
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        // Hash new password
        const hashedPassword = await hashPassword(newPassword)

        // Update password and mark OTP as used
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            }),
            prisma.otp.update({
                where: { id: otp.id },
                data: { used: true },
            }),
        ])

        return NextResponse.json({
            message: "Password reset successful. You can now login with your new password.",
        })
    } catch (error) {
        console.error("Reset password error:", error)
        return NextResponse.json(
            { error: "Failed to reset password" },
            { status: 500 }
        )
    }
}
