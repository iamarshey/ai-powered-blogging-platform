'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Save, Send, Bot, FileText, Image as ImageIcon, CheckCircle, Search, Wand2 } from 'lucide-react';

export default function BlogEditorPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagsInput, setTagsInput] = useState('AI, Nextjs, Architecture');
  const [categories, setCategories] = useState<any[]>([]);

  // AI Drawer state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiAction, setAiAction] = useState('GENERATE_OUTLINE');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  // SEO Analysis state
  const [seoAnalysis, setSeoAnalysis] = useState<any>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []));
  }, []);

  const handleAiAction = async () => {
    setAiLoading(true);
    setAiResult('');

    try {
      const res = await fetch('/api/ai/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: aiAction,
          prompt: aiPrompt || title,
          textSelection: content.slice(0, 1000),
          contextContent: content,
        }),
      });

      const data = await res.json();
      setAiResult(data.result || '');
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleRunSeoAnalysis = async () => {
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      setSeoAnalysis(data.analysis);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!title || !content) {
      alert('Title and Content are required');
      return;
    }

    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subtitle,
          content,
          coverImage,
          categoryId: categoryId || null,
          tags,
          status,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/dashboard');
      } else {
        alert(`Save failed: ${data.error}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main CMS Editor Area */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h1 className="text-2xl font-extrabold tracking-tight">Blog CMS Editor</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave('DRAFT')}
              className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold hover:bg-muted"
            >
              <Save className="h-4 w-4" /> Save Draft
            </button>
            <button
              onClick={() => handleSave('PUBLISHED')}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow hover:opacity-90"
            >
              <Send className="h-4 w-4" /> Publish Post
            </button>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Article Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl font-extrabold bg-transparent border-b pb-2 focus:outline-none focus:border-purple-600"
          />

          <input
            type="text"
            placeholder="Add a compelling subtitle or deck..."
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full text-sm text-muted-foreground bg-transparent border-b pb-2 focus:outline-none"
          />
        </div>

        {/* Metadata Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border bg-card p-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background p-2 text-xs"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">Tags (comma separated)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background p-2 text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground">Cover Image URL</label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/photo-..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background p-2 text-xs"
            />
          </div>
        </div>

        {/* Content Markdown Area */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span>Markdown Content Body</span>
            <span className="text-muted-foreground text-[10px]">{content.split(/\s+/).filter(Boolean).length} words</span>
          </label>
          <textarea
            rows={18}
            placeholder="Write your article in Markdown format..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-xl border bg-card p-4 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
      </div>

      {/* AI Assistant & SEO Sidebar */}
      <div className="space-y-6">
        {/* AI Writing Assistant Box */}
        <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b pb-3">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h3 className="text-sm font-bold">In-Editor AI Assistant</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground">AI Action</label>
              <select
                value={aiAction}
                onChange={(e) => setAiAction(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background p-2 text-xs"
              >
                <option value="GENERATE_TITLE">Generate Catchy Titles</option>
                <option value="GENERATE_OUTLINE">Generate Article Outline</option>
                <option value="CONTINUE_WRITING">Continue Writing</option>
                <option value="EXPAND_TEXT">Expand Selection</option>
                <option value="SHORTEN_TEXT">Shorten & Summarize</option>
                <option value="REWRITE_TONE">Rewrite Engineering Tone</option>
                <option value="IMPROVE_GRAMMAR">Fix Grammar & Flow</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground">Custom Prompt (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Focus on pgvector performance..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-background p-2 text-xs"
              />
            </div>

            <button
              onClick={handleAiAction}
              disabled={aiLoading}
              className="w-full rounded-xl bg-purple-600 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {aiLoading ? <Sparkles className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              <span>Execute AI Action</span>
            </button>
          </div>

          {aiResult && (
            <div className="rounded-xl bg-muted/60 border p-3 text-xs space-y-2">
              <span className="font-bold text-purple-600">Generated Output:</span>
              <p className="whitespace-pre-wrap font-mono text-[11px] text-foreground max-h-48 overflow-y-auto">{aiResult}</p>
              <button
                onClick={() => setContent((prev) => prev + '\n\n' + aiResult)}
                className="rounded border bg-background px-2 py-1 text-[10px] font-semibold hover:bg-muted"
              >
                + Append to Article
              </button>
            </div>
          )}
        </div>

        {/* AI SEO & Content Analyzer Box */}
        <div className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="text-sm font-bold">AI SEO & Readability</h3>
            <button
              onClick={handleRunSeoAnalysis}
              className="rounded-lg bg-muted px-2.5 py-1 text-[10px] font-semibold hover:bg-muted/80"
            >
              Analyze Content
            </button>
          </div>

          {seoAnalysis ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Readability Score:</span>
                <span className="font-bold text-purple-600">{seoAnalysis.readabilityScore} / 100</span>
              </div>
              <div>
                <span className="font-semibold text-foreground">Recommended Keywords:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {seoAnalysis.keywords?.map((k: string, i: number) => (
                    <span key={i} className="rounded bg-purple-500/10 text-purple-600 px-2 py-0.5 text-[10px]">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              Click "Analyze Content" to generate SEO recommendations and readability score.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
