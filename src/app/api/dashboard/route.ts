import { NextResponse } from "next/server"
import { getCurrentFamily, getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser()
        const family = await getCurrentFamily()

        if (!user || !family) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const startDate = searchParams.get("startDate")
        const endDate = searchParams.get("endDate")
        const category = searchParams.get("category")
        const personId = searchParams.get("personId")

        const dateFilter = startDate && endDate ? {
            gte: new Date(startDate),
            lte: new Date(endDate),
        } : undefined

        const errors: any[] = []

        // Helper for safe query execution
        const safeQuery = async <T>(name: string, promise: Promise<T>, fallback: T): Promise<T> => {
            try {
                return await promise
            } catch (e: any) {
                console.error(`Query failed: ${name}`, e)
                errors.push({ query: name, error: e.message || String(e) })
                return fallback
            }
        }

        // Execute queries safely
        const [incomeAgg, expenseAgg, recentIncomes, recentExpenses, monthlyPayments, loans, savingsAgg] = await Promise.all([
            // Total Income
            safeQuery('incomeAgg', prisma.income.aggregate({
                where: {
                    familyId: family.id,
                    ...(dateFilter && { date: dateFilter }),
                    ...(personId && { personId }),
                    ...(category && { category: category as any }),
                },
                _sum: { amount: true },
            }), { _sum: { amount: null } }),

            // Total Expense
            safeQuery('expenseAgg', prisma.expense.aggregate({
                where: {
                    familyId: family.id,
                    category: { not: "SAVINGS" },
                    ...(dateFilter && { date: dateFilter }),
                    ...(personId && { personId }),
                },
                _sum: { amount: true },
            }), { _sum: { amount: null } }),

            // Recent Incomes
            safeQuery('recentIncomes', prisma.income.findMany({
                where: { familyId: family.id },
                include: { person: true },
                orderBy: { date: "desc" },
                take: 5,
            }), [] as any[]),

            // Recent Expenses
            safeQuery('recentExpenses', prisma.expense.findMany({
                where: { familyId: family.id },
                include: { person: true },
                orderBy: { date: "desc" },
                take: 5,
            }), [] as any[]),

            // Active Monthly Payments
            safeQuery('monthlyPayments', prisma.monthlyPayment.findMany({
                where: {
                    familyId: family.id,
                    isActive: true,
                },
                orderBy: {
                    dayOfMonth: 'asc',
                }
            }), [] as any[]),

            // Active Loans
            safeQuery('loans', prisma.loan.findMany({
                where: {
                    familyId: family.id,
                    isActive: true,
                },
                include: {
                    payments: true,
                }
            }), [] as any[]),

            // Savings
            safeQuery('savingsAgg', prisma.expense.aggregate({
                where: {
                    familyId: family.id,
                    category: "SAVINGS",
                    ...(dateFilter && { date: dateFilter }),
                    ...(personId && { personId }),
                },
                _sum: { amount: true },
            }), { _sum: { amount: null } }),
        ])

        const totalIncome = Number(incomeAgg?._sum?.amount?.toString() || 0)
        const totalExpenses = Number(expenseAgg?._sum?.amount?.toString() || 0)
        const totalSavingsExpenses = Number(savingsAgg?._sum?.amount?.toString() || 0)

        // Net Savings
        const netSavings = totalSavingsExpenses

        // Calculate total loan balance safely
        const totalLoanBalance = loans.reduce((acc, loan) => {
            try {
                const totalPaid = (loan.payments || []).reduce((sum: number, p: any) => sum + Number(p.amount?.toString() || 0), 0)
                const balance = Number(loan.totalAmount?.toString() || 0) - totalPaid
                return acc + (balance > 0 ? balance : 0)
            } catch (e) {
                return acc
            }
        }, 0)

        // Combine and sort transactions safely
        const transactions = [
            ...recentIncomes.map(i => ({
                id: i.id,
                type: 'income',
                amount: Number(i.amount?.toString() || 0),
                category: i.category,
                person: i.person?.name || 'Unknown',
                date: i.date,
            })),
            ...recentExpenses.map(e => ({
                id: e.id,
                type: 'expense',
                amount: Number(e.amount?.toString() || 0),
                category: e.category,
                person: e.person?.name || 'Unknown',
                date: e.date,
            }))
        ].sort((a, b) => {
            try {
                return new Date(b.date).getTime() - new Date(a.date).getTime()
            } catch (e) {
                return 0
            }
        }).slice(0, 10)

        // Calculate expenses by category
        const expensesByCategoryRaw = await safeQuery('expensesByCategory', prisma.expense.groupBy({
            by: ['category'],
            where: {
                familyId: family.id,
                ...(dateFilter && { date: dateFilter }),
            },
            _sum: {
                amount: true,
            },
        }), [])

        const expensesByCategory = expensesByCategoryRaw.map((item: any) => ({
            category: item.category,
            amount: Number(item._sum?.amount?.toString() || 0),
        }))

        const budgetLeft = totalIncome - totalExpenses

        // Process monthly payments
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth()

        const processedPayments = monthlyPayments.map(payment => {
            try {
                const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
                const dueDay = Math.min(payment.dayOfMonth || 1, lastDayOfMonth) // Fallback due day
                const dueDate = new Date(currentYear, currentMonth, dueDay)

                const lastPaid = payment.lastPaidDate ? new Date(payment.lastPaidDate) : null
                const isPaidThisMonth = lastPaid &&
                    lastPaid.getMonth() === currentMonth &&
                    lastPaid.getFullYear() === currentYear

                let paymentMonth = ""
                try {
                    paymentMonth = dueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                } catch (e) {
                    paymentMonth = `${dueDate.getMonth() + 1}/${dueDate.getFullYear()}`
                }

                return {
                    ...payment,
                    amount: payment.amount?.toString() || "0",
                    dueDate: dueDate.toISOString(),
                    paymentMonth,
                    isPaidThisMonth: !!isPaidThisMonth,
                }
            } catch (e) {
                console.error("Error processing payment:", e)
                return null
            }
        }).filter(Boolean).filter((payment: any) => {
            if (!payment.isPaidThisMonth) return true
            return false
        })

        return NextResponse.json({
            totalIncome,
            totalExpenses,
            netSavings,
            budgetLeft,
            loanBalance: totalLoanBalance,
            recentTransactions: transactions,
            monthlyPayments: processedPayments,
            expensesByCategory,
            _debug: errors.length > 0 ? errors : undefined
        })

    } catch (error: any) {
        console.error("Failed to fetch dashboard stats:", error)
        return NextResponse.json(
            { error: "Failed to fetch stats", details: error.message || String(error) },
            { status: 500 }
        )
    }
}
