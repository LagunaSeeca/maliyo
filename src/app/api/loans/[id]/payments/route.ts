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
        const searchParams = request.nextUrl.searchParams
        const startDate = searchParams.get("startDate")
        const endDate = searchParams.get("endDate")

        const where: Record<string, unknown> = {
            loanId: id,
        }

        if (startDate && endDate) {
            where.paymentDate = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            }
        }

        const payments = await prisma.loanPayment.findMany({
            where,
            orderBy: {
                paymentDate: "desc",
            },
        })

        const total = payments.reduce(
            (sum, payment) => sum + Number(payment.amount),
            0
        )

        return NextResponse.json({
            payments,
            total,
            count: payments.length,
        })
    } catch (error) {
        console.error("Get loan payments error:", error)
        return NextResponse.json(
            { error: "Failed to fetch loan payments" },
            { status: 500 }
        )
    }
}

export async function POST(
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
        const { amount, paymentDate } = body

        if (!amount || !paymentDate) {
            return NextResponse.json(
                { error: "Amount and payment date are required" },
                { status: 400 }
            )
        }

        const payment = await prisma.loanPayment.create({
            data: {
                amount,
                paymentDate: new Date(paymentDate),
                loanId: id,
            },
        })

        return NextResponse.json(payment, { status: 201 })
    } catch (error) {
        console.error("Create loan payment error:", error)
        return NextResponse.json(
            { error: "Failed to create loan payment" },
            { status: 500 }
        )
    }
}
