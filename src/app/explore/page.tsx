import db from '@/lib/db';
import { ArticleCard } from '@/components/article-card';

export const revalidate = 0;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { category?: string; tag?: string; sort?: string };
}) {
  const { category, tag, sort } = searchParams;

  const where: any = { status: 'PUBLISHED' };
  if (category) where.category = { slug: category };
  if (tag) where.tags = { some: { tag: { slug: tag } } };

  const posts = await db.post.findMany({
    where,
    orderBy: sort === 'popular' ? { viewsCount: 'desc' } : { createdAt: 'desc' },
    include: {
      category: true,
      author: { select: { profile: { select: { name: true, username: true } } } },
    },
  });

  const categories = await db.category.findMany();

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Explore Articles</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse published technical articles across engineering, AI, and architecture.</p>
      </div>

      {/* Category Pills Filter */}
      <div className="flex flex-wrap gap-2 border-b pb-4">
        <a
          href="/explore"
          className={`rounded-full px-4 py-1.5 text-xs font-semibold ${!category ? 'bg-primary text-primary-foreground' : 'border hover:bg-muted'}`}
        >
          All Topics
        </a>
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={`/explore?category=${cat.slug}`}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${category === cat.slug ? 'bg-primary text-primary-foreground' : 'border hover:bg-muted'}`}
          >
            {cat.name}
          </a>
        ))}
      </div>

      {/* Articles Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <ArticleCard key={post.id} {...post} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          No published articles match the selected topic filter.
        </div>
      )}
    </div>
  );
}
