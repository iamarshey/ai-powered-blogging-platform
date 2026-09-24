'use client';

import { useState } from 'react';
import { Sparkles, X, Send, Bot, User, BookOpen, Wrench } from 'lucide-react';

export function AiChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'RAG' | 'AGENT'>('RAG');
  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState<
    { role: 'user' | 'assistant'; content: string; sources?: any[]; toolCalls?: any[] }[]
  >([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Blogging Assistant. Ask me anything about published blogs, architecture, or type "Search blogs about RAG" to execute agent tools.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || loading) return;

    const userText = inputPrompt;
    setInputPrompt('');
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText, mode }),
      });

      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [...prev, { role: 'assistant', content: `Error: ${data.error}` }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.response,
            sources: data.sources,
            toolCalls: data.toolCalls,
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Failed to generate response.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Entry Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-xl transition hover:scale-105"
      >
        <Sparkles className="h-5 w-5 animate-pulse" />
        <span className="hidden sm:inline">Ask AI Assistant</span>
      </button>

      {/* Slide-over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-md flex-col border-l bg-card shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4 bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white font-bold">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">AI Assistant Gateway</h3>
                  <p className="text-[10px] text-muted-foreground">Powered by RAG & LangGraph Agents</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Mode Selector */}
                <div className="flex rounded-lg border bg-muted p-0.5 text-[10px]">
                  <button
                    onClick={() => setMode('RAG')}
                    className={`px-2 py-0.5 rounded font-semibold ${mode === 'RAG' ? 'bg-background shadow text-purple-600' : 'text-muted-foreground'}`}
                  >
                    RAG
                  </button>
                  <button
                    onClick={() => setMode('AGENT')}
                    className={`px-2 py-0.5 rounded font-semibold ${mode === 'AGENT' ? 'bg-background shadow text-purple-600' : 'text-muted-foreground'}`}
                  >
                    Agent
                  </button>
                </div>

                <button onClick={() => setIsOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="h-7 w-7 rounded-full bg-purple-600/20 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-muted/60 border text-foreground'}`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Tool Calls Details */}
                    {msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="mt-2 border-t pt-2 space-y-1">
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-purple-500">
                          <Wrench className="h-3 w-3" /> Tool Executed: {msg.toolCalls[0].toolName}
                        </span>
                      </div>
                    )}

                    {/* Grounded RAG Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 border-t pt-2 space-y-1">
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                          <BookOpen className="h-3 w-3" /> Grounded Sources:
                        </span>
                        {msg.sources.map((src, idx) => (
                          <div key={idx} className="text-[10px] text-purple-600 dark:text-purple-400 font-medium underline">
                            {src.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2 text-xs text-muted-foreground items-center p-2">
                  <Sparkles className="h-4 w-4 animate-spin text-purple-600" />
                  <span>AI Assistant is retrieving knowledge and reasoning...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="border-t p-3 bg-muted/20 flex gap-2">
              <input
                type="text"
                placeholder={mode === 'RAG' ? 'Ask a question about blogs...' : 'Ask agent to run tools (e.g. search blogs)...'}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-purple-600 px-3.5 py-2 text-white hover:opacity-90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
