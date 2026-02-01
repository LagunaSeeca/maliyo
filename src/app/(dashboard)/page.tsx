"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    TrendingUp,
    TrendingDown,
    Loader2,
    Plus,
    CalendarClock,
    PiggyBank,
    Landmark,
} from "lucide-react"
import { DashboardLayout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DateRangePicker } from "@/components/ui/date-picker"
import { Button } from "@/components/ui/button"
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from "recharts"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { FilterProvider, useFilters } from "@/components/filters"
import { formatCurrency, formatDate, getExpenseCategoryLabel, getIncomeCategoryLabel } from "@/lib/utils"
import Link from "next/link"
import { getApiUrl } from "@/lib/api-config"
import { useLanguage } from "@/components/providers/LanguageProvider"

interface MonthlyPayment {
    id: string
    name: string
    amount: string
    dayOfMonth: number
    lastPaidDate: string | null
    dueDate: string
    paymentMonth: string
    isPaidThisMonth: boolean
}

interface DashboardStats {
    totalIncome: number
    totalExpenses: number
    netSavings: number
    budgetLeft: number
    expensesByCategory: Array<{ category: string; amount: number }>
    recentTransactions: Array<{
        id: string
        type: "income" | "expense"
        amount: number
        category: string
        person: string
        date: string
    }>
    monthlyPayments?: MonthlyPayment[]
    loanBalance: number
}

function DashboardContent() {
    const { filters, setDateRange, setPreset } = useFilters()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [payingId, setPayingId] = useState<string | null>(null)
    const { t } = useLanguage()

    const fetchStats = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (filters.dateRange?.from) {
                params.set("startDate", filters.dateRange.from.toISOString())
            }
            if (filters.dateRange?.to) {
                params.set("endDate", filters.dateRange.to.toISOString())
            }

            const res = await fetch(getApiUrl(`/api/dashboard?${params.toString()}`))
            if (res.ok) {
                const data = await res.json()
                setStats(data)
            }
        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handlePay = async (paymentId: string) => {
        if (payingId) return // Prevent multiple clicks
        setPayingId(paymentId)
        try {
            const res = await fetch(getApiUrl(`/api/payments/${paymentId}/pay`), {
                method: "POST",
            })

            if (res.ok) {
                toast.success(t.success.saved)
                fetchStats()
            } else {
                toast.error(t.errors.somethingWentWrong)
            }
        } catch (error) {
            console.error(error)
            toast.error(t.errors.somethingWentWrong)
        } finally {
            setPayingId(null)
        }
    }

    React.useEffect(() => {
        fetchStats()
    }, [filters.dateRange])

    const budgetLeft = stats?.budgetLeft || 0
    const isPositiveBudget = budgetLeft >= 0

    const kpiCards = [
        {
            title: t.dashboard.totalIncome,
            value: stats?.totalIncome || 0,
            icon: TrendingUp,
            color: "from-emerald-500 to-teal-500",
            bgColor: "bg-emerald-500/10",
            textColor: "text-emerald-600 dark:text-emerald-400",
        },
        {
            title: t.dashboard.totalExpenses,
            value: stats?.totalExpenses || 0,
            icon: TrendingDown,
            color: "from-red-500 to-rose-500",
            bgColor: "bg-red-500/10",
            textColor: "text-red-600 dark:text-red-400",
        },
        {
            title: t.dashboard.budgetLeft,
            value: budgetLeft,
            icon: Wallet,
            color: isPositiveBudget ? "from-blue-500 to-cyan-500" : "from-orange-500 to-red-500",
            bgColor: isPositiveBudget ? "bg-blue-500/10" : "bg-orange-500/10",
            textColor: isPositiveBudget ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400",
        },
        {
            title: t.dashboard.savings,
            value: stats?.netSavings || 0,
            icon: PiggyBank,
            color: "from-violet-500 to-indigo-500",
            bgColor: "bg-violet-500/10",
            textColor: "text-violet-600 dark:text-violet-400",
        },
        {
            title: t.dashboard.loanBalance,
            value: stats?.loanBalance || 0,
            icon: Landmark,
            color: "from-amber-500 to-orange-500",
            bgColor: "bg-amber-500/10",
            textColor: "text-amber-600 dark:text-amber-400",
        },
    ].filter(Boolean)

    const presets = [
        { label: t.time.allTime || "All Time", value: "all_time" as const },
        { label: t.dashboard.thisMonth, value: "this_month" as const },
        { label: t.time.lastMonth, value: "last_month" as const },
        { label: t.time.last3Months, value: "last_3_months" as const },
    ]

    return (
        <DashboardLayout
            title={t.dashboard.title}
            subtitle=""
            headerContent={
                <div className="flex gap-2">
                    <Button size="sm" className="hidden sm:flex" asChild>
                        <Link href="/income">
                            <Plus className="h-4 w-4 mr-1" /> {t.nav.income}
                        </Link>
                    </Button>
                    <Button size="sm" variant="destructive" className="hidden sm:flex" asChild>
                        <Link href="/expenses">
                            <Plus className="h-4 w-4 mr-1" /> {t.nav.expenses}
                        </Link>
                    </Button>
                </div>
            }
        >
            {/* Quick Actions Card (Visible on Mobile especially) */}
            <div className="mb-4 grid grid-cols-2 gap-2 sm:hidden">
                <Link href="/income">
                    <Card className="bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                        <CardContent className="p-3 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <TrendingUp className="h-5 w-5 mb-1" />
                            <span className="font-medium text-xs">{t.dashboard.addIncome}</span>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/expenses">
                    <Card className="bg-red-500/10 border-red-500/20 hover:bg-red-500/20 transition-colors">
                        <CardContent className="p-3 flex flex-col items-center justify-center text-red-600 dark:text-red-400">
                            <TrendingDown className="h-5 w-5 mb-1" />
                            <span className="font-medium text-xs">{t.dashboard.addExpense}</span>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/loans" className="col-span-2">
                    <Card className="bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 transition-colors">
                        <CardContent className="p-3 flex flex-col items-center justify-center text-amber-600 dark:text-amber-400">
                            <Landmark className="h-5 w-5 mb-1" />
                            <span className="font-medium text-xs">{t.loans.title}</span>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Date Controls */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
                    {presets.map((preset) => (
                        <Button
                            key={preset.value}
                            variant={filters.preset === preset.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPreset(preset.value)}
                            className="whitespace-nowrap flex-shrink-0"
                        >
                            {preset.label}
                        </Button>
                    ))}
                </div>
                <DateRangePicker
                    dateRange={filters.dateRange}
                    onDateRangeChange={setDateRange}
                    className="sm:ml-auto w-full sm:w-auto"
                />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-6 sm:mb-8">
                {kpiCards.map((card, index) => (
                    <motion.div
                        key={card.title + index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="">
                            <CardContent className="p-3 sm:p-4 lg:p-5">
                                <div className="flex items-center justify-between">
                                    <div
                                        className={`flex h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 items-center justify-center rounded-lg sm:rounded-xl ${card.bgColor}`}
                                    >
                                        <card.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 ${card.textColor}`} />
                                    </div>
                                </div>
                                <div className="mt-2 sm:mt-3">
                                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{card.title}</p>
                                    <div className={`text-base sm:text-lg lg:text-2xl font-bold ${card.textColor}`}>
                                        {isLoading ? "..." : formatCurrency(card.value)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Active Monthly Payments */}
                <div className="lg:col-span-7">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t.dashboard.monthlyPayments}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center justify-center h-48">
                                    <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                                </div>
                            ) : stats?.monthlyPayments && stats.monthlyPayments.length > 0 ? (
                                <div className="space-y-4">
                                    {stats.monthlyPayments.map((payment) => {
                                        // Use isPaidThisMonth from API instead of computing locally
                                        const isPaid = payment.isPaidThisMonth;

                                        return (
                                            <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl border border-border/60 bg-card hover:shadow-sm transition-shadow gap-3">
                                                <div className="flex items-center gap-3 sm:gap-4">
                                                    <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${isPaid ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                                        <CalendarClock className="h-5 w-5 sm:h-6 sm:w-6" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h4 className="font-medium text-foreground truncate">{payment.name}</h4>
                                                        <p className="text-sm text-muted-foreground">{t.dashboard.dueOn}: {formatDate(payment.dueDate, 'dd MMMM yyyy')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pl-10 sm:pl-0">
                                                    <div className="text-left sm:text-right">
                                                        <p className="font-bold text-foreground">{formatCurrency(payment.amount)}</p>
                                                        <p className={`text-xs font-medium ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                            {isPaid ? t.payments.paid : t.payments.unpaid}
                                                        </p>
                                                    </div>
                                                    {!isPaid && (
                                                        <Button
                                                            size="sm"
                                                            className="bg-violet-600 hover:bg-violet-700 text-white flex-shrink-0"
                                                            onClick={() => handlePay(payment.id)}
                                                            disabled={payingId === payment.id}
                                                        >
                                                            {payingId === payment.id ? t.common.loading : t.dashboard.markAsPaid}
                                                        </Button>
                                                    )}
                                                    {isPaid && (
                                                        <Button size="sm" variant="ghost" disabled className="text-emerald-600 font-medium flex-shrink-0">
                                                            ✓
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="h-48 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-xl">
                                    <p>{t.dashboard.noPaymentsScheduled}</p>
                                    <Button variant="link" asChild className="mt-2 text-violet-600">
                                        <Link href="/payments">{t.payments.addPayment}</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Transactions */}
                <div className="lg:col-span-5">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="text-lg">{t.dashboard.recentTransactions}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-12 animate-pulse bg-slate-100 rounded-lg" />
                                    ))}
                                </div>
                            ) : stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.recentTransactions.slice(0, 6).map((tx) => (
                                        <div
                                            key={tx.id}
                                            className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${tx.type === "income" || tx.category === "SAVINGS"
                                                        ? "bg-emerald-500/10"
                                                        : "bg-red-500/10"
                                                        }`}
                                                >
                                                    {tx.type === "income" || tx.category === "SAVINGS" ? (
                                                        <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                                                    ) : (
                                                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">
                                                        {tx.type === "income"
                                                            ? getIncomeCategoryLabel(tx.category, t)
                                                            : getExpenseCategoryLabel(tx.category, t)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {tx.person} • {formatDate(tx.date)}
                                                    </p>
                                                </div>
                                            </div>
                                            <span
                                                className={`text-sm font-semibold ${tx.type === "income" || tx.category === "SAVINGS"
                                                    ? "text-emerald-600"
                                                    : "text-red-600"
                                                    }`}
                                            >
                                                {tx.type === "income" ? "+" : "-"}
                                                {formatCurrency(tx.amount)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-48 flex items-center justify-center text-muted-foreground">
                                    {t.dashboard.noRecentTransactions}
                                </div>
                            )}
                            <div className="pt-4 text-center">
                                <Link href="/expenses" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                                    {t.common.viewAll}
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 mt-6">
                {/* Expense Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">{t.dashboard.expensesByCategory}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="h-64 flex items-center justify-center">
                                <div className="animate-spin h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full" />
                            </div>
                        ) : stats?.expensesByCategory && stats.expensesByCategory.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {stats.expensesByCategory
                                    .sort((a, b) => b.amount - a.amount)
                                    .slice(0, 9)
                                    .map((item) => {
                                        const percentage =
                                            (item.amount / (stats.totalExpenses || 1)) * 100
                                        return (
                                            <div key={item.category} className="space-y-2 p-3 border rounded-lg bg-card/50">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground font-medium">
                                                        {getExpenseCategoryLabel(item.category, t)}
                                                    </span>
                                                    <span className="font-bold text-foreground">
                                                        {formatCurrency(item.amount)}
                                                    </span>
                                                </div>
                                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percentage}%` }}
                                                        transition={{ duration: 0.5, delay: 0.2 }}
                                                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                                                    />
                                                </div>
                                                <p className="text-xs text-right text-muted-foreground">{percentage.toFixed(1)}%</p>
                                            </div>
                                        )
                                    })}
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                {t.common.noData}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

export default function DashboardPage() {
    return (
        <FilterProvider>
            <DashboardContent />
        </FilterProvider>
    )
}
