import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: Request) {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { name } = body

        if (!name || name.trim() === "") {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            )
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { name: name.trim() },
        })

        return NextResponse.json({
            message: "Profile updated successfully",
            user: {
                name: updatedUser.name,
                email: updatedUser.email,
            }
        })

    } catch (error) {
        console.error("Failed to update profile:", error)
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
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
                name: user.name,
                email: user.email,
            }
        })
    } catch (error) {
        console.error("Failed to fetch profile:", error)
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        )
    }
}
