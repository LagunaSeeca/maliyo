import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        const session = await getSession()

        if (!session?.familyId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const searchParams = request.nextUrl.searchParams
        const startDate = searchParams.get("startDate")
        const endDate = searchParams.get("endDate")
        const category = searchParams.get("category")
        const personId = searchParams.get("personId")

        const where: Record<string, unknown> = {
            familyId: session.familyId,
        }

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate),
            }
        }

        if (category) {
            where.category = category
        }

        if (personId) {
            where.personId = personId
        }

        const incomes = await prisma.income.findMany({
            where,
            include: {
                person: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                date: "desc",
            },
        })

        // Calculate totals
        const total = incomes.reduce(
            (sum, income) => sum + Number(income.amount),
            0
        )

        return NextResponse.json({
            incomes,
            total,
            count: incomes.length,
        })
    } catch (error) {
        console.error("Get incomes error:", error)
        return NextResponse.json(
            { error: "Failed to fetch incomes" },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession()

        if (!session?.familyId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { amount, category, personId, date, description } = body

        if (!amount || !category || !personId || !date) {
            return NextResponse.json(
                { error: "Amount, category, person, and date are required" },
                { status: 400 }
            )
        }

        const income = await prisma.income.create({
            data: {
                amount,
                category,
                personId,
                date: new Date(date),
                description,
                familyId: session.familyId,
            },
            include: {
                person: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        return NextResponse.json(income, { status: 201 })
    } catch (error) {
        console.error("Create income error:", error)
        return NextResponse.json(
            { error: "Failed to create income" },
            { status: 500 }
        )
    }
}
