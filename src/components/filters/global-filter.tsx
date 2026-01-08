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
import { EXPENSE_CATEGORY_LABELS, INCOME_CATEGORY_LABELS } from "@/lib/utils"

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

    const categories =
        type === "income"
            ? INCOME_CATEGORY_LABELS
            : type === "expense"
                ? EXPENSE_CATEGORY_LABELS
                : { ...INCOME_CATEGORY_LABELS, ...EXPENSE_CATEGORY_LABELS }

    const hasActiveFilters =
        filters.category !== null || filters.personId !== null

    return (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filters</span>
            </div>

            {/* Date Preset */}
            <Select
                value={filters.preset}
                onValueChange={(value) =>
                    setPreset(value as typeof filters.preset)
                }
            >
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Time period" />
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
                placeholder="Select date range"
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
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
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
                        <SelectValue placeholder="Person" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Members</SelectItem>
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
                    Reset
                </Button>
            )}
        </div>
    )
}
