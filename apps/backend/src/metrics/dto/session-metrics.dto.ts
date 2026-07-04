export class SessionMetricsDto {
    constructor(
        public id: string,
        public title: string,
        public messages: number,
        public tokensIn: number,
        public tokensOut: number,
        public totalTokens: number,
        public cost: number,
        public createdAt: Date
    ) { }
}