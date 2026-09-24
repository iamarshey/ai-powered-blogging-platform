'use client';

import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export function ArticleSummarizer({ postId }: { postId: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleGenerateSummary = async () => {
    if (summary) {
      setIsExpanded(!isExpanded);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      setSummary(data.summary || 'Summary unavailable.');
      setIsExpanded(true);
    } catch (e) {
      setSummary('Failed to generate summary.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
      <button
        onClick={handleGenerateSummary}
        className="flex items-center justify-between w-full text-left font-bold text-sm text-foreground hover:text-purple-600 transition"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <span>AI Executive Summary & TL;DR</span>
        </div>
        {loading ? (
          <Sparkles className="h-4 w-4 animate-spin text-purple-600" />
        ) : isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && summary && (
        <div className="border-t pt-3 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {summary}
        </div>
      )}
    </div>
  );
}
