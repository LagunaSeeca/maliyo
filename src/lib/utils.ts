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
    PETROL: 'petrol',
    FOOD: 'food',
    BABY_FOOD: 'babyFood',
    BABY_DIAPERS: 'babyDiapers',
    GROCERY: 'grocery',
    UTILITY_ELECTRICITY: 'utilityElectricity',
    UTILITY_GAS: 'utilityGas',
    UTILITY_WATER: 'utilityWater',
    UTILITY_INTERNET: 'utilityInternet',
    UTILITY_PHONE: 'utilityPhone',
    RENT: 'rent',
    SAVINGS: 'savings',
    PERSONAL_EXPENSES: 'personalExpenses',
    LOAN_PAYMENT: 'loanPayment',
    INSURANCE: 'insurance',
    HEALTH: 'health',
    EDUCATION: 'education',
    ENTERTAINMENT: 'entertainment',
    SUBSCRIPTIONS: 'subscriptions',
    TRAVEL: 'travel',
    BIRTHDAYS_WEDDINGS: 'birthdaysWeddings',
    ONLINE_SHOPPING: 'onlineShopping',
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
    FOOD: "Food & Dining",
    BABY_FOOD: "Baby Food",
    BABY_DIAPERS: "Baby Diapers",
    GROCERY: "Grocery Shopping",
    UTILITY_ELECTRICITY: "Electricity",
    UTILITY_GAS: "Gas",
    UTILITY_WATER: "Water",
    UTILITY_INTERNET: "Internet",
    UTILITY_PHONE: "Phone",
    RENT: "Rent",
    SAVINGS: "Savings",
    PERSONAL_EXPENSES: "Personal Expenses",
    LOAN_PAYMENT: "Loan Payment",
    INSURANCE: "Insurance",
    HEALTH: "Health & Medical",
    EDUCATION: "Education",
    ENTERTAINMENT: "Entertainment",
    SUBSCRIPTIONS: "Subscriptions",
    TRAVEL: "Travel",
    BIRTHDAYS_WEDDINGS: "Birthdays & Weddings",
    ONLINE_SHOPPING: "Online Shopping",
    OTHER: "Other",
}

export const EXPENSE_CATEGORY_ICONS: Record<string, string> = {
    TRANSPORT: "Car",
    PETROL: "Fuel",
    FOOD: "UtensilsCrossed",
    BABY_FOOD: "Baby",
    BABY_DIAPERS: "Baby",
    GROCERY: "ShoppingCart",
    UTILITY_ELECTRICITY: "Zap",
    UTILITY_GAS: "Flame",
    UTILITY_WATER: "Droplet",
    UTILITY_INTERNET: "Wifi",
    UTILITY_PHONE: "Phone",
    RENT: "Home",
    SAVINGS: "PiggyBank",
    PERSONAL_EXPENSES: "User",
    LOAN_PAYMENT: "CreditCard",
    INSURANCE: "Shield",
    HEALTH: "Heart",
    EDUCATION: "GraduationCap",
    ENTERTAINMENT: "Gamepad2",
    SUBSCRIPTIONS: "Repeat",
    TRAVEL: "Plane",
    BIRTHDAYS_WEDDINGS: "Gift",
    ONLINE_SHOPPING: "ShoppingBag",
    OTHER: "MoreHorizontal",
}

// Format due date for monthly payments (e.g., "01 February 2026")
export function formatPaymentDueDate(dayOfMonth: number, targetDate: Date = new Date()): string {
    const year = targetDate.getFullYear()
    const month = targetDate.getMonth()
    // Handle days that exceed the month's length (e.g., day 31 in February)
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate()
    const day = Math.min(dayOfMonth, lastDayOfMonth)
    const date = new Date(year, month, day)
    return format(date, "dd MMMM yyyy")
}

// Get the month name and year for a payment (e.g., "February 2026")
export function getPaymentMonthLabel(date: Date = new Date()): string {
    return format(date, "MMMM yyyy")
}
