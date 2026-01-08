import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword, generateToken, setAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            )
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                familyMember: {
                    include: {
                        family: true,
                    },
                },
            },
        })

        if (!user) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            )
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password)

        if (!isValid) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            )
        }

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            familyId: user.familyMember?.familyId || null,
        })

        // Create response with auth cookie
        const response = NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            family: user.familyMember?.family || null,
        })

        response.cookies.set(setAuthCookie(token))

        return response
    } catch (error) {
        console.error("Login error:", error)
        return NextResponse.json(
            { error: "Login failed" },
            { status: 500 }
        )
    }
}
