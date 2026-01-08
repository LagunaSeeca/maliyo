
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
    datasourceUrl: "postgresql://maliyo:maliyo_secret_2024@127.0.0.1:5433/maliyo?schema=public",
    log: ['query', 'info', 'warn', 'error']
})

async function main() {
    console.log("Attempting to connect to database on port 5433...");
    try {
        await prisma.$connect()
        console.log("Successfully connected to database!");
    } catch (e) {
        console.error("Connection failed:", e);
    } finally {
        await prisma.$disconnect()
    }
}

main()
