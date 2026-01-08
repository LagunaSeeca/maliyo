"use client"

import React from "react"
import { Header } from "./header"
import { useLayout } from "@/components/providers/layout-provider"

interface DashboardLayoutProps {
    children: React.ReactNode
    title: string
    subtitle?: string
    headerContent?: React.ReactNode
}

export function DashboardLayout({
    children,
    title,
    subtitle,
    headerContent,
}: DashboardLayoutProps) {
    const { toggleSidebar } = useLayout()

    return (
        <>
            <Header
                title={title}
                subtitle={subtitle}
                onMenuClick={toggleSidebar}
            >
                {headerContent}
            </Header>
            <main className="flex-1 overflow-auto p-4 lg:p-8">
                <div className="mx-auto max-w-7xl">
                    {children}
                </div>
            </main>
        </>
    )
}
