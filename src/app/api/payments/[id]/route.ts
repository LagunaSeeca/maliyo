import { NextResponse } from "next/server"
import { getCurrentFamily, getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser()
        const family = await getCurrentFamily()

        if (!user || !family) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const json = await request.json()
        const { name, amount, dayOfMonth, category } = json

        const payment = await prisma.monthlyPayment.update({
            where: {
                id: params.id,
                familyId: family.id, // Security check
            },
            data: {
                name,
                amount,
                dayOfMonth: Number(dayOfMonth),
                category,
            },
        })

        return NextResponse.json({ payment })
    } catch (error) {
        console.error("Failed to update payment:", error)
        return NextResponse.json(
            { error: "Failed to update payment" },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser()
        const family = await getCurrentFamily()

        if (!user || !family) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        await prisma.monthlyPayment.delete({
            where: {
                id: params.id,
                familyId: family.id, // Security check
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to delete payment:", error)
        return NextResponse.json(
            { error: "Failed to delete payment" },
            { status: 500 }
        )
    }
}
