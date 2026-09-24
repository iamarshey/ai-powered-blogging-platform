import { notFound } from 'next/navigation';
import db from '@/lib/db';
import { ArticleCard } from '@/components/article-card';

export const revalidate = 0;

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await db.category.findUnique({
    where: { slug: params.slug },
    include: {
      posts: {
        where: { status: 'PUBLISHED' },
        include: {
          category: true,
          author: { select: { profile: { select: { name: true, username: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!category) notFound();

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Category: {category.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">{category.description || `Browse technical posts under ${category.name}`}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {category.posts.map((post) => (
          <ArticleCard key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}
