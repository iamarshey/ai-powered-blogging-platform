'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Activity, CheckCircle, BarChart3, AlertTriangle, Users, FileText } from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'OBSERVABILITY' | 'EVALUATION' | 'MODERATION'>('OBSERVABILITY');
  const [observability, setObservability] = useState<any>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [evalLoading, setEvalLoading] = useState(false);

  useEffect(() => {
    fetch('/api/ai/observability')
      .then((res) => res.json())
      .then((data) => setObservability(data));

    fetch('/api/ai/evaluation')
      .then((res) => res.json())
      .then((data) => setEvaluations(data.history || []));
  }, []);

  const handleRunEvaluation = async () => {
    setEvalLoading(true);
    try {
      const res = await fetch('/api/ai/evaluation', { method: 'POST' });
      const data = await res.json();
      if (data.metrics) {
        setEvaluations([data.metrics, ...evaluations]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEvalLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center gap-3 border-b pb-4">
        <ShieldCheck className="h-7 w-7 text-amber-500" />
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin & AI Control Panel</h1>
          <p className="text-xs text-muted-foreground">Monitor platform security, LLM telemetry, cost, groundedness evaluations, and moderation.</p>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex gap-4 border-b pb-2">
        <button
          onClick={() => setActiveTab('OBSERVABILITY')}
          className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition ${activeTab === 'OBSERVABILITY' ? 'bg-purple-600 text-white' : 'border hover:bg-muted'}`}
        >
          <Activity className="h-4 w-4" /> LLM Observability & Telemetry
        </button>

        <button
          onClick={() => setActiveTab('EVALUATION')}
          className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition ${activeTab === 'EVALUATION' ? 'bg-purple-600 text-white' : 'border hover:bg-muted'}`}
        >
          <BarChart3 className="h-4 w-4" /> LLM Quality Evaluation Suite
        </button>
      </div>

      {/* Tab 1: LLM Observability */}
      {activeTab === 'OBSERVABILITY' && observability && (
        <div className="space-y-6">
          {/* High Level Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border bg-card p-5 space-y-1">
              <span className="text-xs text-muted-foreground">Total LLM Generations</span>
              <p className="text-2xl font-bold">{observability.totalGenerations}</p>
            </div>
            <div className="rounded-xl border bg-card p-5 space-y-1">
              <span className="text-xs text-muted-foreground">Estimated API Cost (USD)</span>
              <p className="text-2xl font-bold text-emerald-500">${observability.totalCostUSD}</p>
            </div>
            <div className="rounded-xl border bg-card p-5 space-y-1">
              <span className="text-xs text-muted-foreground">Total Tokens Processed</span>
              <p className="text-2xl font-bold">{observability.totalTokens}</p>
            </div>
            <div className="rounded-xl border bg-card p-5 space-y-1">
              <span className="text-xs text-muted-foreground">Average Latency</span>
              <p className="text-2xl font-bold">{observability.avgLatencyMs} ms</p>
            </div>
          </div>

          {/* Telemetry Generations Log */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold">Recent Telemetry Trace Log</h3>
            <div className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-muted/40 font-semibold text-muted-foreground">
                  <tr>
                    <th className="p-3">Action</th>
                    <th className="p-3">Provider</th>
                    <th className="p-3">Model</th>
                    <th className="p-3">Tokens In/Out</th>
                    <th className="p-3">Latency</th>
                    <th className="p-3">Est. Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {observability.recentGenerations?.map((gen: any) => (
                    <tr key={gen.id} className="hover:bg-muted/30">
                      <td className="p-3 font-semibold">{gen.action}</td>
                      <td className="p-3 uppercase font-bold text-purple-600">{gen.provider}</td>
                      <td className="p-3 text-muted-foreground">{gen.model}</td>
                      <td className="p-3 text-muted-foreground">{gen.tokensIn} / {gen.tokensOut}</td>
                      <td className="p-3 text-muted-foreground">{gen.latencyMs} ms</td>
                      <td className="p-3 text-emerald-600 font-semibold">${gen.costUSD.toFixed(5)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: LLM Quality Evaluation Suite */}
      {activeTab === 'EVALUATION' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">RAG & Agent Groundedness Benchmarks</h3>
              <p className="text-xs text-muted-foreground">Empirical evaluation scores measuring retrieval relevance, hallucination rate, and answer groundedness.</p>
            </div>
            <button
              onClick={handleRunEvaluation}
              disabled={evalLoading}
              className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow hover:opacity-90 disabled:opacity-50"
            >
              {evalLoading ? 'Running Evaluation Suite...' : 'Run Benchmark Test'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evaluations.map((ev: any, idx: number) => (
              <div key={idx} className="rounded-xl border bg-card p-5 space-y-3">
                <h4 className="font-bold text-sm text-foreground">{ev.testName}</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Retrieval Relevance:</span>
                    <p className="font-bold text-purple-600">{(ev.retrievalRelevance * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Answer Groundedness:</span>
                    <p className="font-bold text-emerald-500">{(ev.groundedness * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hallucination Rate:</span>
                    <p className="font-bold text-amber-500">{(ev.hallucinationRate * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tool Call Correctness:</span>
                    <p className="font-bold text-indigo-500">{(ev.toolCorrectness * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
