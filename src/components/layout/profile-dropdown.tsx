"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Settings, LogOut, Loader2 } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function ProfileDropdown() {
    const router = useRouter()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            })

            if (res.ok || res.redirected) {
                // Clear any client-side state and redirect to login
                router.push("/auth/login")
                router.refresh()
            }
        } catch (error) {
            console.error("Logout failed:", error)
            // Still redirect to login on error
            router.push("/auth/login")
        } finally {
            setIsLoggingOut(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 transition-all duration-200"
                >
                    <User className="h-4 w-4 text-white" />
                    <span className="sr-only">Open profile menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-destructive focus:text-destructive cursor-pointer"
                >
                    {isLoggingOut ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            <span>Logging out...</span>
                        </>
                    ) : (
                        <>
                            <LogOut className="h-4 w-4 mr-2" />
                            <span>Log out</span>
                        </>
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
