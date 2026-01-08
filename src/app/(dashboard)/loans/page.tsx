"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Trash2, Loader2, Calendar, Percent, DollarSign } from "lucide-react"
import { DashboardLayout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
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
import { formatCurrency, formatDate } from "@/lib/utils"
import { getApiUrl } from "@/lib/api-config"

interface Member {
    id: string
    name: string
}

interface LoanPayment {
    id: string
    amount: string
    paymentDate: string
    createdAt: string
}

interface Loan {
    id: string
    name: string
    totalAmount: string
    startDate: string
    durationMonths: number
    interestRate: string
    overdueRate: string
    monthlyPayment: string
    isActive: boolean
    createdAt: string
    owner: {
        id: string
        name: string
    }
    payments: LoanPayment[]
    totalPaid: number
    remainingBalance: number
    progress: number
    nextPaymentDate: string
    paymentCount: number
}

export default function LoansPage() {
    const [loans, setLoans] = useState<Loan[]>([])
    const [members, setMembers] = useState<Member[]>([])
    const [totalRemaining, setTotalRemaining] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        ownerId: "",
        totalAmount: "",
        startDate: new Date(),
        durationMonths: "",
        interestRate: "",
        overdueRate: "",
        monthlyPayment: "",
    })

    const fetchLoans = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(getApiUrl("/api/loans"))
            if (res.ok) {
                const data = await res.json()
                setLoans(data.loans)
                setTotalRemaining(data.totalRemaining)
            }
        } catch (error) {
            console.error("Failed to fetch loans:", error)
        } finally {
            setIsLoading(false)
        }
    }

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
        fetchLoans()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const res = await fetch(getApiUrl("/api/loans"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    totalAmount: parseFloat(formData.totalAmount),
                    monthlyPayment: parseFloat(formData.monthlyPayment),
                    durationMonths: parseInt(formData.durationMonths),
                    interestRate: parseFloat(formData.interestRate),
                    overdueRate: parseFloat(formData.overdueRate),
                    startDate: formData.startDate.toISOString(),
                }),
            })

            if (res.ok) {
                setIsDialogOpen(false)
                setFormData({
                    name: "",
                    ownerId: "",
                    totalAmount: "",
                    startDate: new Date(),
                    durationMonths: "",
                    interestRate: "",
                    overdueRate: "",
                    monthlyPayment: "",
                })
                fetchLoans()
            }
        } catch (error) {
            console.error("Failed to create loan:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this loan?")) return

        try {
            const res = await fetch(getApiUrl(`/api/loans/${id}`), { method: "DELETE" })
            if (res.ok) {
                fetchLoans()
                setSelectedLoan(null)
            }
        } catch (error) {
            console.error("Failed to delete loan:", error)
        }
    }

    return (
        <DashboardLayout
            title="Loans"
            subtitle="Manage your loans and payments"
            headerContent={
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Loan
                </Button>
            }
        >
            {/* Total Balance Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                    <CardContent className="p-6">
                        <p className="text-amber-100 text-sm">Total Loan Balance</p>
                        <p className="text-3xl font-bold mt-1">{formatCurrency(totalRemaining)}</p>
                        <p className="text-amber-100 text-sm mt-2">
                            {loans.filter(l => l.isActive).length} active loans
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Loan Cards */}
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    <div className="col-span-full flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                    </div>
                ) : loans.length === 0 ? (
                    <div className="col-span-full flex items-center justify-center h-64 text-slate-400">
                        No loans found
                    </div>
                ) : (
                    loans.map((loan, index) => (
                        <motion.div
                            key={loan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card
                                className="cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => setSelectedLoan(loan)}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{loan.name}</CardTitle>
                                        <Badge variant={loan.isActive ? "success" : "secondary"}>
                                            {loan.isActive ? "Active" : "Completed"}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{loan.owner.name}</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Progress</span>
                                            <span className="font-medium">{loan.progress.toFixed(1)}%</span>
                                        </div>
                                        <Progress value={loan.progress} />

                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Remaining</p>
                                                <p className="font-semibold text-amber-600 dark:text-amber-400">
                                                    {formatCurrency(loan.remainingBalance)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Monthly</p>
                                                <p className="font-semibold">
                                                    {formatCurrency(loan.monthlyPayment)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-border">
                                            <p className="text-xs text-muted-foreground">Next Payment</p>
                                            <p className="text-sm font-medium">
                                                {formatDate(loan.nextPaymentDate)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Loan Detail Dialog */}
            <Dialog open={!!selectedLoan} onOpenChange={() => setSelectedLoan(null)}>
                <DialogContent className="max-w-2xl">
                    {selectedLoan && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center justify-between">
                                    <DialogTitle>{selectedLoan.name}</DialogTitle>
                                    <Badge variant={selectedLoan.isActive ? "success" : "secondary"}>
                                        {selectedLoan.isActive ? "Active" : "Completed"}
                                    </Badge>
                                </div>
                            </DialogHeader>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
                                <div className="text-center p-3 rounded-xl bg-muted">
                                    <DollarSign className="h-5 w-5 mx-auto text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground mt-1">Total Amount</p>
                                    <p className="font-semibold">{formatCurrency(selectedLoan.totalAmount)}</p>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-amber-500/10">
                                    <DollarSign className="h-5 w-5 mx-auto text-amber-500" />
                                    <p className="text-xs text-muted-foreground mt-1">Remaining</p>
                                    <p className="font-semibold text-amber-600 dark:text-amber-400">
                                        {formatCurrency(selectedLoan.remainingBalance)}
                                    </p>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-muted">
                                    <Percent className="h-5 w-5 mx-auto text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground mt-1">Interest Rate</p>
                                    <p className="font-semibold">{selectedLoan.interestRate}%</p>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-muted">
                                    <Calendar className="h-5 w-5 mx-auto text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground mt-1">Duration</p>
                                    <p className="font-semibold">{selectedLoan.durationMonths} months</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium">Payment Progress</p>
                                <Progress value={selectedLoan.progress} className="h-4" />
                                <p className="text-xs text-muted-foreground">
                                    {formatCurrency(selectedLoan.totalPaid)} paid of {formatCurrency(selectedLoan.totalAmount)}
                                </p>
                            </div>

                            {/* Payment History */}
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-2">Payment History</p>
                                {selectedLoan.payments.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No payments recorded yet
                                    </p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {selectedLoan.payments.slice(0, 5).map((payment) => (
                                                <TableRow key={payment.id}>
                                                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                                                    <TableCell className="font-medium text-emerald-600">
                                                        {formatCurrency(payment.amount)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(selectedLoan.id)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Loan
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Add Loan Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add New Loan</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Loan Name</Label>
                            <Input
                                placeholder="e.g., Home Mortgage"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Loan Owner</Label>
                            <Select
                                value={formData.ownerId}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, ownerId: value })
                                }
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select owner" />
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Total Amount (AZN)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.totalAmount}
                                    onChange={(e) =>
                                        setFormData({ ...formData, totalAmount: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Monthly Payment (AZN)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.monthlyPayment}
                                    onChange={(e) =>
                                        setFormData({ ...formData, monthlyPayment: e.target.value })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <DatePicker
                                    date={formData.startDate}
                                    onDateChange={(date) =>
                                        setFormData({ ...formData, startDate: date || new Date() })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Duration (months)</Label>
                                <Input
                                    type="number"
                                    placeholder="12"
                                    value={formData.durationMonths}
                                    onChange={(e) =>
                                        setFormData({ ...formData, durationMonths: e.target.value })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Interest Rate (%)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="12.5"
                                    value={formData.interestRate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, interestRate: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Overdue Rate (%)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="18.0"
                                    value={formData.overdueRate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, overdueRate: e.target.value })
                                    }
                                    required
                                />
                            </div>
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
                                    "Create Loan"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    )
}
