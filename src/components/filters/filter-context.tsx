"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { startOfMonth, endOfMonth, subMonths } from "date-fns"
import type { DateRange } from "react-day-picker"

interface FilterState {
    dateRange: DateRange | undefined
    category: string | null
    personId: string | null
    preset: "all_time" | "this_month" | "last_month" | "last_3_months" | "custom"
}

interface FilterContextType {
    filters: FilterState
    setDateRange: (range: DateRange | undefined) => void
    setCategory: (category: string | null) => void
    setPersonId: (personId: string | null) => void
    setPreset: (preset: FilterState["preset"]) => void
    resetFilters: () => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: React.ReactNode }) {
    const [filters, setFilters] = useState<FilterState>({
        dateRange: undefined, // undefined means all time - no date filtering
        category: null,
        personId: null,
        preset: "all_time",
    })

    const setDateRange = useCallback((range: DateRange | undefined) => {
        setFilters((prev) => ({
            ...prev,
            dateRange: range,
            preset: "custom",
        }))
    }, [])

    const setCategory = useCallback((category: string | null) => {
        setFilters((prev) => ({ ...prev, category }))
    }, [])

    const setPersonId = useCallback((personId: string | null) => {
        setFilters((prev) => ({ ...prev, personId }))
    }, [])

    const setPreset = useCallback((preset: FilterState["preset"]) => {
        let dateRange: DateRange | undefined

        switch (preset) {
            case "all_time":
                dateRange = undefined
                break
            case "this_month":
                dateRange = {
                    from: startOfMonth(new Date()),
                    to: endOfMonth(new Date()),
                }
                break
            case "last_month":
                const lastMonth = subMonths(new Date(), 1)
                dateRange = {
                    from: startOfMonth(lastMonth),
                    to: endOfMonth(lastMonth),
                }
                break
            case "last_3_months":
                dateRange = {
                    from: startOfMonth(subMonths(new Date(), 2)),
                    to: endOfMonth(new Date()),
                }
                break
            case "custom":
                dateRange = filters.dateRange
                break
        }

        setFilters((prev) => ({ ...prev, dateRange, preset }))
    }, [filters.dateRange])

    const resetFilters = useCallback(() => {
        setFilters({
            dateRange: undefined,
            category: null,
            personId: null,
            preset: "all_time",
        })
    }, [])

    return (
        <FilterContext.Provider
            value={{
                filters,
                setDateRange,
                setCategory,
                setPersonId,
                setPreset,
                resetFilters,
            }}
        >
            {children}
        </FilterContext.Provider>
    )
}

export function useFilters() {
    const context = useContext(FilterContext)
    if (!context) {
        throw new Error("useFilters must be used within a FilterProvider")
    }
    return context
}
