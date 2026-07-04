import { Controller, Get, UseGuards, Req } from "@nestjs/common";
import { JwtGuard } from "../auth/jwt.guard";
import { MetricsService } from "./metrics.service";

interface JwtUser {
    id: string;
    role: "ADMIN" | "CLIENT";
}

@Controller("metrics")
@UseGuards(JwtGuard)
export class MetricsController {
    constructor(private metrics: MetricsService) { }

    @Get("summary")
    getSummary(@Req() req: { user: JwtUser }) {
        return this.metrics.getSummary(req.user);
    }

    @Get("daily")
    getDaily(@Req() req: { user: JwtUser }) {
        return this.metrics.getDaily(req.user);
    }

    @Get("sessions")
    getSessions(@Req() req: { user: JwtUser }) {
        return this.metrics.getSessionMetrics(req.user);
    }
}