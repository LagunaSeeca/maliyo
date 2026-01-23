"use client"

import React, { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { DashboardLayout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { GlobalFilter, useFilters } from "@/components/filters"
import { formatCurrency, formatDate, formatDateTime, getExpenseCategoryLabel } from "@/lib/utils"
import { getApiUrl } from "@/lib/api-config"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { toast } from "sonner"

interface Member {
    id: string
    name: string
    user?: {
        id: string
        email: string
    }
}

interface Loan {
    id: string
    name: string
}

interface Expense {
    id: string
    amount: string
    category: string
    note?: string
    date: string
    createdAt: string
    person: {
        id: string
        name: string
    }
    loan?: {
        id: string
        name: string
    }
}

interface CurrentUser {
    memberId: string
    name: string
}

export default function ExpensesPage() {
    const { filters } = useFilters()
    const { t } = useLanguage()
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [members, setMembers] = useState<Member[]>([])
    const [loans, setLoans] = useState<Loan[]>([])
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        amount: "",
        category: "",
        personId: "",
        date: new Date(),
        note: "",
        loanId: "",
    })

    const fetchExpenses = useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams()
            if (filters.dateRange?.from) {
                params.set("startDate", filters.dateRange.from.toISOString())
            }
            if (filters.dateRange?.to) {
                params.set("endDate", filters.dateRange.to.toISOString())
            }
            if (filters.category) {
                params.set("category", filters.category)
            }
            if (filters.personId) {
                params.set("personId", filters.personId)
            }

            const res = await fetch(getApiUrl(`/api/expenses?${params.toString()}`))
            if (res.ok) {
                const data = await res.json()
                setExpenses(data.expenses)
                setTotal(data.total)
            }
        } catch (error) {
            console.error("Failed to fetch expenses:", error)
        } finally {
            setIsLoading(false)
        }
    }, [filters])

    const fetchMembers = async () => {
        try {
            // Fetch current user profile first
            const profileRes = await fetch(getApiUrl("/api/user/profile"))
            let currentUserEmail = ""
            if (profileRes.ok) {
                const profileData = await profileRes.json()
                currentUserEmail = profileData.user?.email || ""
            }

            const res = await fetch(getApiUrl("/api/family/members"))
            if (res.ok) {
                const data = await res.json()
                setMembers(data)

                // Find current user's family member
                if (currentUserEmail) {
                    const currentMember = data.find((m: Member) => m.user?.email === currentUserEmail)
                    if (currentMember) {
                        setCurrentUser({
                            memberId: currentMember.id,
                            name: currentMember.name,
                        })
                        // Auto-set personId in form
                        setFormData(prev => ({ ...prev, personId: currentMember.id }))
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch members:", error)
        }
    }

    const fetchLoans = async () => {
        try {
            const res = await fetch(getApiUrl("/api/loans?active=true"))
            if (res.ok) {
                const data = await res.json()
                setLoans(data.loans)
            }
        } catch (error) {
            console.error("Failed to fetch loans:", error)
        }
    }

    useEffect(() => {
        fetchMembers()
        fetchLoans()
    }, [])

    useEffect(() => {
        fetchExpenses()
    }, [fetchExpenses])

    // Auto-set personId when dialog opens
    useEffect(() => {
        if (isDialogOpen && currentUser) {
            setFormData(prev => ({ ...prev, personId: currentUser.memberId }))
        }
    }, [isDialogOpen, currentUser])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.personId) {
            toast.error(t.errors?.somethingWentWrong || "User not found")
            return
        }

        setIsSubmitting(true)

        try {
            const res = await fetch(getApiUrl("/api/expenses"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount),
                    date: formData.date.toISOString(),
                    loanId: formData.category === "LOAN_PAYMENT" ? formData.loanId : undefined,
                }),
            })

            const data = await res.json()

            if (res.ok) {
                toast.success(t.success?.saved || "Expense added successfully")
                setIsDialogOpen(false)
                setFormData({
                    amount: "",
                    category: "",
                    personId: currentUser?.memberId || "",
                    date: new Date(),
                    note: "",
                    loanId: "",
                })
                fetchExpenses()
            } else {
                toast.error(data.error || t.errors?.somethingWentWrong || "Failed to add expense")
            }
        } catch (error) {
            console.error("Failed to create expense:", error)
            toast.error(t.errors?.somethingWentWrong || "Failed to add expense")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm(t.confirm.delete)) return

        try {
            const res = await fetch(getApiUrl(`/api/expenses/${id}`), { method: "DELETE" })
            if (res.ok) {
                fetchExpenses()
            }
        } catch (error) {
            console.error("Failed to delete expense:", error)
        }
    }

    // Expense categories - must match Prisma ExpenseCategory enum
    const expenseCategories = [
        { key: 'TRANSPORT', label: t.expenses.categories.transport },
        { key: 'PETROL', label: t.expenses.categories.petrol },
        { key: 'BABY_FOOD', label: t.expenses.categories.babyFood },
        { key: 'BABY_DIAPERS', label: t.expenses.categories.babyDiapers },
        { key: 'GROCERY', label: t.expenses.categories.grocery },
        { key: 'UTILITY_ELECTRICITY', label: t.expenses.categories.utilityElectricity },
        { key: 'UTILITY_GAS', label: t.expenses.categories.utilityGas },
        { key: 'UTILITY_WATER', label: t.expenses.categories.utilityWater },
        { key: 'SAVINGS', label: t.expenses.categories.savings },
        { key: 'PERSONAL_EXPENSES', label: t.expenses.categories.personalExpenses },
        { key: 'BIRTHDAYS_WEDDINGS', label: t.expenses.categories.birthdaysWeddings },
        { key: 'ONLINE_SHOPPING', label: t.expenses.categories.onlineShopping },
        { key: 'LOAN_PAYMENT', label: t.loans.title },
    ]

    return (
        <DashboardLayout
            title={t.expenses.title}
            subtitle=""
            headerContent={
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t.expenses.addExpense}
                </Button>
            }
        >
            {/* Filters */}
            <GlobalFilter members={members} type="expense" />

            {/* Total Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
            >
                <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white">
                    <CardContent className="py-6 px-4 flex flex-col justify-center items-start text-left">
                        <p className="text-red-100 text-sm">{t.dashboard.totalExpenses}</p>
                        <p className="text-3xl font-bold mt-1">{formatCurrency(total)}</p>
                        <p className="text-red-100 text-sm mt-2">
                            {expenses.length} {t.dashboard.recentTransactions.toLowerCase()}
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Expenses Table */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>{t.expenses.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-muted-foreground">
                            {t.common.noData}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t.expenses.category}</TableHead>
                                    <TableHead>{t.expenses.amount}</TableHead>
                                    <TableHead>{t.family.name}</TableHead>
                                    <TableHead>{t.expenses.date}</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell className="font-medium">
                                            {getExpenseCategoryLabel(expense.category, t)}
                                            {expense.loan && (
                                                <p className="text-xs text-violet-500 mt-0.5">
                                                    → {expense.loan.name}
                                                </p>
                                            )}
                                            {expense.note && (
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {expense.note}
                                                </p>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-semibold text-red-600 dark:text-red-400">
                                            -{formatCurrency(expense.amount)}
                                        </TableCell>
                                        <TableCell>{expense.person.name}</TableCell>
                                        <TableCell>{formatDate(expense.date)}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(expense.id)}
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Add Expense Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.expenses.addExpense}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t.expenses.amount} (AZN)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) =>
                                    setFormData({ ...formData, amount: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t.expenses.category}</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, category: value, loanId: "" })
                                }
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t.expenses.category} />
                                </SelectTrigger>
                                <SelectContent>
                                    {expenseCategories.map((cat) => (
                                        <SelectItem key={cat.key} value={cat.key}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.category === "LOAN_PAYMENT" && (
                            <div className="space-y-2">
                                <Label>{t.loans.title}</Label>
                                <Select
                                    value={formData.loanId}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, loanId: value })
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t.loans.title} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loans.map((loan) => (
                                            <SelectItem key={loan.id} value={loan.id}>
                                                {loan.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>{t.family.name}</Label>
                            <Select
                                value={formData.personId}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, personId: value })
                                }
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t.family.name} />
                                </SelectTrigger>
                                <SelectContent>
                                    {members.map((member) => (
                                        <SelectItem key={member.id} value={member.id}>
                                            {member.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>{t.expenses.date}</Label>
                            <DatePicker
                                date={formData.date}
                                onDateChange={(date) =>
                                    setFormData({ ...formData, date: date || new Date() })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t.expenses.notes}</Label>
                            <Input
                                placeholder={t.expenses.notes}
                                value={formData.note}
                                onChange={(e) =>
                                    setFormData({ ...formData, note: e.target.value })
                                }
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                {t.common.cancel}
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    t.expenses.addExpense
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    )
}
