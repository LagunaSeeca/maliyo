"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, Settings, LogOut, Loader2, Globe, Check } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { languages, Language } from "@/i18n"

export function ProfileDropdown() {
    const router = useRouter()
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const { language, setLanguage, t } = useLanguage()

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

    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang)
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
            <DropdownMenuContent align="end" className="w-56">
                {/* Language Selection Submenu */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="cursor-pointer">
                        <Globe className="h-4 w-4 mr-2" />
                        <span>{t.settings.language}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                            {languages.find(l => l.code === language)?.flag}
                        </span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                        <DropdownMenuSubContent className="min-w-[160px]">
                            {languages.map((lang) => (
                                <DropdownMenuItem
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className="cursor-pointer flex items-center justify-between"
                                >
                                    <span className="flex items-center gap-2">
                                        <span>{lang.flag}</span>
                                        <span>{lang.name}</span>
                                    </span>
                                    {language === lang.code && (
                                        <Check className="h-4 w-4 text-primary" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="h-4 w-4" />
                        <span>{t.nav.settings}</span>
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
                            <span>{t.auth.loggingOut}</span>
                        </>
                    ) : (
                        <>
                            <LogOut className="h-4 w-4 mr-2" />
                            <span>{t.nav.logout}</span>
                        </>
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
