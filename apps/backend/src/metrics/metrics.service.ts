import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { calculateCost } from "../common/utils/pricing.util";

type MetricsUser = {
    id: string;
    role: "ADMIN" | "CLIENT";
};

@Injectable()
export class MetricsService {
    constructor(private prisma: PrismaService) { }

    private userFilter(user: MetricsUser) {
        if (user.role === "ADMIN") {
            return {};
        }

        return {
            userId: user.id,
        };
    }

    async getSummary(user: MetricsUser) {
        const where = this.userFilter(user);

        const usage = await this.prisma.usage.findMany({
            where,
        });

        let totalTokens = 0;
        let totalCost = 0;
        let totalLatency = 0;
        let latencyCount = 0;

        for (const u of usage) {
            const prompt = u.promptTokens ?? 0;
            const completion = u.completionTokens ?? 0;
            const total = u.totalTokens ?? 0;

            totalTokens += total;
            totalCost += calculateCost(u.model, prompt, completion);

            if (u.latencyMs) {
                totalLatency += u.latencyMs;
                latencyCount++;
            }
        }

        const totalSessions = await this.prisma.chatSession.count({
            where,
        });

        const totalUsers =
            user.role === "ADMIN"
                ? await this.prisma.user.count()
                : 1;

        return {
            scope: user.role === "ADMIN" ? "GLOBAL" : "USER",
            totalUsers,
            totalTokens,
            totalCost: Number(totalCost.toFixed(6)),
            totalSessions,
            avgLatencyMs: latencyCount
                ? Math.round(totalLatency / latencyCount)
                : 0,
        };
    }

    async getDaily(user: MetricsUser) {
        const where = this.userFilter(user);

        const usage = await this.prisma.usage.findMany({
            where,
            orderBy: {
                createdAt: "asc",
            },
            select: {
                createdAt: true,
                promptTokens: true,
                completionTokens: true,
                totalTokens: true,
            },
        });

        const grouped = new Map<
            string,
            {
                date: string;
                tokens: number;
                input: number;
                output: number;
            }
        >();

        for (const row of usage) {
            const date = row.createdAt.toISOString().slice(0, 10);

            const current = grouped.get(date) || {
                date,
                tokens: 0,
                input: 0,
                output: 0,
            };

            current.tokens += row.totalTokens ?? 0;
            current.input += row.promptTokens ?? 0;
            current.output += row.completionTokens ?? 0;

            grouped.set(date, current);
        }

        return Array.from(grouped.values());
    }

    async getSessionMetrics(user: MetricsUser) {
        const where = this.userFilter(user);

        const sessions = await this.prisma.chatSession.findMany({
            where,
            orderBy: {
                updatedAt: "desc",
            },
            take: 100,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
                messages: {
                    select: {
                        id: true,
                    },
                },
                usages: true,
            },
        });

        return sessions.map((session) => {
            let prompt = 0;
            let completion = 0;
            let totalTokens = 0;
            let cost = 0;
            let totalLatency = 0;
            let latencyCount = 0;

            for (const usage of session.usages) {
                const p = usage.promptTokens ?? 0;
                const c = usage.completionTokens ?? 0;
                const total = usage.totalTokens ?? p + c;

                prompt += p;
                completion += c;
                totalTokens += total;

                cost += calculateCost(usage.model, p, c);

                if (usage.latencyMs) {
                    totalLatency += usage.latencyMs;
                    latencyCount++;
                }
            }

            return {
                id: session.id,
                title: session.title,
                user: session.user,
                messages: session.messages.length,
                tokensIn: prompt,
                tokensOut: completion,
                totalTokens,
                cost: Number(cost.toFixed(6)),
                avgLatencyMs: latencyCount
                    ? Math.round(totalLatency / latencyCount)
                    : 0,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt,
            };
        });
    }
}