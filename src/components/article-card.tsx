'use client';

import Link from 'next/link';
import { Eye, Heart, Clock, Bookmark, Sparkles } from 'lucide-react';
import { useState } from 'react';

export interface ArticleCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string | null;
  category?: { name: string; slug: string } | null;
  author?: { profile?: { name: string; username: string; avatar?: string | null } } | null;
  publishedAt?: string | Date | null;
  readingTimeMin?: number;
  viewsCount?: number;
  likesCount?: number;
  matchReason?: string;
}

export function ArticleCard({
  id,
  title,
  slug,
  excerpt,
  coverImage,
  category,
  author,
  publishedAt,
  readingTimeMin = 3,
  viewsCount = 0,
  likesCount = 0,
  matchReason,
}: ArticleCardProps) {
  const [bookmarked, setBookmarked] = useState(false);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    setBookmarked(!bookmarked);
    await fetch(`/api/posts/${id}/bookmark`, { method: 'POST' });
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md hover:border-purple-500/30">
      <div>
        {/* Cover Image fallback */}
        <div className="relative h-44 w-full overflow-hidden rounded-lg bg-gradient-to-br from-purple-900/20 to-slate-900/40 border mb-4">
          {coverImage ? (
            <img src={coverImage} alt={title} className="h-full w-full object-cover transition group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
              <Sparkles className="h-10 w-10" />
            </div>
          )}
          {category && (
            <span className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur px-2.5 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-400 border shadow-sm">
              {category.name}
            </span>
          )}
        </div>

        {matchReason && (
          <div className="mb-2 inline-flex items-center gap-1 text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
            <Sparkles className="h-3 w-3" />
            <span>{matchReason}</span>
          </div>
        )}

        <Link href={`/blog/${slug}`}>
          <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition line-clamp-2">
            {title}
          </h3>
        </Link>

        <p className="mt-2 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
          {excerpt}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-purple-600/20 text-purple-600 flex items-center justify-center font-bold text-[10px]">
            {author?.profile?.name?.[0] || 'A'}
          </div>
          <span className="font-medium text-foreground">{author?.profile?.name || 'Author'}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {readingTimeMin}m
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {viewsCount}
          </span>
          <button onClick={handleBookmark} className="hover:text-foreground" title="Bookmark article">
            <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-purple-600 text-purple-600' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
