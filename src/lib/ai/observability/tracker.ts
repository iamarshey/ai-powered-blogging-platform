import db from '../../db';

export interface AiGenerationTelemetry {
  userId?: string;
  action: string;
  provider: string;
  model: string;
  prompt: string;
  response: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
  cached?: boolean;
}

export async function trackAiGeneration(data: AiGenerationTelemetry) {
  try {
    const costUSD = (data.tokensIn / 1000) * 0.00015 + (data.tokensOut / 1000) * 0.0006;

    await db.aiGeneration.create({
      data: {
        userId: data.userId || null,
        action: data.action,
        provider: data.provider,
        model: data.model,
        prompt: data.prompt.slice(0, 4000),
        response: data.response.slice(0, 4000),
        tokensIn: data.tokensIn,
        tokensOut: data.tokensOut,
        latencyMs: data.latencyMs,
        costUSD,
        cached: data.cached || false,
      },
    });
  } catch (error) {
    console.warn('[Telemetry Error] Failed to log AI generation:', error);
  }
}

export async function getAiObservabilityMetrics() {
  const generations = await db.aiGeneration.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const totalGenerations = generations.length;
  const totalCostUSD = generations.reduce((acc, g) => acc + g.costUSD, 0);
  const totalTokens = generations.reduce((acc, g) => acc + g.tokensIn + g.tokensOut, 0);
  const avgLatencyMs = totalGenerations > 0
    ? Math.round(generations.reduce((acc, g) => acc + g.latencyMs, 0) / totalGenerations)
    : 0;

  const providerCounts: Record<string, number> = {};
  generations.forEach((g) => {
    providerCounts[g.provider] = (providerCounts[g.provider] || 0) + 1;
  });

  return {
    totalGenerations,
    totalCostUSD: parseFloat(totalCostUSD.toFixed(5)),
    totalTokens,
    avgLatencyMs,
    providerCounts,
    recentGenerations: generations,
  };
}
