import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const basePrisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['warn', 'error'],
    });

export const prisma = basePrisma.$extends({
    query: {
        async $allOperations({ operation, model, args, query }) {
            let attempts = 0;
            const maxAttempts = 3;
            while (attempts < maxAttempts) {
                try {
                    return await query(args);
                } catch (error: any) {
                    attempts++;
                    const isRetryable =
                        error.code === 'P1017' || // Server has closed the connection
                        error.code === 'P1001' || // Can't reach database server
                        error.message?.includes('closed the connection') ||
                        error.message?.includes('Connection terminated');

                    if (isRetryable && attempts < maxAttempts) {
                        await new Promise(res => setTimeout(res, 400 * attempts));
                        continue;
                    }
                    throw error;
                }
            }
        },
    },
}) as unknown as PrismaClient;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma;

export default prisma;
