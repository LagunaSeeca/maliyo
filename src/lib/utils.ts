import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns"
import type { Translations } from "@/i18n"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string, currency: string = "AZN"): string {
    const num = typeof amount === "string" ? parseFloat(amount) : amount
    return new Intl.NumberFormat("az-AZ", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num)
}

export function formatDate(date: Date | string, formatStr: string = "dd MMM yyyy"): string {
    const d = typeof date === "string" ? new Date(date) : date
    return format(d, formatStr)
}

export function formatDateTime(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date
    return format(d, "dd MMM yyyy, HH:mm")
}

export function getMonthDateRange(date: Date = new Date()) {
    return {
        start: startOfMonth(date),
        end: endOfMonth(date),
    }
}

export function getLastMonthDateRange() {
    const lastMonth = subMonths(new Date(), 1)
    return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
    }
}

export function getLastNMonthsRange(n: number) {
    const end = endOfMonth(new Date())
    const start = startOfMonth(subMonths(new Date(), n - 1))
    return { start, end }
}

// Category key mappings for translation lookups
const INCOME_CATEGORY_KEYS: Record<string, keyof Translations['income']['sources']> = {
    SALARY: 'salary',
    FREELANCE: 'freelance',
    BUSINESS: 'business',
    INVESTMENT: 'investment',
    GIFT: 'gift',
    BONUS: 'other',
    OTHER: 'other',
}

const EXPENSE_CATEGORY_KEYS: Record<string, keyof Translations['expenses']['categories']> = {
    TRANSPORT: 'transport',
    PETROL: 'transport',
    FOOD: 'food',
    BABY_FOOD: 'food',
    BABY_DIAPERS: 'shopping',
    GROCERY: 'food',
    UTILITY_ELECTRICITY: 'utilities',
    UTILITY_GAS: 'utilities',
    UTILITY_WATER: 'utilities',
    SAVINGS: 'other',
    PERSONAL_EXPENSES: 'shopping',
    LOAN_PAYMENT: 'other',
    BIRTHDAYS_WEDDINGS: 'entertainment',
    ONLINE_SHOPPING: 'shopping',
    HEALTH: 'health',
    EDUCATION: 'education',
    TRAVEL: 'travel',
    RENT: 'rent',
    INSURANCE: 'insurance',
    SUBSCRIPTIONS: 'subscriptions',
    ENTERTAINMENT: 'entertainment',
    OTHER: 'other',
}

// Get translated income category label
export function getIncomeCategoryLabel(category: string, t: Translations): string {
    const key = INCOME_CATEGORY_KEYS[category]
    if (key && t.income.sources[key]) {
        return t.income.sources[key]
    }
    return INCOME_CATEGORY_LABELS[category] || category
}

// Get translated expense category label
export function getExpenseCategoryLabel(category: string, t: Translations): string {
    const key = EXPENSE_CATEGORY_KEYS[category]
    if (key && t.expenses.categories[key]) {
        return t.expenses.categories[key]
    }
    return EXPENSE_CATEGORY_LABELS[category] || category
}

// Fallback English labels (kept for backwards compatibility)
export const INCOME_CATEGORY_LABELS: Record<string, string> = {
    SALARY: "Salary",
    FREELANCE: "Freelance / Side Income",
    BUSINESS: "Business Income",
    BONUS: "Bonus",
    GIFT: "Gift",
    OTHER: "Other",
}

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
    TRANSPORT: "Transport",
    PETROL: "Petrol",
    BABY_FOOD: "Baby Food",
    BABY_DIAPERS: "Baby Diapers",
    GROCERY: "Grocery Shopping",
    UTILITY_ELECTRICITY: "Electricity",
    UTILITY_GAS: "Gas",
    UTILITY_WATER: "Water",
    SAVINGS: "Savings",
    PERSONAL_EXPENSES: "Personal Expenses",
    LOAN_PAYMENT: "Loan Payment",
    BIRTHDAYS_WEDDINGS: "Birthdays & Weddings",
    ONLINE_SHOPPING: "Online Shopping",
}

export const EXPENSE_CATEGORY_ICONS: Record<string, string> = {
    TRANSPORT: "Car",
    PETROL: "Fuel",
    BABY_FOOD: "Baby",
    BABY_DIAPERS: "Baby",
    GROCERY: "ShoppingCart",
    UTILITY_ELECTRICITY: "Zap",
    UTILITY_GAS: "Flame",
    UTILITY_WATER: "Droplet",
    SAVINGS: "PiggyBank",
    PERSONAL_EXPENSES: "User",
    LOAN_PAYMENT: "CreditCard",
    BIRTHDAYS_WEDDINGS: "Gift",
    ONLINE_SHOPPING: "ShoppingBag",
}
