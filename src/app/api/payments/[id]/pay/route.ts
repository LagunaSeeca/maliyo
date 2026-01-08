import { NextResponse } from "next/server"
import { getCurrentFamily, getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        const family = await getCurrentFamily()
        const { id } = await params

        if (!user || !family) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const payment = await prisma.monthlyPayment.findUnique({
            where: { id },
        })

        if (!payment || payment.familyId !== family.id) {
            return NextResponse.json(
                { error: "Payment not found" },
                { status: 404 }
            )
        }

        // Transaction to create expense and update payment status
        const [expense] = await prisma.$transaction([
            prisma.expense.create({
                data: {
                    amount: payment.amount,
                    category: payment.category,
                    note: `Monthly Payment: ${payment.name}`,
                    date: new Date(),
                    personId: user.familyMember!.id,
                    familyId: family.id,
                },
            }),
            prisma.monthlyPayment.update({
                where: { id },
                data: {
                    lastPaidDate: new Date(),
                },
            }),
        ])

        return NextResponse.json({ success: true, expense })

    } catch (error) {
        console.error("Failed to process payment:", error)
        return NextResponse.json(
            { error: "Failed to process payment" },
            { status: 500 }
        )
    }
}
