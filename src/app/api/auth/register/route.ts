import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password, name, familyName } = body

        // Validate input
        if (!email || !password || !name || !familyName) {
            return NextResponse.json(
                { error: "All fields are required" },
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

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        })

        // Create family member as owner
        const familyMember = await prisma.familyMember.create({
            data: {
                name,
                role: "OWNER",
                userId: user.id,
                familyId: family.id,
            },
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
