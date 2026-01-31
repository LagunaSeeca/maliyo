"use client"

import React from "react"
import { X, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/ui/date-picker"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useFilters } from "./filter-context"
import { EXPENSE_CATEGORY_LABELS, INCOME_CATEGORY_LABELS, getIncomeCategoryLabel, getExpenseCategoryLabel } from "@/lib/utils"
import { useLanguage } from "@/components/providers/LanguageProvider"

interface Member {
    id: string
    name: string
}

interface GlobalFilterProps {
    members: Member[]
    type?: "income" | "expense" | "all"
    showCategory?: boolean
    showPerson?: boolean
}

const PRESETS = [
    { value: "this_month", label: "This Month" },
    { value: "last_month", label: "Last Month" },
    { value: "last_3_months", label: "Last 3 Months" },
    { value: "custom", label: "Custom" },
]

export function GlobalFilter({
    members,
    type = "all",
    showCategory = true,
    showPerson = true,
}: GlobalFilterProps) {
    const {
        filters,
        setDateRange,
        setCategory,
        setPersonId,
        setPreset,
        resetFilters,
    } = useFilters()
    const { t } = useLanguage()

    const PRESETS = [
        { value: "all_time", label: t.time.allTime || "All Time" },
        { value: "this_month", label: t.time.thisMonth },
        { value: "last_month", label: t.time.lastMonth },
        { value: "last_3_months", label: t.time.last3Months },
        { value: "custom", label: t.time.custom },
    ]

    const getCategories = () => {
        const incomeCats = Object.keys(INCOME_CATEGORY_LABELS).reduce((acc, key) => {
            acc[key] = getIncomeCategoryLabel(key, t)
            return acc
        }, {} as Record<string, string>)

        const expenseCats = Object.keys(EXPENSE_CATEGORY_LABELS).reduce((acc, key) => {
            acc[key] = getExpenseCategoryLabel(key, t)
            return acc
        }, {} as Record<string, string>)

        if (type === "income") return incomeCats
        if (type === "expense") return expenseCats
        return { ...incomeCats, ...expenseCats }
    }

    const categories = getCategories()

    const hasActiveFilters =
        filters.category !== null || filters.personId !== null

    return (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">{t.common.filter}</span>
            </div>

            {/* Date Preset */}
            <Select
                value={filters.preset}
                onValueChange={(value) =>
                    setPreset(value as typeof filters.preset)
                }
            >
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder={t.time.custom} />
                </SelectTrigger>
                <SelectContent>
                    {PRESETS.map((preset) => (
                        <SelectItem key={preset.value} value={preset.value}>
                            {preset.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Date Range Picker */}
            <DateRangePicker
                dateRange={filters.dateRange}
                onDateRangeChange={setDateRange}
                placeholder={t.time.custom}
                className="min-w-[240px]"
            />

            {/* Category Filter */}
            {showCategory && (
                <Select
                    value={filters.category || "all"}
                    onValueChange={(value) =>
                        setCategory(value === "all" ? null : value)
                    }
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t.expenses.category} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t.common.all}</SelectItem>
                        {Object.entries(categories).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {/* Person Filter */}
            {showPerson && (
                <Select
                    value={filters.personId || "all"}
                    onValueChange={(value) =>
                        setPersonId(value === "all" ? null : value)
                    }
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder={t.family.name} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t.common.all}</SelectItem>
                        {members.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                                {member.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {/* Reset Button */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-muted-foreground hover:text-foreground"
                >
                    <X className="mr-1 h-4 w-4" />
                    {t.common.reset}
                </Button>
            )}
        </div>
    )
}
