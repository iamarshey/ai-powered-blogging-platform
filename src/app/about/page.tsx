import { Sparkles, Layers, Cpu, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-600">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Production Platform Architecture</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">About AI Pulse</h1>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          AI Pulse is a full-fledged production-grade blogging platform engineered with modern TypeScript, Next.js App Router, PostgreSQL with pgvector, stateful LangGraph workflows, and RAG pipelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border bg-card p-6 space-y-3">
          <Cpu className="h-8 w-8 text-purple-600" />
          <h3 className="font-bold text-base">Multi-Provider AI Abstraction</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Supports OpenAI, Google Gemini, and Anthropic Claude with seamless failover and local deterministic fallback.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-3">
          <Layers className="h-8 w-8 text-purple-600" />
          <h3 className="font-bold text-base">Hybrid Vector Search</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Combines PostgreSQL full-text keyword search with pgvector 1536-dimensional embeddings and Reciprocal Rank Fusion reranking.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 space-y-3">
          <ShieldCheck className="h-8 w-8 text-purple-600" />
          <h3 className="font-bold text-base">Production Guardrails</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Built-in prompt injection defense, LLM telemetry observability, and empirical RAG groundedness evaluation suite.
          </p>
        </div>
      </div>
    </div>
  );
}
