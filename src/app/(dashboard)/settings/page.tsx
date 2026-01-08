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

export default function SettingsPage() {
    const { theme, setTheme } = useTheme()
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
            toast.error("Failed to load profile data")
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
                toast.success("Profile updated successfully")
                setUserProfile(prev => ({ ...prev, name: data.user.name }))
            } else {
                toast.error(data.error || "Failed to update profile")
            }
        } catch (error) {
            console.error("Failed to update profile", error)
            toast.error("Something went wrong")
        } finally {
            setIsSaving(false)
        }
    }

    const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
        const newSettings = { ...notifications, [key]: value }
        setNotifications(newSettings)
        localStorage.setItem("notification-settings", JSON.stringify(newSettings))
        toast.success("Notification settings saved")
    }

    if (!mounted) {
        return null // or a loading skeleton
    }

    return (
        <DashboardLayout
            title="Settings"
            subtitle="Manage your account and preferences"
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
                                    <CardTitle>Profile</CardTitle>
                                    <CardDescription>Your personal information</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input
                                    placeholder="Your name"
                                    value={userProfile.name}
                                    onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
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
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
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
                                    <CardTitle>Appearance</CardTitle>
                                    <CardDescription>Customize your experience</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label>Theme</Label>
                                <Tabs value={theme} onValueChange={setTheme} className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="light" className="flex items-center gap-2">
                                            <Sun className="h-4 w-4" />
                                            Light
                                        </TabsTrigger>
                                        <TabsTrigger value="dark" className="flex items-center gap-2">
                                            <Moon className="h-4 w-4" />
                                            Dark
                                        </TabsTrigger>
                                        <TabsTrigger value="system" className="flex items-center gap-2">
                                            <Laptop className="h-4 w-4" />
                                            System
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Currency Display</p>
                                    <p className="text-sm text-muted-foreground">AZN (Azerbaijani Manat)</p>
                                </div>
                                <Button variant="outline" size="sm" disabled>Change</Button>
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
                                    <CardTitle>Notifications</CardTitle>
                                    <CardDescription>Manage your alerts</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Payment Reminders</p>
                                    <p className="text-sm text-muted-foreground">Get notified about upcoming loan payments</p>
                                </div>
                                <Switch
                                    checked={notifications.payments}
                                    onCheckedChange={(checked) => handleNotificationChange('payments', checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Budget Alerts</p>
                                    <p className="text-sm text-muted-foreground">Warn when approaching budget limits</p>
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
                                    <CardTitle>Security</CardTitle>
                                    <CardDescription>Password and authentication</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Current Password</Label>
                                <Input type="password" placeholder="••••••••" />
                            </div>
                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <Input type="password" placeholder="••••••••" />
                            </div>
                            <Button>Update Password</Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </DashboardLayout>
    )
}
