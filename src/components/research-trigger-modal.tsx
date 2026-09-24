'use client';

import { useState } from 'react';
import { Sparkles, Bot, X, FileText, BookOpen, CheckCircle, HelpCircle } from 'lucide-react';

export function ResearchTriggerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleRunResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || loading) return;
    setLoading(true);

    try {
      const res = await fetch('/api/ai/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();
      setReport(data.report);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-xs font-semibold text-purple-600 dark:text-purple-400 shadow-sm hover:bg-purple-500/20 transition"
      >
        <Sparkles className="h-4 w-4" />
        <span>Run AI Research Assistant</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border bg-card p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-purple-600" />
                <h3 className="text-base font-bold">LangGraph AI Research Assistant</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Enter a technical topic. The research assistant will explore internal blog knowledge, search uploaded documents, generate research questions, and synthesize a structured outline.
            </p>

            <form onSubmit={handleRunResearch} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., Microservices Migration Strategies & Lessons Learned"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="flex-1 rounded-xl border bg-background px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? <Sparkles className="h-4 w-4 animate-spin" /> : <span>Start Research</span>}
              </button>
            </form>

            {report && (
              <div className="space-y-4 rounded-xl bg-muted/40 border p-5 text-xs">
                <div>
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-emerald-500" /> Research Synthesis: {report.topic}
                  </h4>
                  <p className="mt-1 text-muted-foreground leading-relaxed">{report.summary}</p>
                </div>

                {report.researchQuestions && (
                  <div>
                    <h5 className="font-bold text-foreground flex items-center gap-1 mb-1">
                      <HelpCircle className="h-3.5 w-3.5 text-purple-600" /> Essential Research Questions:
                    </h5>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {report.researchQuestions.map((q: string, idx: number) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.recommendedOutline && (
                  <div>
                    <h5 className="font-bold text-foreground flex items-center gap-1 mb-1">
                      <FileText className="h-3.5 w-3.5 text-purple-600" /> Recommended Outline:
                    </h5>
                    <div className="rounded-lg bg-background p-3 font-mono text-[11px] whitespace-pre-wrap border">
                      {report.recommendedOutline}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
