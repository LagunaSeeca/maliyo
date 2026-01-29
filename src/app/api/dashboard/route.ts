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

        // Parallelize independent queries
        const [
            incomeAgg,
            expenseAgg,
            recentIncomes,
            recentExpenses,
            monthlyPayments,
            loans,
            savingsAgg
        ] = await Promise.all([
            // Total Income
            prisma.income.aggregate({
                where: {
                    familyId: family.id,
                    ...(dateFilter && { date: dateFilter }),
                    ...(personId && { personId }),
                    ...(category && { category: category as any }),
                },
                _sum: { amount: true },
            }),
            // Total Expense (excluding SAVINGS - savings should not count as expenses)
            prisma.expense.aggregate({
                where: {
                    familyId: family.id,
                    category: { not: "SAVINGS" },
                    ...(dateFilter && { date: dateFilter }),
                    ...(personId && { personId }),
                },
                _sum: { amount: true },
            }),
            // Recent Incomes
            prisma.income.findMany({
                where: { familyId: family.id },
                include: { person: true },
                orderBy: { date: "desc" },
                take: 5,
            }),
            // Recent Expenses
            prisma.expense.findMany({
                where: { familyId: family.id },
                include: { person: true },
                orderBy: { date: "desc" },
                take: 5,
            }),
            // Active Monthly Payments
            prisma.monthlyPayment.findMany({
                where: {
                    familyId: family.id,
                    isActive: true,
                },
                orderBy: {
                    dayOfMonth: 'asc',
                }
            }),
            // Active Loans for Balance Calculation
            prisma.loan.findMany({
                where: {
                    familyId: family.id,
                    isActive: true,
                },
                include: {
                    payments: true,
                }
            }),
            // Savings Expenses for KPI correction
            prisma.expense.aggregate({
                where: {
                    familyId: family.id,
                    category: "SAVINGS", // Make sure this matches the enum/string exactly
                    ...(dateFilter && { date: dateFilter }),
                    ...(personId && { personId }),
                },
                _sum: { amount: true },
            }),
        ])

        const totalIncome = Number(incomeAgg._sum.amount || 0)
        const totalExpenses = Number(expenseAgg._sum.amount || 0)
        const totalSavingsExpenses = Number(savingsAgg._sum.amount || 0)

        // Net Savings = Sum of expenses categorized as "SAVINGS"
        // User requested strict definition: Income doesn't count, only explicit savings allocations count.
        const netSavings = totalSavingsExpenses

        // Calculate total loan balance
        const totalLoanBalance = loans.reduce((acc, loan) => {
            const totalPaid = loan.payments.reduce((sum, p) => sum + Number(p.amount), 0)
            const balance = Number(loan.totalAmount) - totalPaid
            return acc + (balance > 0 ? balance : 0)
        }, 0)

        // Combine and sort transactions
        const transactions = [
            ...recentIncomes.map(i => ({
                id: i.id,
                type: 'income',
                amount: Number(i.amount),
                category: i.category,
                person: i.person.name,
                date: i.date,
            })),
            ...recentExpenses.map(e => ({
                id: e.id,
                type: 'expense',
                amount: Number(e.amount),
                category: e.category,
                person: e.person.name,
                date: e.date,
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)

        // Calculate expenses by category for charts (separate query if needed, or aggregate here)
        // For efficiency, we might want a separate groupBy query
        const expensesByCategoryRaw = await prisma.expense.groupBy({
            by: ['category'],
            where: {
                familyId: family.id,
                ...(dateFilter && { date: dateFilter }),
            },
            _sum: {
                amount: true,
            },
        })

        const expensesByCategory = expensesByCategoryRaw.map(item => ({
            category: item.category,
            amount: Number(item._sum.amount || 0),
        }))

        // Budget Left = Income - Expenses (savings already excluded from expenses)
        const budgetLeft = totalIncome - totalExpenses

        return NextResponse.json({
            totalIncome,
            totalExpenses,
            netSavings,
            budgetLeft,
            loanBalance: totalLoanBalance,
            recentTransactions: transactions,
            monthlyPayments,
            expensesByCategory
        })

    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        )
    }
}
