export class DailyMetricsDto {
    constructor(
        public date: string,
        public tokens: number,
        public input: number,
        public output: number
    ) { }
}