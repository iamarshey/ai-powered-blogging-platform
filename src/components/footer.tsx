import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 py-12 mt-20">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span>AI Pulse</span>
          </Link>
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            The next-generation production blogging platform powered by PostgreSQL, pgvector, LangGraph, and modern AI pipelines.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Discovery</h4>
          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            <li><Link href="/explore" className="hover:text-foreground">Explore Articles</Link></li>
            <li><Link href="/search" className="hover:text-foreground">Semantic Search</Link></li>
            <li><Link href="/category/engineering" className="hover:text-foreground">Engineering</Link></li>
            <li><Link href="/category/artificial-intelligence" className="hover:text-foreground">AI & ML</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">AI Capabilities</h4>
          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            <li><span className="hover:text-foreground cursor-pointer">LangGraph Workflows</span></li>
            <li><span className="hover:text-foreground cursor-pointer">Hybrid Vector Search</span></li>
            <li><span className="hover:text-foreground cursor-pointer">Document PDF Q&A</span></li>
            <li><span className="hover:text-foreground cursor-pointer">Model Context Protocol (MCP)</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Platform & Admin</h4>
          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            <li><Link href="/about" className="hover:text-foreground">About & Tech Stack</Link></li>
            <li><Link href="/contact" className="hover:text-foreground">Contact & Support</Link></li>
            <li><Link href="/admin" className="hover:text-foreground">Admin Telemetry</Link></li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 pt-6 border-t text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} AI Pulse Platform. All rights reserved. Built with Next.js, TypeScript, PostgreSQL & LangChain.
      </div>
    </footer>
  );
}
