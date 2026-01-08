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
import { DatePicker, DateRangePicker } from "@/components/ui/date-picker"
import { GlobalFilter, useFilters } from "@/components/filters"
import { formatCurrency, formatDate, formatDateTime, INCOME_CATEGORY_LABELS } from "@/lib/utils"
import { getApiUrl } from "@/lib/api-config"
import type { DateRange } from "react-day-picker"

interface Member {
    id: string
    name: string
}

interface Income {
    id: string
    amount: string
    category: string
    description?: string
    date: string
    createdAt: string
    person: {
        id: string
        name: string
    }
}

export default function IncomePage() {
    const { filters } = useFilters()
    const [incomes, setIncomes] = useState<Income[]>([])
    const [members, setMembers] = useState<Member[]>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        amount: "",
        category: "",
        personId: "",
        date: new Date(),
        description: "",
    })

    const fetchIncomes = useCallback(async () => {
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

            const res = await fetch(getApiUrl(`/api/income?${params.toString()}`))
            if (res.ok) {
                const data = await res.json()
                setIncomes(data.incomes)
                setTotal(data.total)
            }
        } catch (error) {
            console.error("Failed to fetch incomes:", error)
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

    useEffect(() => {
        fetchMembers()
    }, [])

    useEffect(() => {
        fetchIncomes()
    }, [fetchIncomes])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const res = await fetch(getApiUrl("/api/income"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount),
                    date: formData.date.toISOString(),
                }),
            })

            if (res.ok) {
                setIsDialogOpen(false)
                setFormData({
                    amount: "",
                    category: "",
                    personId: "",
                    date: new Date(),
                    description: "",
                })
                fetchIncomes()
            }
        } catch (error) {
            console.error("Failed to create income:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this income?")) return

        try {
            const res = await fetch(getApiUrl(`/api/income/${id}`), { method: "DELETE" })
            if (res.ok) {
                fetchIncomes()
            }
        } catch (error) {
            console.error("Failed to delete income:", error)
        }
    }

    return (
        <DashboardLayout
            title="Income"
            subtitle="Track all your income sources"
            headerContent={
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Income
                </Button>
            }
        >
            {/* Filters */}
            <GlobalFilter members={members} type="income" />

            {/* Total Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
            >
                <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                    <CardContent className="p-6">
                        <p className="text-emerald-100 text-sm">Total Income</p>
                        <p className="text-3xl font-bold mt-1">{formatCurrency(total)}</p>
                        <p className="text-emerald-100 text-sm mt-2">
                            {incomes.length} transactions in selected period
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Income Table */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Income History</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                        </div>
                    ) : incomes.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-muted-foreground">
                            No income records found
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Person</TableHead>
                                    <TableHead>Transaction Date</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {incomes.map((income) => (
                                    <TableRow key={income.id}>
                                        <TableCell className="font-medium">
                                            {INCOME_CATEGORY_LABELS[income.category] || income.category}
                                            {income.description && (
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {income.description}
                                                </p>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                                            +{formatCurrency(income.amount)}
                                        </TableCell>
                                        <TableCell>{income.person.name}</TableCell>
                                        <TableCell>{formatDate(income.date)}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatDateTime(income.createdAt)}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(income.id)}
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

            {/* Add Income Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Income</DialogTitle>
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
                                    setFormData({ ...formData, category: value })
                                }
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(INCOME_CATEGORY_LABELS).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

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
                            <Label>Description (Optional)</Label>
                            <Input
                                placeholder="Add a note..."
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
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
                                    "Add Income"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    )
}
