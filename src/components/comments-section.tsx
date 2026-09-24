'use client';

import { useState } from 'react';
import { MessageSquare, Send, ShieldCheck, CornerDownRight } from 'lucide-react';

export function CommentsSection({ postId, comments: initialComments }: { postId: string; comments: any[] }) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handlePostComment = async (parentId?: string) => {
    const text = parentId ? replyText : newComment;
    if (!text.trim()) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content: text, parentId }),
      });

      const data = await res.json();
      if (data.comment) {
        if (!parentId) {
          setComments([data.comment, ...comments]);
          setNewComment('');
        } else {
          setReplyingTo(null);
          setReplyText('');
          // Refresh comments
          window.location.reload();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section className="space-y-6 pt-10 border-t">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-purple-600" />
        <h3 className="text-xl font-bold tracking-tight">Discussion ({comments.length})</h3>
      </div>

      {/* Main Comment Input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add to the technical discussion..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 rounded-xl border bg-card px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
        <button
          onClick={() => handlePostComment()}
          className="rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-semibold text-white hover:opacity-90 flex items-center gap-1.5"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Comment</span>
        </button>
      </div>

      {/* Comments List */}
      <div className="space-y-4 pt-4">
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                  {comment.author?.profile?.name?.[0] || 'U'}
                </div>
                <span className="font-bold text-foreground">{comment.author?.profile?.name || 'User'}</span>
                <span className="text-muted-foreground text-[10px]">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>

              {comment.moderation?.status === 'APPROVED' && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold">
                  <ShieldCheck className="h-3 w-3" /> AI Moderated
                </span>
              )}
            </div>

            <p className="text-xs text-foreground leading-relaxed pl-9">{comment.content}</p>

            <div className="pl-9 flex items-center gap-4 text-[11px] text-muted-foreground">
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="hover:text-foreground font-semibold flex items-center gap-1"
              >
                <CornerDownRight className="h-3 w-3" /> Reply
              </button>
            </div>

            {/* Nested Reply Form */}
            {replyingTo === comment.id && (
              <div className="pl-9 pt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 rounded-lg border bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <button
                  onClick={() => handlePostComment(comment.id)}
                  className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Reply
                </button>
              </div>
            )}

            {/* Render Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="pl-9 pt-3 space-y-3 border-l ml-3">
                {comment.replies.map((reply: any) => (
                  <div key={reply.id} className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span>{reply.author?.profile?.name || 'User'}</span>
                      <span className="text-[10px] font-normal text-muted-foreground">
                        {new Date(reply.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
