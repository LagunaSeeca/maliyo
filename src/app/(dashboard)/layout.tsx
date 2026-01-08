"use client"

import { FilterProvider } from "@/components/filters"
import { LayoutProvider, useLayout } from "@/components/providers/layout-provider"
import { Sidebar } from "@/components/layout/sidebar"

function DashboardShell({ children }: { children: React.ReactNode }) {
    const { sidebarOpen, toggleSidebar } = useLayout()

    return (
        <div className="flex h-screen bg-muted/40">
            <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
            <div className="flex flex-1 flex-col overflow-hidden">
                {children}
            </div>
        </div>
    )
}

export default function DashboardGroupLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <LayoutProvider>
            <FilterProvider>
                <DashboardShell>{children}</DashboardShell>
            </FilterProvider>
        </LayoutProvider>
    )
}
