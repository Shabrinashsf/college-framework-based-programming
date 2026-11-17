import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  POSTS_URL,
  formatDate,
  getApiError,
  parseId,
  type Post,
} from "@/lib/api";

export default function PostDetails() {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const postId = parseId(router.query.id);

  useEffect(() => {
    if (!router.isReady) return;
    if (postId === null) {
      router.replace("/");
      return;
    }

    let ignore = false;

    fetch(`${POSTS_URL}/${postId}`)
      .then((response) => {
        if (!response.ok) throw new Error("Post not found");
        return response.json() as Promise<Post>;
      })
      .then((data) => {
        if (!ignore) setPost(data);
      })
      .catch(() => {
        if (!ignore) router.replace("/");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [postId, router]);

  async function handleDelete() {
    if (postId === null) return;
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(`${POSTS_URL}/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Post deleted successfully");
        await router.push("/");
      } else {
        alert(await getApiError(response));
      }
    } catch {
      alert("Error deleting post");
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Post Details</h1>
        <div>
          <Link href={`/posts/${post.id}/edit`} className="btn btn-warning me-2">
            Edit
          </Link>
          <Link href="/" className="btn btn-secondary">
            Back to Posts
          </Link>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          <h2 className="card-title h4">
            {post.title}{" "}
            {post.published ? (
              <span className="badge bg-success">Published</span>
            ) : (
              <span className="badge bg-secondary">Draft</span>
            )}
          </h2>
          <p className="card-text" style={{ whiteSpace: "pre-wrap" }}>
            {post.content}
          </p>
          <div className="mt-3">
            <small className="text-muted">
              <strong>Author:</strong> {post.author.name} ({post.author.email})
              <br />
              <strong>ID:</strong> {post.id}
              <br />
              <strong>Created:</strong> {formatDate(post.createdAt)}
              <br />
              <strong>Updated:</strong> {formatDate(post.updatedAt)}
            </small>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <button type="button" className="btn btn-danger" onClick={handleDelete}>
          Delete Post
        </button>
      </div>
    </>
  );
}
