type ModelName = "gemini-2.5-flash" | "deepseek-chat";

type Pricing = {
    input: number;
    output: number;
};

export const MODEL_PRICING: Record<ModelName, Pricing> = {
    "gemini-2.5-flash": {
        input: 0,
        output: 0,
    },
    "deepseek-chat": {
        input: 0.27 / 1_000_000,
        output: 1.10 / 1_000_000,
    },
};

export function calculateCost(
    model: string,
    promptTokens = 0,
    completionTokens = 0
) {
    const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING];

    if (!pricing) return 0;

    return (
        promptTokens * pricing.input +
        completionTokens * pricing.output
    );
}