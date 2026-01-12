"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Trash2, Loader2, User, Crown, Users as UsersIcon } from "lucide-react"
import { DashboardLayout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { getApiUrl } from "@/lib/api-config"
import { useLanguage } from "@/components/providers/LanguageProvider"

interface Member {
    id: string
    name: string
    role: "OWNER" | "MEMBER"
    createdAt: string
    user?: {
        id: string
        email: string
    }
}

export default function FamilyPage() {
    const { t } = useLanguage()
    const [members, setMembers] = useState<Member[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        role: "MEMBER",
        email: "",
        password: "",
    })

    const fetchMembers = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(getApiUrl("/api/family/members"))
            if (res.ok) {
                const data = await res.json()
                setMembers(data)
            }
        } catch (error) {
            console.error("Failed to fetch members:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchMembers()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const res = await fetch(getApiUrl("/api/family/members"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                setIsDialogOpen(false)
                setFormData({ name: "", role: "MEMBER", email: "", password: "" })
                fetchMembers()
            }
        } catch (error) {
            console.error("Failed to create member:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <DashboardLayout
            title={t.family.title}
            subtitle=""
            headerContent={
                <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t.family.addMember}
                </Button>
            }
        >
            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Card className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
                    <CardContent className="py-6 px-4 flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                            <UsersIcon className="h-7 w-7" />
                        </div>
                        <div>
                            <p className="text-violet-100 text-sm">{t.family.title}</p>
                            <p className="text-3xl font-bold">{members.length}</p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Members Grid */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    <div className="col-span-full flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                    </div>
                ) : members.length === 0 ? (
                    <div className="col-span-full flex items-center justify-center h-64 text-muted-foreground">
                        {t.common.noData}
                    </div>
                ) : (
                    members.map((member, index) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
                                                <User className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-foreground">{member.name}</h3>
                                                {member.user && (
                                                    <p className="text-sm text-muted-foreground">{member.user.email}</p>
                                                )}
                                            </div>
                                        </div>
                                        <Badge
                                            variant={member.role === "OWNER" ? "default" : "secondary"}
                                            className="flex items-center gap-1"
                                        >
                                            {member.role === "OWNER" && <Crown className="h-3 w-3" />}
                                            {member.role === "OWNER" ? t.family.roles.admin : t.family.roles.member}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Add Member Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.family.addMember}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t.family.name}</Label>
                            <Input
                                placeholder={t.family.name}
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t.family.role}</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, role: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t.family.role} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MEMBER">{t.family.roles.member}</SelectItem>
                                    <SelectItem value="OWNER">{t.family.roles.admin}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="pt-4 border-t border-border">
                            <h4 className="text-sm font-medium mb-3 text-foreground">{t.auth.email}</h4>
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label>{t.auth.email}</Label>
                                    <Input
                                        type="email"
                                        placeholder={t.auth.enterEmail}
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>{t.auth.password}</Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
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
                                    t.family.addMember
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    )
}
