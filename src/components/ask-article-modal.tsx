'use client';

import { useState } from 'react';
import { Sparkles, MessageSquare, X, Send, Bot } from 'lucide-react';

export function AskArticleModal({ postId, title }: { postId: string; title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Question about article "${title}": ${question}`,
          mode: 'RAG',
        }),
      });

      const data = await res.json();
      setAnswer(data.response || 'No answer generated.');
    } catch (err) {
      setAnswer('Failed to ask article.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:opacity-90 transition"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        <span>Ask This Article</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h3 className="text-base font-bold">Ask This Article AI</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Ask any specific question about <span className="font-semibold text-foreground">"{title}"</span>. RAG retrieval is restricted to this article's chunks.
            </p>

            <form onSubmit={handleAsk} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Summarize the main technical argument..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1 rounded-xl border bg-background px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
              >
                {loading ? <Sparkles className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </form>

            {answer && (
              <div className="rounded-xl bg-muted/60 border p-4 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-purple-600">
                  <Bot className="h-4 w-4" />
                  <span>Grounded Answer:</span>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed text-foreground">{answer}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
