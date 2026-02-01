import { NextResponse } from "next/server"
import { getCurrentFamily, getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startOfMonth, endOfMonth } from "date-fns"

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

        // Server-side duplicate prevention: Check if already paid this month
        const now = new Date()
        if (payment.lastPaidDate) {
            const lastPaidMonth = startOfMonth(new Date(payment.lastPaidDate))
            const currentMonth = startOfMonth(now)
            if (lastPaidMonth.getTime() === currentMonth.getTime()) {
                return NextResponse.json(
                    { error: "Payment already processed this month" },
                    { status: 409 } // Conflict
                )
            }
        }

        // Create expense record with payment month in note
        const paymentMonthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        const expense = await prisma.expense.create({
            data: {
                amount: payment.amount,
                category: payment.category,
                note: `${payment.name} - ${paymentMonthLabel}`,
                date: now,
                personId: user.familyMember!.id,
                familyId: family.id,
                loanId: payment.loanId, // Link expense to loan if applicable
            },
        })

        // Update the monthly payment's last paid date
        await prisma.monthlyPayment.update({
            where: { id },
            data: {
                lastPaidDate: now,
            },
        })

        // If this is a loan payment, also create a LoanPayment record
        if (payment.loanId) {
            await prisma.loanPayment.create({
                data: {
                    loanId: payment.loanId,
                    amount: payment.amount,
                    paymentDate: now,
                },
            })
        }

        return NextResponse.json({ success: true, expense })

    } catch (error) {
        console.error("Failed to process payment:", error)
        return NextResponse.json(
            { error: "Failed to process payment" },
            { status: 500 }
        )
    }
}
