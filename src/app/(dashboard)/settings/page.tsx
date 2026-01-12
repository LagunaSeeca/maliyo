"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Settings as SettingsIcon, User, Bell, Lock, Palette, Moon, Sun, Laptop } from "lucide-react"
import { useTheme } from "next-themes"
import { DashboardLayout } from "@/components/layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { getApiUrl } from "@/lib/api-config"
import { useLanguage } from "@/components/providers/LanguageProvider"

export default function SettingsPage() {
    const { theme, setTheme } = useTheme()
    const { t } = useLanguage()
    const [mounted, setMounted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [userProfile, setUserProfile] = useState({
        name: "",
        email: ""
    })
    const [notifications, setNotifications] = useState({
        payments: true,
        budget: true
    })

    // Avoid hydration mismatch and fetch initial data
    useEffect(() => {
        setMounted(true)
        const saved = localStorage.getItem("notification-settings")
        if (saved) {
            try {
                setNotifications(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to parse notification settings", e)
            }
        }
        fetchUserProfile()
    }, [])

    const fetchUserProfile = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(getApiUrl("/api/user/profile"))
            if (res.ok) {
                const data = await res.json()
                setUserProfile({
                    name: data.user.name || "",
                    email: data.user.email || ""
                })
            }
        } catch (error) {
            console.error("Failed to fetch user profile", error)
            toast.error(t.errors.somethingWentWrong)
        } finally {
            setIsLoading(false)
        }
    }

    const handleProfileUpdate = async () => {
        setIsSaving(true)
        try {
            const res = await fetch(getApiUrl("/api/user/profile"), {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: userProfile.name })
            })

            const data = await res.json()

            if (res.ok) {
                toast.success(t.settings.profileUpdated)
                setUserProfile(prev => ({ ...prev, name: data.user.name }))
            } else {
                toast.error(data.error || t.errors.somethingWentWrong)
            }
        } catch (error) {
            console.error("Failed to update profile", error)
            toast.error(t.errors.somethingWentWrong)
        } finally {
            setIsSaving(false)
        }
    }

    const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
        const newSettings = { ...notifications, [key]: value }
        setNotifications(newSettings)
        localStorage.setItem("notification-settings", JSON.stringify(newSettings))
        toast.success(t.success.saved)
    }

    if (!mounted) {
        return null
    }

    return (
        <DashboardLayout
            title={t.settings.title}
            subtitle=""
        >
            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/20">
                                    <User className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                </div>
                                <div>
                                    <CardTitle>{t.settings.profile}</CardTitle>
                                    <CardDescription>{t.settings.fullName}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t.settings.fullName}</Label>
                                <Input
                                    placeholder={t.settings.fullName}
                                    value={userProfile.name}
                                    onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t.settings.email}</Label>
                                <Input
                                    type="email"
                                    placeholder={t.auth.enterEmail}
                                    value={userProfile.email}
                                    disabled={true}
                                    className="bg-muted"
                                />
                            </div>
                            <Button
                                onClick={handleProfileUpdate}
                                disabled={isSaving || isLoading}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t.common.loading}
                                    </>
                                ) : (
                                    t.common.save
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Appearance Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/20">
                                    <Palette className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <CardTitle>{t.settings.appearance}</CardTitle>
                                    <CardDescription>{t.settings.theme}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label>{t.settings.theme}</Label>
                                <Tabs value={theme} onValueChange={setTheme} className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="light" className="flex items-center gap-2">
                                            <Sun className="h-4 w-4" />
                                            {t.settings.themes.light}
                                        </TabsTrigger>
                                        <TabsTrigger value="dark" className="flex items-center gap-2">
                                            <Moon className="h-4 w-4" />
                                            {t.settings.themes.dark}
                                        </TabsTrigger>
                                        <TabsTrigger value="system" className="flex items-center gap-2">
                                            <Laptop className="h-4 w-4" />
                                            {t.settings.themes.system}
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{t.settings.currency}</p>
                                    <p className="text-sm text-muted-foreground">{t.currency.azn} (Azerbaijani Manat)</p>
                                </div>
                                <Button variant="outline" size="sm" disabled>{t.common.edit}</Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Notification Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/20">
                                    <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <CardTitle>{t.settings.notifications}</CardTitle>
                                    <CardDescription>{t.settings.notificationSettings}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{t.settings.paymentReminders}</p>
                                    <p className="text-sm text-muted-foreground">{t.dashboard.monthlyPayments}</p>
                                </div>
                                <Switch
                                    checked={notifications.payments}
                                    onCheckedChange={(checked) => handleNotificationChange('payments', checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{t.settings.weeklyReports}</p>
                                    <p className="text-sm text-muted-foreground">{t.dashboard.expensesByCategory}</p>
                                </div>
                                <Switch
                                    checked={notifications.budget}
                                    onCheckedChange={(checked) => handleNotificationChange('budget', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Security Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/20">
                                    <Lock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <CardTitle>{t.settings.security}</CardTitle>
                                    <CardDescription>{t.settings.changePassword}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t.settings.currentPassword}</Label>
                                <Input type="password" placeholder="••••••••" />
                            </div>
                            <div className="space-y-2">
                                <Label>{t.settings.newPassword}</Label>
                                <Input type="password" placeholder="••••••••" />
                            </div>
                            <Button>{t.settings.changePassword}</Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </DashboardLayout>
    )
}
