export class SummaryDto {
    constructor(
        public totalTokens: number,
        public totalCost: number,
        public totalSessions: number,
        public avgLatencyMs: number
    ) { }
}