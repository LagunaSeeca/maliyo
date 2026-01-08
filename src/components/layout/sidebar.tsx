"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
    LayoutDashboard,
    TrendingUp,
    TrendingDown,
    Landmark,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Wallet,
    CalendarClock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"

const navItems = [
    {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Income",
        href: "/income",
        icon: TrendingUp,
    },
    {
        title: "Expenses",
        href: "/expenses",
        icon: TrendingDown,
    },
    {
        title: "Loans",
        href: "/loans",
        icon: Landmark,
    },
    {
        title: "Payments",
        href: "/payments",
        icon: CalendarClock,
    },
    {
        title: "Family",
        href: "/family",
        icon: Users,
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
    },
]

interface SidebarProps {
    isOpen: boolean
    onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const pathname = usePathname()
    const isDesktop = useMediaQuery("(min-width: 1024px)")

    const sidebarVariants = {
        mobile: {
            x: isOpen ? 0 : -280,
            opacity: 1, // Ensure opacity is always 1 for visibility logic via transform
        },
        desktop: {
            x: 0,
            opacity: 1,
        }
    }

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={isDesktop ? "desktop" : "mobile"}
                variants={sidebarVariants}
                className={cn(
                    "fixed left-0 top-0 z-50 flex h-full w-[280px] flex-col border-r border-border/60 bg-card shadow-xl lg:shadow-none",
                    "lg:relative lg:!translate-x-0 lg:z-auto"
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between border-b border-border/60 px-6">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                            <Wallet className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Maliyo
                        </span>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={onToggle}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                                onClick={() => {
                                    if (window.innerWidth < 1024) onToggle()
                                }}
                            >
                                <item.icon
                                    className={cn(
                                        "h-5 w-5 transition-colors",
                                        isActive
                                            ? "text-primary"
                                            : "text-muted-foreground group-hover:text-foreground"
                                    )}
                                />
                                {item.title}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                                    />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* User section */}
                <div className="border-t border-border/60 p-4">
                    <form action="/api/auth/logout" method="POST">
                        <Button
                            type="submit"
                            variant="ghost"
                            className="w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Log out
                        </Button>
                    </form>
                </div>
            </motion.aside>
        </>
    )
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClick}
        >
            <Menu className="h-5 w-5" />
        </Button>
    )
}
