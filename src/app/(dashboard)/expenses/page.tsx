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
import { formatCurrency, formatDate, formatDateTime, EXPENSE_CATEGORY_LABELS } from "@/lib/utils"
import { getApiUrl } from "@/lib/api-config"

interface Member {
    id: string
    name: string
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

export default function ExpensesPage() {
    const { filters } = useFilters()
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [members, setMembers] = useState<Member[]>([])
    const [loans, setLoans] = useState<Loan[]>([])
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
            const res = await fetch(getApiUrl("/api/family/members"))
            if (res.ok) {
                const data = await res.json()
                setMembers(data)
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
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

            if (res.ok) {
                setIsDialogOpen(false)
                setFormData({
                    amount: "",
                    category: "",
                    personId: "",
                    date: new Date(),
                    note: "",
                    loanId: "",
                })
                fetchExpenses()
            }
        } catch (error) {
            console.error("Failed to create expense:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this expense?")) return

        try {
            const res = await fetch(getApiUrl(`/api/expenses/${id}`), { method: "DELETE" })
            if (res.ok) {
                fetchExpenses()
            }
        } catch (error) {
            console.error("Failed to delete expense:", error)
        }
    }

    return (
        <DashboardLayout
            title="Expenses"
            subtitle="Track all your expenses"
            headerContent={
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
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
                    <CardContent className="p-6">
                        <p className="text-red-100 text-sm">Total Expenses</p>
                        <p className="text-3xl font-bold mt-1">{formatCurrency(total)}</p>
                        <p className="text-red-100 text-sm mt-2">
                            {expenses.length} transactions in selected period
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Expenses Table */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Expense History</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-muted-foreground">
                            No expense records found
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Person</TableHead>
                                    <TableHead>Transaction Date</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell className="font-medium">
                                            {EXPENSE_CATEGORY_LABELS[expense.category] || expense.category}
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
                                        <TableCell className="text-muted-foreground">
                                            {formatDateTime(expense.createdAt)}
                                        </TableCell>
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
                        <DialogTitle>Add Expense</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Amount (AZN)</Label>
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
                            <Label>Category</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, category: value, loanId: "" })
                                }
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {formData.category === "LOAN_PAYMENT" && (
                            <div className="space-y-2">
                                <Label>Select Loan</Label>
                                <Select
                                    value={formData.loanId}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, loanId: value })
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select loan" />
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
                            <Label>Person</Label>
                            <Select
                                value={formData.personId}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, personId: value })
                                }
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select person" />
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
                            <Label>Transaction Date</Label>
                            <DatePicker
                                date={formData.date}
                                onDateChange={(date) =>
                                    setFormData({ ...formData, date: date || new Date() })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Note (Optional)</Label>
                            <Input
                                placeholder="Add a note..."
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
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Add Expense"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    )
}
