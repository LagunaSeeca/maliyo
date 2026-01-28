"use client"

import React, { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Palette } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useCustomTheme, CustomColors } from "@/components/providers/CustomThemeProvider"
import { useLanguage } from "@/components/providers/LanguageProvider"

interface CustomThemeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

interface ColorInputProps {
    label: string
    value: string
    onChange: (value: string) => void
}

function ColorInput({ label, value, onChange }: ColorInputProps) {
    return (
        <div className="flex items-center justify-between gap-4">
            <Label className="text-sm font-medium min-w-[80px]">{label}</Label>
            <div className="flex items-center gap-2">
                <div
                    className="w-8 h-8 rounded-lg border-2 border-border shadow-sm"
                    style={{ backgroundColor: value }}
                />
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-12 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                />
            </div>
        </div>
    )
}

export function CustomThemeDialog({ open, onOpenChange }: CustomThemeDialogProps) {
    const { customColors, setCustomColors, resetToDefaults } = useCustomTheme()
    const { setTheme } = useTheme()
    const { t } = useLanguage()

    // Local state for editing
    const [localColors, setLocalColors] = useState<CustomColors>(customColors)

    // Sync local state when dialog opens or customColors change
    useEffect(() => {
        if (open) {
            setLocalColors(customColors)
        }
    }, [open, customColors])

    const handleColorChange = (key: keyof CustomColors, value: string) => {
        setLocalColors(prev => ({ ...prev, [key]: value }))
    }

    const handleApply = () => {
        setCustomColors(localColors)
        setTheme("custom")
        onOpenChange(false)
    }

    const handleReset = () => {
        const defaults = {
            background: "#ffffff",
            foreground: "#0a1929",
            primary: "#8b5cf6",
            secondary: "#f1f5f9",
            accent: "#f59e0b"
        }
        setLocalColors(defaults)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                            <Palette className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle>{t.settings.customTheme.title}</DialogTitle>
                            <DialogDescription>
                                {t.settings.customTheme.description}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Color Preview */}
                    <div
                        className="rounded-xl p-4 border-2 border-dashed transition-colors"
                        style={{
                            backgroundColor: localColors.background,
                            borderColor: localColors.secondary
                        }}
                    >
                        <p
                            className="text-sm font-medium mb-2"
                            style={{ color: localColors.foreground }}
                        >
                            {t.settings.customTheme.preview}
                        </p>
                        <div className="flex gap-2">
                            <div
                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                                style={{ backgroundColor: localColors.primary }}
                            >
                                Primary
                            </div>
                            <div
                                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                                style={{
                                    backgroundColor: localColors.secondary,
                                    color: localColors.foreground
                                }}
                            >
                                Secondary
                            </div>
                            <div
                                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                                style={{ backgroundColor: localColors.accent }}
                            >
                                Accent
                            </div>
                        </div>
                    </div>

                    {/* Color Inputs */}
                    <div className="space-y-3">
                        <ColorInput
                            label={t.settings.customTheme.backgroundColor}
                            value={localColors.background}
                            onChange={(v) => handleColorChange("background", v)}
                        />
                        <ColorInput
                            label={t.settings.customTheme.textColor}
                            value={localColors.foreground}
                            onChange={(v) => handleColorChange("foreground", v)}
                        />
                        <ColorInput
                            label={t.settings.customTheme.primaryColor}
                            value={localColors.primary}
                            onChange={(v) => handleColorChange("primary", v)}
                        />
                        <ColorInput
                            label={t.settings.customTheme.secondaryColor}
                            value={localColors.secondary}
                            onChange={(v) => handleColorChange("secondary", v)}
                        />
                        <ColorInput
                            label={t.settings.customTheme.accentColor}
                            value={localColors.accent}
                            onChange={(v) => handleColorChange("accent", v)}
                        />
                    </div>
                </div>

                <DialogFooter className="flex gap-2 sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        className="flex-1"
                    >
                        {t.settings.customTheme.resetColors}
                    </Button>
                    <Button
                        onClick={handleApply}
                        className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700"
                    >
                        {t.settings.customTheme.applyColors}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
