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

        await prisma.expense.delete({
            where: {
                id,
                familyId: session.familyId,
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete expense error:", error)
        return NextResponse.json(
            { error: "Failed to delete expense" },
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
        const { amount, category, personId, date, note, loanId } = body

        const expense = await prisma.expense.update({
            where: {
                id,
                familyId: session.familyId,
            },
            data: {
                amount,
                category,
                personId,
                date: new Date(date),
                note,
                loanId: category === "LOAN_PAYMENT" ? loanId : null,
            },
            include: {
                person: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                loan: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        return NextResponse.json(expense)
    } catch (error) {
        console.error("Update expense error:", error)
        return NextResponse.json(
            { error: "Failed to update expense" },
            { status: 500 }
        )
    }
}
