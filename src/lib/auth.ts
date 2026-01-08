import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me'

export interface JWTPayload {
    userId: string
    email: string
    familyId: string | null
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch {
        return null
    }
}

export async function getSession(): Promise<JWTPayload | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
        return null
    }

    return verifyToken(token)
}

export async function getCurrentUser() {
    const session = await getSession()

    if (!session) {
        return null
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            familyMember: {
                include: {
                    family: true,
                },
            },
        },
    })

    return user
}

export async function getCurrentFamily() {
    const user = await getCurrentUser()

    if (!user?.familyMember?.family) {
        return null
    }

    return user.familyMember.family
}

export async function getFamilyMembers() {
    const family = await getCurrentFamily()

    if (!family) {
        return []
    }

    return prisma.familyMember.findMany({
        where: { familyId: family.id },
        orderBy: { name: 'asc' },
    })
}

export function setAuthCookie(token: string) {
    return {
        name: 'auth-token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
    }
}

export function removeAuthCookie() {
    return {
        name: 'auth-token',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 0,
        path: '/',
    }
}
