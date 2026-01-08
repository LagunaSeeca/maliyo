"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Calendar, Loader2, Pencil, Trash2 } from "lucide-react"
import { DashboardLayout } from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { EXPENSE_CATEGORY_LABELS, formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { getApiUrl } from "@/lib/api-config"

interface MonthlyPayment {
    id: string
    name: string
    amount: string
    dayOfMonth: number
    category: string
    isActive: boolean
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<MonthlyPayment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingPayment, setEditingPayment] = useState<MonthlyPayment | null>(null)
    const [paymentToDelete, setPaymentToDelete] = useState<MonthlyPayment | null>(null)

    const [formData, setFormData] = useState({
        name: "",
        amount: "",
        dayOfMonth: "",
        category: "",
    })

    const fetchPayments = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(getApiUrl("/api/payments"))
            if (res.ok) {
                const data = await res.json()
                setPayments(data.payments)
            }
        } catch (error) {
            console.error("Failed to fetch payments:", error)
            toast.error("Failed to load payments")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPayments()
    }, [])

    const handleEdit = (payment: MonthlyPayment) => {
        setEditingPayment(payment)
        setFormData({
            name: payment.name,
            amount: payment.amount,
            dayOfMonth: payment.dayOfMonth.toString(),
            category: payment.category,
        })
        setIsDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!paymentToDelete) return

        try {
            const res = await fetch(getApiUrl(`/api/payments/${paymentToDelete.id}`), {
                method: "DELETE",
            })

            if (res.ok) {
                toast.success("Payment deleted")
                fetchPayments()
            } else {
                toast.error("Failed to delete payment")
            }
        } catch (error) {
            console.error(error)
            toast.error("Something went wrong")
        } finally {
            setPaymentToDelete(null)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const url = editingPayment
                ? getApiUrl(`/api/payments/${editingPayment.id}`)
                : getApiUrl("/api/payments")

            const method = editingPayment ? "PATCH" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (res.ok) {
                toast.success(editingPayment ? "Payment updated" : "Payment created")
                setIsDialogOpen(false)
                setFormData({
                    name: "",
                    amount: "",
                    dayOfMonth: "",
                    category: "",
                })
                setEditingPayment(null)
                fetchPayments()
            } else {
                toast.error(data.error || "Failed to save payment")
            }
        } catch (error) {
            console.error("Failed to save payment:", error)
            toast.error("Something went wrong")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <DashboardLayout
            title="Monthly Payments"
            subtitle="Manage your fixed monthly bills"
            headerContent={
                <Button onClick={() => {
                    setEditingPayment(null)
                    setFormData({ name: "", amount: "", dayOfMonth: "", category: "" })
                    setIsDialogOpen(true)
                }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment
                </Button>
            }
        >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
                {isLoading ? (
                    <div className="col-span-full flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                    </div>
                ) : payments.length === 0 ? (
                    <div className="col-span-full flex items-center justify-center h-64 text-muted-foreground">
                        No monthly payments configured
                    </div>
                ) : (
                    payments.map((payment, index) => (
                        <motion.div
                            key={payment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="hover:shadow-md transition-shadow group relative">
                                <CardContent className="p-6">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-muted-foreground hover:text-violet-600"
                                            onClick={() => handleEdit(payment)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-muted-foreground hover:text-red-600"
                                            onClick={() => setPaymentToDelete(payment)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-violet-500/10 rounded-xl">
                                            <Calendar className="h-6 w-6 text-violet-500" />
                                        </div>
                                        <Badge variant="outline" className="font-mono">
                                            Day {payment.dayOfMonth}
                                        </Badge>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{payment.name}</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            {EXPENSE_CATEGORY_LABELS[payment.category] || payment.category}
                                        </p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold text-foreground">
                                                {formatCurrency(payment.amount)}
                                            </span>
                                            <span className="text-sm text-muted-foreground">/ month</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingPayment ? "Edit Payment" : "Add Monthly Payment"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Payment Name</Label>
                            <Input
                                placeholder="e.g., Electricity Bill"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Amount (AZN)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="50.00"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Day of Month</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    max="31"
                                    placeholder="15"
                                    value={formData.dayOfMonth}
                                    onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
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
                                    editingPayment ? "Save Changes" : "Add Payment"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!paymentToDelete} onOpenChange={(open: boolean) => !open && setPaymentToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the monthly payment "{paymentToDelete?.name}".
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    )
}
