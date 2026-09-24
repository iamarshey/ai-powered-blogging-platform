import { notFound } from 'next/navigation';
import db from '@/lib/db';
import { ArticleCard } from '@/components/article-card';

export const revalidate = 0;

export default async function AuthorProfilePage({ params }: { params: { username: string } }) {
  const profile = await db.profile.findUnique({
    where: { username: params.username },
    include: {
      user: {
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
      },
    },
  });

  if (!profile) notFound();

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-10">
      {/* Author Header */}
      <div className="rounded-2xl border bg-card p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="h-20 w-20 rounded-full bg-purple-600 text-white flex items-center justify-center font-extrabold text-3xl shrink-0">
          {profile.name[0]}
        </div>
        <div className="text-center md:text-left space-y-2">
          <h1 className="text-2xl font-extrabold">{profile.name}</h1>
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">@{profile.username}</p>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">{profile.bio || 'Technical Author & Engineering Contributor'}</p>
        </div>
      </div>

      {/* Author Published Articles */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold tracking-tight">Published Articles ({profile.user.posts.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.user.posts.map((post) => (
            <ArticleCard key={post.id} {...post} />
          ))}
        </div>
      </div>
    </div>
  );
}
