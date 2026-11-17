import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Avatar from "../../components/Avatar";
import TimeAgo from "../../components/TimeAgo";
import { API_URL, Post } from "../../lib/api";
import { fullDate, isoDate } from "../../lib/view-helpers";

export default function PostDetails() {
  const [post, setPost] = useState<Post | null>(null);
  const [replyToPost, setReplyToPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id: postId } = router.query;

  useEffect(() => {
    if (!postId) return;

    async function loadPost() {
      setLoading(true);
      setReplyToPost(null);

      try {
        const response = await fetch(`${API_URL}/posts/${postId}`);
        if (!response.ok) {
          router.push("/");
          return;
        }
        const postData: Post = await response.json();
        setPost(postData);

        if (postData.replyToId) {
          const parentResponse = await fetch(`${API_URL}/posts/${postData.replyToId}`);
          if (parentResponse.ok) {
            setReplyToPost(await parentResponse.json());
          }
        }
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [postId, router]);

  async function handleDelete() {
    if (!confirm("Delete this post?")) return;

    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.push(replyToPost ? `/posts/${replyToPost.id}` : "/");
      } else {
        alert("Error deleting post");
      }
    } catch {
      alert("Error deleting post");
    }
  }

  if (loading) {
    return (
      <div className="empty">
        <p>Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="empty">
        <h2>Post not found</h2>
        <Link href="/" className="btn">
          Back to posts
        </Link>
      </div>
    );
  }

  const replies = post.replies ?? [];
  const edited =
    new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime() > 1000;

  return (
    <>
      <div className="page-head">
        <Link
          href={replyToPost ? `/posts/${replyToPost.id}` : "/"}
          className="back"
          aria-label="Back"
        >
          ←
        </Link>
        <h1 className="page-title">Post</h1>
      </div>

      <article className="focus">
        <div className="focus-head">
          <Avatar name={post.posterName} size="lg" />
          <div style={{ minWidth: 0 }}>
            <span className="name">{post.posterName}</span>
            {replyToPost && (
              <div className="replying">
                Replying to{" "}
                <Link href={`/posts/${replyToPost.id}`}>{replyToPost.posterName}</Link>
              </div>
            )}
          </div>
        </div>

        <div className="focus-text">{post.content}</div>

        <div className="focus-meta">
          <time dateTime={isoDate(post.createdAt)}>{fullDate(post.createdAt)}</time>
          {edited && (
            <>
              {" · "}
              <span title={fullDate(post.updatedAt)}>Edited</span>
            </>
          )}
        </div>

        <div className="focus-stats">
          <strong>{replies.length}</strong> {replies.length === 1 ? "Reply" : "Replies"}
        </div>

        <div className="actions">
          <Link href={`/posts/${post.id}/reply`} className="act act-reply">
            Reply
          </Link>
          <Link href={`/posts/${post.id}/edit`} className="act">
            Edit
          </Link>
          <button type="button" className="act act-delete" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </article>

      {replies.length > 0 ? (
        <>
          <div className="section-label">Replies ({replies.length})</div>
          {replies.map((reply) => {
            const nested = reply.replies ?? [];
            return (
              <article
                key={reply.id}
                className="tweet"
                style={{ borderLeft: "4px solid #28a745", backgroundColor: "#f8f9fa" }}
              >
                <Avatar name={reply.posterName} />
                <div className="tweet-main">
                  <div className="tweet-head">
                    <span className="name" style={{ color: "#28a745" }}>
                      {reply.posterName}
                    </span>
                    <span>·</span>
                    <Link href={`/posts/${reply.id}`} className="time">
                      <TimeAgo date={reply.createdAt} />
                    </Link>
                  </div>
                  <div className="replying">
                    Replying to <span className="accent">{post.posterName}</span>
                  </div>
                  <div className="content">{reply.content}</div>
                  <div className="actions">
                    <Link href={`/posts/${reply.id}`} className="act">
                      View
                    </Link>
                    <Link href={`/posts/${reply.id}/reply`} className="act act-reply">
                      Reply
                    </Link>
                    {nested.length > 0 && (
                      <Link href={`/posts/${reply.id}`} className="nested">
                        {nested.length} more {nested.length === 1 ? "reply" : "replies"}
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </>
      ) : (
        <div className="empty">
          <p>No replies yet.</p>
          <Link href={`/posts/${post.id}/reply`} className="btn">
            Write the first reply
          </Link>
        </div>
      )}
    </>
  );
}
