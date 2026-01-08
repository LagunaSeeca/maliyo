import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()

        if (!session?.familyId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { id } = await params

        await prisma.income.delete({
            where: {
                id,
                familyId: session.familyId,
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete income error:", error)
        return NextResponse.json(
            { error: "Failed to delete income" },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()

        if (!session?.familyId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { id } = await params
        const body = await request.json()
        const { amount, category, personId, date, description } = body

        const income = await prisma.income.update({
            where: {
                id,
                familyId: session.familyId,
            },
            data: {
                amount,
                category,
                personId,
                date: new Date(date),
                description,
            },
            include: {
                person: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        return NextResponse.json(income)
    } catch (error) {
        console.error("Update income error:", error)
        return NextResponse.json(
            { error: "Failed to update income" },
            { status: 500 }
        )
    }
}
