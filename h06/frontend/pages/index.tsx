import { useEffect, useState } from "react";
import Link from "next/link";
import Avatar from "../components/Avatar";
import TimeAgo from "../components/TimeAgo";
import { API_URL, Post } from "../lib/api";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadPosts() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/posts`);
      if (!response.ok) {
        throw new Error(`Failed to load posts (${response.status})`);
      }
      const data: Post[] = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;

    try {
      const response = await fetch(`${API_URL}/posts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Failed to delete post (${response.status})`);
      }
      await loadPosts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting post");
    }
  }

  // GET /posts also returns replies; only top-level posts go on the timeline
  const topLevelPosts = posts.filter((post) => !post.replyToId);

  return (
    <>
      <div className="page-head">
        <h1 className="page-title">All Posts</h1>
      </div>

      {loading ? (
        <div className="empty">
          <p>Loading...</p>
        </div>
      ) : error ? (
        <div className="empty">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button className="btn" onClick={loadPosts}>
            Try again
          </button>
        </div>
      ) : topLevelPosts.length === 0 ? (
        <div className="empty">
          <h2>No posts yet</h2>
          <p>When someone writes a post, it will show up here.</p>
          <Link href="/posts/new" className="btn">
            Write the first post
          </Link>
        </div>
      ) : (
        topLevelPosts.map((post) => {
          const replies = post.replies ?? [];
          return (
            <article key={post.id} className="tweet">
              <Avatar name={post.posterName} />
              <div className="tweet-main">
                <div className="tweet-head">
                  <span className="name">{post.posterName}</span>
                  <span>·</span>
                  <Link href={`/posts/${post.id}`} className="time">
                    <TimeAgo date={post.createdAt} />
                  </Link>
                </div>

                <Link href={`/posts/${post.id}`} className="content">
                  {post.content}
                </Link>

                {replies.length > 0 && (
                  <div
                    className="thread"
                    style={{ borderLeft: "3px solid #e9ecef", paddingLeft: 15 }}
                  >
                    <h4 className="thread-label">Replies ({replies.length})</h4>
                    {replies.map((reply) => (
                      <div key={reply.id} className="mini">
                        <div className="tweet-head">
                          <Avatar name={reply.posterName} size="sm" />
                          <span className="name">{reply.posterName}</span>
                          <span>·</span>
                          <TimeAgo date={reply.createdAt} />
                        </div>
                        <Link href={`/posts/${reply.id}`} className="content">
                          {reply.content}
                        </Link>
                      </div>
                    ))}
                  </div>
                )}

                <div className="actions">
                  <Link href={`/posts/${post.id}`} className="act">
                    View
                  </Link>
                  <Link href={`/posts/${post.id}/reply`} className="act act-reply">
                    Reply
                  </Link>
                  <Link href={`/posts/${post.id}/edit`} className="act">
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="act act-delete"
                    onClick={() => handleDelete(post.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          );
        })
      )}
    </>
  );
}
