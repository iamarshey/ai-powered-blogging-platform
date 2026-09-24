import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, Eye, Heart, Bookmark, Sparkles, MessageSquare, ShieldCheck, Share2 } from 'lucide-react';
import db from '@/lib/db';
import { AskArticleModal } from '@/components/ask-article-modal';
import { ArticleSummarizer } from '@/components/article-summarizer';
import { CommentsSection } from '@/components/comments-section';

export const revalidate = 0;

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  let post = null;

  try {
    post = await db.post.findFirst({
      where: { slug: params.slug },
      include: {
        category: true,
        tags: { include: { tag: true } },
        author: { select: { id: true, profile: true } },
        comments: {
          where: { parentId: null },
          include: {
            author: { select: { profile: { select: { name: true, username: true, avatar: true } } } },
            replies: {
              include: {
                author: { select: { profile: { select: { name: true, username: true, avatar: true } } } },
              },
            },
            moderation: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { likes: true, bookmarks: true } },
      },
    });

    if (post) {
      // Increment view count asynchronously
      await db.post.update({
        where: { id: post.id },
        data: { viewsCount: { increment: 1 } },
      }).catch(() => {});
    }
  } catch (err) {
    console.error('ArticlePage database query error:', err);
  }

  if (!post) {
    notFound();
  }

  return (
    <article className="container mx-auto px-4 py-10 max-w-4xl space-y-10">
      {/* Header Info */}
      <header className="space-y-4 text-center">
        {post.category && (
          <Link
            href={`/category/${post.category.slug}`}
            className="inline-block rounded-full bg-purple-500/10 border border-purple-500/30 px-3.5 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-500/20"
          >
            {post.category.name}
          </Link>
        )}

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
          {post.title}
        </h1>

        {post.subtitle && (
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {post.subtitle}
          </p>
        )}

        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-4 border-b pb-6">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
              {post.author?.profile?.name?.[0] || 'A'}
            </div>
            <Link href={`/author/${post.author?.profile?.username}`} className="font-semibold text-foreground hover:underline">
              {post.author?.profile?.name || 'Author'}
            </Link>
          </div>
          <span>•</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {post.readingTimeMin} min read</span>
          <span>•</span>
          <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {post.viewsCount} views</span>
        </div>
      </header>

      {/* AI Controls Bar (Ask Article RAG + Summarizer) */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-gradient-to-r from-purple-900/10 via-card to-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
          <div>
            <h4 className="text-sm font-bold">AI Reader Tools</h4>
            <p className="text-[10px] text-muted-foreground">Ask questions grounded to this article or generate instant TL;DR</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AskArticleModal postId={post.id} title={post.title} />
        </div>
      </div>

      {/* AI Article Summarizer Component */}
      <ArticleSummarizer postId={post.id} />

      {/* Cover Image */}
      {post.coverImage && (
        <div className="overflow-hidden rounded-2xl border max-h-[450px]">
          <img src={post.coverImage} alt={post.title} className="w-full object-cover" />
        </div>
      )}

      {/* Main Body Content */}
      <div className="prose dark:prose-invert max-w-none text-foreground leading-relaxed space-y-6 text-base whitespace-pre-wrap">
        {post.content}
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-6 border-t">
          {post.tags.map((t) => (
            <Link
              key={t.tagId}
              href={`/tag/${t.tag.slug}`}
              className="rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              #{t.tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* Author Bio Box */}
      <div className="rounded-xl border bg-card p-6 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
          {post.author?.profile?.name?.[0] || 'A'}
        </div>
        <div>
          <h4 className="text-base font-bold">{post.author?.profile?.name || 'Author'}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{post.author?.profile?.bio || 'Technical Content Creator & Software Architect'}</p>
        </div>
      </div>

      {/* Comments Section */}
      <CommentsSection postId={post.id} comments={post.comments} />
    </article>
  );
}
