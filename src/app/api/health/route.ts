
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import nodemailer from 'nodemailer'

export async function GET(request: NextRequest) {
    const healthStatus: any = {
        database: 'untested',
        smtp: 'untested',
        env: {
            // Check if vars exist (don't show values for security)
            hasDbUrl: !!process.env.DATABASE_URL,
            hasSmtpHost: !!process.env.SMTP_HOST,
            hasSmtpUser: !!process.env.SMTP_USER,
            hasSmtpPass: !!process.env.SMTP_PASSWORD,
            smtpHost: process.env.SMTP_HOST, // Safe to show host
            smtpPort: process.env.SMTP_PORT, // Safe to show port
        }
    }

    // 1. Check Database
    try {
        await prisma.$queryRaw`SELECT 1`
        healthStatus.database = 'connected'
    } catch (e: any) {
        console.error('Database health check failed:', e)
        healthStatus.database = `error: ${e.message}`
    }

    // 2. Check SMTP
    try {
        const transporter = nodemailer.createTransport({
            host: (process.env.SMTP_HOST || 'smtp.gmail.com').trim(),
            port: parseInt((process.env.SMTP_PORT || '587').trim()),
            secure: false, // TLS
            auth: {
                user: (process.env.SMTP_USER || '').trim(),
                pass: (process.env.SMTP_PASSWORD || '').trim(),
            },
            connectionTimeout: 5000,
        })

        await transporter.verify()
        healthStatus.smtp = 'connected'
    } catch (e: any) {
        console.error('SMTP health check failed:', e)
        healthStatus.smtp = `error: ${e.message}`
    }

    return NextResponse.json(healthStatus, { status: 200 })
}
