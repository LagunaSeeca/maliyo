import { NextResponse } from "next/server"
import { getCurrentFamily, getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
    try {
        const family = await getCurrentFamily()

        if (!family) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const payments = await prisma.monthlyPayment.findMany({
            where: {
                familyId: family.id,
                isActive: true,
            },
            orderBy: {
                dayOfMonth: 'asc',
            },
        })

        return NextResponse.json({ payments })

    } catch (error) {
        console.error("Failed to fetch payments:", error)
        return NextResponse.json(
            { error: "Failed to fetch payments" },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const family = await getCurrentFamily()

        if (!family) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { name, amount, dayOfMonth, category } = body

        if (!name || !amount || !dayOfMonth || !category) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        const payment = await prisma.monthlyPayment.create({
            data: {
                name,
                amount,
                dayOfMonth: parseInt(dayOfMonth),
                category,
                familyId: family.id,
            },
        })

        return NextResponse.json({ payment })

    } catch (error) {
        console.error("Failed to create payment:", error)
        return NextResponse.json(
            { error: "Failed to create payment" },
            { status: 500 }
        )
    }
}
