import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Avatar from "../../../components/Avatar";
import PostForm, { PostFormValues } from "../../../components/PostForm";
import TimeAgo from "../../../components/TimeAgo";
import { API_URL, Post } from "../../../lib/api";

export default function ReplyToPost() {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id: postId } = router.query;

  useEffect(() => {
    if (!postId) return;

    async function fetchPost() {
      try {
        const response = await fetch(`${API_URL}/posts/${postId}`);
        if (response.ok) {
          setPost(await response.json());
        } else {
          router.push("/");
        }
      } catch {
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [postId, router]);

  async function handleSubmit(values: PostFormValues) {
    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, replyToId: postId }),
      });

      if (response.ok) {
        router.push(`/posts/${postId}`);
      } else {
        alert("Error creating reply");
      }
    } catch {
      alert("Error creating reply");
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
      </div>
    );
  }

  return (
    <>
      <div className="page-head">
        <Link href={`/posts/${post.id}`} className="back" aria-label="Back">
          ←
        </Link>
        <h1 className="page-title">Reply</h1>
      </div>

      <div className="quote">
        <Avatar name={post.posterName} />
        <div className="tweet-main">
          <div className="tweet-head">
            <span className="name">{post.posterName}</span>
            <span>·</span>
            <TimeAgo date={post.createdAt} />
          </div>
          <div className="content">{post.content}</div>
          <div className="replying" style={{ marginTop: 10 }}>
            Replying to <span className="accent">{post.posterName}</span>
          </div>
        </div>
      </div>

      <PostForm
        contentLabel="Your reply"
        placeholder="Post your reply"
        submitLabel="Reply"
        cancelHref={`/posts/${post.id}`}
        onSubmit={handleSubmit}
      />
    </>
  );
}
