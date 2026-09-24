import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import db from '@/lib/db';
import { PenSquare, Eye, Heart, MessageSquare, FileText, Upload, Sparkles, Plus } from 'lucide-react';
import { ResearchTriggerModal } from '@/components/research-trigger-modal';

export const revalidate = 0;

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const posts = await db.post.findMany({
    where: { authorId: user.userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      category: true,
      _count: { select: { likes: true, comments: true } },
    },
  });

  const documents = await db.document.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: 'desc' },
  });

  const totalViews = posts.reduce((acc, p) => acc + p.viewsCount, 0);
  const totalLikes = posts.reduce((acc, p) => acc + p._count.likes, 0);
  const publishedCount = posts.filter((p) => p.status === 'PUBLISHED').length;
  const draftCount = posts.filter((p) => p.status === 'DRAFT').length;

  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
      {/* Dashboard Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Author & Content Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back, {user.username}. Manage drafts, published articles, document knowledge base, and AI workflows.</p>
        </div>

        <div className="flex items-center gap-3">
          <ResearchTriggerModal />

          <Link
            href="/dashboard/editor"
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow hover:opacity-90 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Post</span>
          </Link>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Total Views</span>
            <Eye className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold">{totalViews}</p>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Published Posts</span>
            <PenSquare className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold">{publishedCount}</p>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Drafts</span>
            <FileText className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold">{draftCount}</p>
        </div>

        <div className="rounded-xl border bg-card p-5 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>Total Engagement</span>
            <Heart className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold">{totalLikes}</p>
        </div>
      </div>

      {/* Articles & Drafts Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight">Your Articles & Drafts</h3>
        </div>

        {posts.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/40 font-semibold text-muted-foreground">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Views</th>
                  <th className="p-4">Likes</th>
                  <th className="p-4">Last Updated</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-muted/30">
                    <td className="p-4 font-bold text-foreground max-w-xs truncate">{post.title}</td>
                    <td className="p-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${post.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{post.category?.name || 'Uncategorized'}</td>
                    <td className="p-4 text-muted-foreground">{post.viewsCount}</td>
                    <td className="p-4 text-muted-foreground">{post._count.likes}</td>
                    <td className="p-4 text-muted-foreground">{new Date(post.updatedAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/dashboard/editor/${post.id}`}
                        className="rounded-lg border px-3 py-1.5 text-[11px] font-semibold hover:bg-muted"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground text-xs">
            You haven't written any posts yet. Click "Create New Post" to start drafting with AI support.
          </div>
        )}
      </div>

      {/* Uploaded Documents Knowledge Base Section */}
      <div className="space-y-4 pt-6 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-purple-600" />
            <h3 className="text-xl font-bold tracking-tight">Uploaded Document Knowledge Base (PDF / TXT)</h3>
          </div>
        </div>

        {documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="rounded-xl border bg-card p-4 space-y-2">
                <h4 className="text-sm font-bold truncate">{doc.title}</h4>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="uppercase font-semibold text-[10px]">{doc.fileType}</span>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${doc.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                    {doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center text-xs text-muted-foreground">
            No uploaded documents yet. Documents uploaded here are automatically chunked and indexed into pgvector for Ask PDF Q&A.
          </div>
        )}
      </div>
    </div>
  );
}
