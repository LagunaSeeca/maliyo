"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useTheme } from "next-themes"

export interface CustomColors {
    background: string
    foreground: string
    primary: string
    secondary: string
    accent: string
}

const defaultLightColors: CustomColors = {
    background: "#ffffff",
    foreground: "#0a1929",
    primary: "#8b5cf6",
    secondary: "#f1f5f9",
    accent: "#f59e0b"
}

const defaultDarkColors: CustomColors = {
    background: "#0a1929",
    foreground: "#f8fafc",
    primary: "#8b5cf6",
    secondary: "#1e293b",
    accent: "#f59e0b"
}

interface CustomThemeContextType {
    customColors: CustomColors
    setCustomColors: (colors: CustomColors) => void
    resetToDefaults: () => void
    isCustomTheme: boolean
}

const CustomThemeContext = createContext<CustomThemeContextType | undefined>(undefined)

export function useCustomTheme() {
    const context = useContext(CustomThemeContext)
    if (!context) {
        throw new Error("useCustomTheme must be used within a CustomThemeProvider")
    }
    return context
}

// Convert hex to HSL for CSS variables
function hexToHsl(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return "0 0% 0%"

    let r = parseInt(result[1], 16) / 255
    let g = parseInt(result[2], 16) / 255
    let b = parseInt(result[3], 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6
                break
            case g:
                h = ((b - r) / d + 2) / 6
                break
            case b:
                h = ((r - g) / d + 4) / 6
                break
        }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme()
    const [customColors, setCustomColorsState] = useState<CustomColors>(defaultLightColors)
    const [mounted, setMounted] = useState(false)

    const isCustomTheme = theme === "custom"

    // Load custom colors from localStorage on mount
    useEffect(() => {
        setMounted(true)
        const saved = localStorage.getItem("custom-theme-colors")
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setCustomColorsState(parsed)
            } catch (e) {
                console.error("Failed to parse custom theme colors", e)
            }
        }
    }, [])

    // Apply custom colors to CSS when theme is custom
    useEffect(() => {
        if (!mounted) return

        const root = document.documentElement

        if (isCustomTheme) {
            // Apply custom colors as CSS variables
            root.style.setProperty("--background", hexToHsl(customColors.background))
            root.style.setProperty("--foreground", hexToHsl(customColors.foreground))
            root.style.setProperty("--primary", hexToHsl(customColors.primary))
            root.style.setProperty("--primary-foreground", "210 40% 98%")
            root.style.setProperty("--secondary", hexToHsl(customColors.secondary))
            root.style.setProperty("--secondary-foreground", hexToHsl(customColors.foreground))
            root.style.setProperty("--accent", hexToHsl(customColors.accent))
            root.style.setProperty("--accent-foreground", hexToHsl(customColors.foreground))
            root.style.setProperty("--muted", hexToHsl(customColors.secondary))
            root.style.setProperty("--muted-foreground", hexToHsl(customColors.foreground))
            root.style.setProperty("--card", hexToHsl(customColors.background))
            root.style.setProperty("--card-foreground", hexToHsl(customColors.foreground))
            root.style.setProperty("--popover", hexToHsl(customColors.background))
            root.style.setProperty("--popover-foreground", hexToHsl(customColors.foreground))
            root.style.setProperty("--border", hexToHsl(customColors.secondary))
            root.style.setProperty("--input", hexToHsl(customColors.secondary))
            root.style.setProperty("--ring", hexToHsl(customColors.primary))
        } else {
            // Reset inline styles when switching away from custom theme
            root.style.removeProperty("--background")
            root.style.removeProperty("--foreground")
            root.style.removeProperty("--primary")
            root.style.removeProperty("--primary-foreground")
            root.style.removeProperty("--secondary")
            root.style.removeProperty("--secondary-foreground")
            root.style.removeProperty("--accent")
            root.style.removeProperty("--accent-foreground")
            root.style.removeProperty("--muted")
            root.style.removeProperty("--muted-foreground")
            root.style.removeProperty("--card")
            root.style.removeProperty("--card-foreground")
            root.style.removeProperty("--popover")
            root.style.removeProperty("--popover-foreground")
            root.style.removeProperty("--border")
            root.style.removeProperty("--input")
            root.style.removeProperty("--ring")
        }
    }, [isCustomTheme, customColors, mounted])

    const setCustomColors = useCallback((colors: CustomColors) => {
        setCustomColorsState(colors)
        localStorage.setItem("custom-theme-colors", JSON.stringify(colors))
    }, [])

    const resetToDefaults = useCallback(() => {
        const defaults = theme === "dark" ? defaultDarkColors : defaultLightColors
        setCustomColors(defaults)
    }, [theme, setCustomColors])

    return (
        <CustomThemeContext.Provider
            value={{
                customColors,
                setCustomColors,
                resetToDefaults,
                isCustomTheme
            }}
        >
            {children}
        </CustomThemeContext.Provider>
    )
}
