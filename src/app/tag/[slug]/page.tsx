import { notFound } from 'next/navigation';
import db from '@/lib/db';
import { ArticleCard } from '@/components/article-card';

export const revalidate = 0;

export default async function TagPage({ params }: { params: { slug: string } }) {
  const tag = await db.tag.findUnique({
    where: { slug: params.slug },
    include: {
      posts: {
        include: {
          post: {
            include: {
              category: true,
              author: { select: { profile: { select: { name: true, username: true } } } },
            },
          },
        },
      },
    },
  });

  if (!tag) notFound();

  const posts = tag.posts.map((tp) => tp.post).filter((p) => p.status === 'PUBLISHED');

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Tag: #{tag.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">Articles tagged with #{tag.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <ArticleCard key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}
