import Link from 'next/link';
import { Sparkles, TrendingUp, Compass, ArrowRight, Layers, UserCheck } from 'lucide-react';
import db from '@/lib/db';
import { ArticleCard } from '@/components/article-card';
import { getPersonalizedRecommendations } from '@/lib/recommendations';

export const revalidate = 0; // Fresh server fetch

export default async function HomePage() {
  // Fetch Featured & Published Articles
  const featuredPost = await db.post.findFirst({
    where: { status: 'PUBLISHED' },
    orderBy: { viewsCount: 'desc' },
    include: {
      category: true,
      author: { select: { profile: { select: { name: true, username: true } } } },
    },
  });

  const latestPosts = await db.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: {
      category: true,
      author: { select: { profile: { select: { name: true, username: true } } } },
    },
  });

  const categories = await db.category.findMany({
    take: 6,
    include: { _count: { select: { posts: true } } },
  });

  const authors = await db.profile.findMany({
    take: 4,
  });

  const recommendations = await getPersonalizedRecommendations(undefined, 3);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative border-b bg-gradient-to-b from-purple-900/20 via-background to-background py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-600 dark:text-purple-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next.js App Router + LangGraph + pgvector RAG</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Production AI-Powered <span className="bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">Blogging Platform</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Discover deep technical insights, engage with grounded RAG article Q&A, and create rich content with stateful AI writing workflows.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/explore"
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90 transition"
            >
              <Compass className="h-4 w-4" />
              <span>Explore Articles</span>
            </Link>
            <Link
              href="/dashboard/editor"
              className="flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold hover:bg-muted transition"
            >
              <span>Start Writing</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Article Section */}
      {featuredPost && (
        <section className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <h2 className="text-2xl font-bold tracking-tight">Featured Article</h2>
          </div>

          <div className="relative overflow-hidden rounded-2xl border bg-card p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-sm">
            <div className="flex flex-col justify-center space-y-4">
              {featuredPost.category && (
                <span className="w-fit rounded-full bg-purple-500/10 border border-purple-500/30 px-3 py-1 text-xs font-semibold text-purple-600">
                  {featuredPost.category.name}
                </span>
              )}
              <Link href={`/blog/${featuredPost.slug}`}>
                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight hover:text-primary transition">
                  {featuredPost.title}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {featuredPost.excerpt || featuredPost.content.slice(0, 200)}
              </p>
              <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">By {featuredPost.author?.profile?.name || 'Author'}</span>
                <span>•</span>
                <span>{featuredPost.readingTimeMin} min read</span>
                <span>•</span>
                <span>{featuredPost.viewsCount} views</span>
              </div>
            </div>
            <div className="h-64 md:h-full w-full rounded-xl bg-gradient-to-br from-purple-900/30 to-slate-900/60 border flex items-center justify-center">
              {featuredPost.coverImage ? (
                <img src={featuredPost.coverImage} alt={featuredPost.title} className="h-full w-full object-cover rounded-xl" />
              ) : (
                <Sparkles className="h-16 w-16 text-purple-500/40" />
              )}
            </div>
          </div>
        </section>
      )}

      {/* AI Recommendations Section */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h2 className="text-2xl font-bold tracking-tight">Recommended For You</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((post) => (
            <ArticleCard key={post.id} {...post} />
          ))}
        </div>
      </section>

      {/* Latest Articles Grid */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Latest Articles</h2>
          <Link href="/explore" className="text-xs font-semibold text-purple-600 hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {latestPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestPosts.map((post) => (
              <ArticleCard key={post.id} {...post} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
            No published articles yet. Be the first author to publish a blog!
          </div>
        )}
      </section>

      {/* Popular Categories */}
      <section className="container mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <Layers className="h-5 w-5 text-purple-600" />
          <h2 className="text-2xl font-bold tracking-tight">Explore Categories</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="flex flex-col items-center justify-center rounded-xl border bg-card p-4 text-center hover:border-purple-500/50 transition hover:shadow-sm"
            >
              <span className="text-sm font-bold text-foreground">{cat.name}</span>
              <span className="text-[10px] text-muted-foreground mt-1">{cat._count.posts} posts</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Authors */}
      {authors.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <UserCheck className="h-5 w-5 text-purple-600" />
            <h2 className="text-2xl font-bold tracking-tight">Popular Authors</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {authors.map((author) => (
              <Link
                key={author.id}
                href={`/author/${author.username}`}
                className="flex items-center gap-4 rounded-xl border bg-card p-4 hover:border-purple-500/40 transition"
              >
                <div className="h-10 w-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                  {author.name[0]}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{author.name}</h4>
                  <p className="text-xs text-muted-foreground">@{author.username}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
