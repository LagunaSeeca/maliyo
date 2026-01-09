import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password, name, familyName, otpCode } = body

        // Validate input
        if (!email || !password || !name || !familyName || !otpCode) {
            return NextResponse.json(
                { error: "All fields are required including verification code" },
                { status: 400 }
            )
        }

        // Verify OTP first
        const otp = await prisma.otp.findFirst({
            where: {
                email,
                code: otpCode,
                type: 'REGISTRATION',
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

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await hashPassword(password)

        // Create family
        const family = await prisma.family.create({
            data: {
                name: familyName,
                currency: "AZN",
            },
        })

        // Create user with verified email
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                emailVerified: true,
            },
        })

        // Create family member as owner
        await prisma.familyMember.create({
            data: {
                name,
                role: "OWNER",
                userId: user.id,
                familyId: family.id,
            },
        })

        // Mark OTP as used
        await prisma.otp.update({
            where: { id: otp.id },
            data: { used: true },
        })

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            familyId: family.id,
        })

        // Create response with auth cookie
        const response = NextResponse.json(
            {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                family: {
                    id: family.id,
                    name: family.name,
                },
            },
            { status: 201 }
        )

        response.cookies.set(setAuthCookie(token))

        return response
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Registration failed" },
            { status: 500 }
        )
    }
}
