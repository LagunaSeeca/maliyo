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
        const activeOnly = searchParams.get("active") === "true"

        const where: Record<string, unknown> = {
            familyId: session.familyId,
        }

        if (activeOnly) {
            where.isActive = true
        }

        const loans = await prisma.loan.findMany({
            where,
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
            orderBy: {
                createdAt: "desc",
            },
        })

        // Calculate loan stats for each loan
        const loansWithStats = loans.map((loan) => {
            const totalPaid = loan.payments.reduce(
                (sum, payment) => sum + Number(payment.amount),
                0
            )
            const remainingBalance = Number(loan.totalAmount) - totalPaid
            const progress = (totalPaid / Number(loan.totalAmount)) * 100

            // Calculate next payment date
            const lastPayment = loan.payments[0]
            let nextPaymentDate = new Date(loan.startDate)
            if (lastPayment) {
                nextPaymentDate = new Date(lastPayment.paymentDate)
                nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)
            }

            return {
                ...loan,
                totalPaid,
                remainingBalance,
                progress: Math.min(100, progress),
                nextPaymentDate,
                paymentCount: loan.payments.length,
            }
        })

        // Calculate totals
        const totalLoanAmount = loans.reduce(
            (sum, loan) => sum + Number(loan.totalAmount),
            0
        )
        const totalRemaining = loansWithStats.reduce(
            (sum, loan) => sum + loan.remainingBalance,
            0
        )

        return NextResponse.json({
            loans: loansWithStats,
            totalLoanAmount,
            totalRemaining,
            count: loans.length,
        })
    } catch (error) {
        console.error("Get loans error:", error)
        return NextResponse.json(
            { error: "Failed to fetch loans" },
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
        const {
            name,
            ownerId,
            totalAmount,
            startDate,
            durationMonths,
            interestRate,
            overdueRate,
            monthlyPayment,
        } = body

        if (
            !name ||
            !ownerId ||
            !totalAmount ||
            !startDate ||
            !durationMonths ||
            interestRate === undefined ||
            overdueRate === undefined ||
            !monthlyPayment
        ) {
            return NextResponse.json(
                { error: "All loan fields are required" },
                { status: 400 }
            )
        }

        // Create loan and associated monthly payment in a transaction
        const startDateObj = new Date(startDate)
        const dayOfMonth = startDateObj.getDate()

        const [loan] = await prisma.$transaction([
            prisma.loan.create({
                data: {
                    name,
                    ownerId,
                    totalAmount,
                    startDate: startDateObj,
                    durationMonths,
                    interestRate,
                    overdueRate,
                    monthlyPayment,
                    familyId: session.familyId,
                },
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),
        ])

        // Create associated monthly payment for the loan
        await prisma.monthlyPayment.create({
            data: {
                name: `Loan: ${name}`,
                amount: monthlyPayment,
                dayOfMonth,
                category: "LOAN_PAYMENT",
                familyId: session.familyId,
                loanId: loan.id,
                isActive: true,
            },
        })

        return NextResponse.json(loan, { status: 201 })
    } catch (error) {
        console.error("Create loan error:", error)
        return NextResponse.json(
            { error: "Failed to create loan" },
            { status: 500 }
        )
    }
}
