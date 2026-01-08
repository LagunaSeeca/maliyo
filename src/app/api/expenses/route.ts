import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        const session = await getSession()

        if (!session?.familyId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const searchParams = request.nextUrl.searchParams
        const startDate = searchParams.get("startDate")
        const endDate = searchParams.get("endDate")
        const category = searchParams.get("category")
        const personId = searchParams.get("personId")

        const where: Record<string, unknown> = {
            familyId: session.familyId,
        }

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            }
        }

        if (category) {
            where.category = category
        }

        if (personId) {
            where.personId = personId
        }

        const expenses = await prisma.expense.findMany({
            where,
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
            orderBy: {
                date: "desc",
            },
        })

        // Calculate totals
        const total = expenses.reduce(
            (sum, expense) => sum + Number(expense.amount),
            0
        )

        // Calculate category breakdown
        const categoryTotals: Record<string, number> = {}
        expenses.forEach((expense) => {
            categoryTotals[expense.category] =
                (categoryTotals[expense.category] || 0) + Number(expense.amount)
        })

        return NextResponse.json({
            expenses,
            total,
            count: expenses.length,
            categoryTotals,
        })
    } catch (error) {
        console.error("Get expenses error:", error)
        return NextResponse.json(
            { error: "Failed to fetch expenses" },
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
        const { amount, category, personId, date, note, loanId } = body

        if (!amount || !category || !personId || !date) {
            return NextResponse.json(
                { error: "Amount, category, person, and date are required" },
                { status: 400 }
            )
        }

        // Create expense
        const expense = await prisma.expense.create({
            data: {
                amount,
                category,
                personId,
                date: new Date(date),
                note,
                familyId: session.familyId,
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

        // If this is a loan payment, create a loan payment record
        if (category === "LOAN_PAYMENT" && loanId) {
            await prisma.loanPayment.create({
                data: {
                    amount,
                    paymentDate: new Date(date),
                    loanId,
                },
            })
        }

        return NextResponse.json(expense, { status: 201 })
    } catch (error) {
        console.error("Create expense error:", error)
        return NextResponse.json(
            { error: "Failed to create expense" },
            { status: 500 }
        )
    }
}
