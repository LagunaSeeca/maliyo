import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(
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

        const loan = await prisma.loan.findUnique({
            where: {
                id,
                familyId: session.familyId,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                payments: {
                    orderBy: {
                        paymentDate: "desc",
                    },
                },
            },
        })

        if (!loan) {
            return NextResponse.json(
                { error: "Loan not found" },
                { status: 404 }
            )
        }

        // Calculate stats
        const totalPaid = loan.payments.reduce(
            (sum, payment) => sum + Number(payment.amount),
            0
        )
        const remainingBalance = Number(loan.totalAmount) - totalPaid
        const progress = (totalPaid / Number(loan.totalAmount)) * 100

        return NextResponse.json({
            ...loan,
            totalPaid,
            remainingBalance,
            progress: Math.min(100, progress),
        })
    } catch (error) {
        console.error("Get loan error:", error)
        return NextResponse.json(
            { error: "Failed to fetch loan" },
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

        const loan = await prisma.loan.update({
            where: {
                id,
                familyId: session.familyId,
            },
            data: body,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        return NextResponse.json(loan)
    } catch (error) {
        console.error("Update loan error:", error)
        return NextResponse.json(
            { error: "Failed to update loan" },
            { status: 500 }
        )
    }
}

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

        await prisma.loan.delete({
            where: {
                id,
                familyId: session.familyId,
            },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete loan error:", error)
        return NextResponse.json(
            { error: "Failed to delete loan" },
            { status: 500 }
        )
    }
}
