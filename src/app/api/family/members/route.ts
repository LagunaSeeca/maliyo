import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { hash } from "bcryptjs"

export async function GET() {
    try {
        const session = await getSession()

        if (!session?.familyId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const members = await prisma.familyMember.findMany({
            where: {
                familyId: session.familyId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        })

        return NextResponse.json(members)
    } catch (error) {
        console.error("Get family members error:", error)
        return NextResponse.json(
            { error: "Failed to fetch family members" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession()

        if (!session?.familyId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { name, role, email, password } = body

        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            )
        }

        let userId: string | undefined

        // If email/password provided, create a User account
        if (email && password) {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email },
            })

            if (existingUser) {
                return NextResponse.json(
                    { error: "User with this email already exists" },
                    { status: 409 }
                )
            }

            // Hash password
            const hashedPassword = await hash(password, 10)

            // Create User
            const newUser = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                },
            })

            userId = newUser.id
        }

        const member = await prisma.familyMember.create({
            data: {
                name,
                role: role || "MEMBER",
                familyId: session.familyId,
                userId: userId, // Link to user if created
            },
        })

        return NextResponse.json(member, { status: 201 })
    } catch (error) {
        console.error("Create family member error:", error)
        return NextResponse.json(
            { error: "Failed to create family member" },
            { status: 500 }
        )
    }
}
