'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Sparkles, Filter } from 'lucide-react';
import { ArticleCard } from '@/components/article-card';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [searchMode, setSearchMode] = useState<'HYBRID' | 'KEYWORD'>('HYBRID');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const performSearch = async (q: string, mode: 'HYBRID' | 'KEYWORD') => {
    if (!q.trim()) return;
    setLoading(true);

    try {
      const endpoint = mode === 'HYBRID' ? `/api/search/semantic?q=${encodeURIComponent(q)}` : `/api/search?q=${encodeURIComponent(q)}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, searchMode);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, searchMode);
  };

  return (
    <div className="space-y-8">
      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search articles e.g., 'articles about struggling to learn programming'..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border bg-card py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
        >
          Search
        </button>
      </form>

      {/* Mode Selector */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Retrieval Engine:
          </span>
          <div className="flex rounded-lg border bg-muted p-0.5 text-xs">
            <button
              onClick={() => {
                setSearchMode('HYBRID');
                if (query) performSearch(query, 'HYBRID');
              }}
              className={`flex items-center gap-1 px-3 py-1 rounded font-semibold ${searchMode === 'HYBRID' ? 'bg-background text-purple-600 shadow-sm' : 'text-muted-foreground'}`}
            >
              <Sparkles className="h-3 w-3" />
              Hybrid Vector Search
            </button>
            <button
              onClick={() => {
                setSearchMode('KEYWORD');
                if (query) performSearch(query, 'KEYWORD');
              }}
              className={`px-3 py-1 rounded font-semibold ${searchMode === 'KEYWORD' ? 'bg-background text-purple-600 shadow-sm' : 'text-muted-foreground'}`}
            >
              Keyword Search
            </button>
          </div>
        </div>

        <span className="text-xs text-muted-foreground">{results.length} results found</span>
      </div>

      {/* Results Listing */}
      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 animate-spin text-purple-600" />
          <span>Executing hybrid search pass & reranking candidates...</span>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((item) => (
            <ArticleCard
              key={item.id || item.postId}
              id={item.id || item.postId}
              title={item.title}
              slug={item.slug}
              excerpt={item.excerpt}
              category={item.category ? { name: item.category.name || item.category, slug: '' } : null}
              matchReason={item.combinedScore ? `Hybrid Score: ${item.combinedScore}` : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
          No matching articles found. Try adjusting your query or switching to Hybrid Vector Search mode.
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Search Knowledge Base</h1>
        <p className="text-sm text-muted-foreground mt-1">Hybrid Semantic Search combines full-text keywords with pgvector semantic similarity.</p>
      </div>

      <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">Loading search engine...</div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
