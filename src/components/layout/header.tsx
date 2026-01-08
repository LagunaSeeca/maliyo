"use client"

import React from "react"
import Link from "next/link"
import { Bell, Search, User, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MobileMenuButton } from "./sidebar"

interface HeaderProps {
    title: string
    subtitle?: string
    onMenuClick: () => void
    children?: React.ReactNode
}

export function Header({ title, subtitle, onMenuClick, children }: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-md lg:px-8">
            <div className="flex items-center gap-3">
                <MobileMenuButton onClick={onMenuClick} />
                <Link href="/" className="flex items-center gap-2 lg:hidden">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20">
                        <Wallet className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent hidden sm:inline">
                        Maliyo
                    </span>
                </Link>
                <div className="hidden lg:block">
                    <h1 className="text-xl font-semibold text-foreground">{title}</h1>
                    {subtitle && (
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3">
                {children}
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600">
                    <User className="h-4 w-4 text-white" />
                </Button>
            </div>
        </header>
    )
}

interface PageContainerProps {
    children: React.ReactNode
    className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
    return (
        <div className={`flex-1 overflow-auto p-4 lg:p-8 ${className || ""}`}>
            <div className="mx-auto max-w-7xl">
                {children}
            </div>
        </div>
    )
}
