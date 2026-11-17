import Link from "next/link";
import { useEffect, useState } from "react";
import {
  POSTS_URL,
  formatDate,
  getApiError,
  getErrorMessage,
  type Post,
} from "@/lib/api";

async function getPosts(): Promise<Post[]> {
  const response = await fetch(POSTS_URL);
  if (!response.ok) {
    throw new Error(await getApiError(response));
  }
  return response.json();
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadPosts() {
    try {
      const data = await getPosts();
      setPosts(data);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    getPosts()
      .then((data) => {
        if (!ignore) setPosts(data);
      })
      .catch((err) => {
        if (!ignore) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  function handleRetry() {
    setLoading(true);
    setError(null);
    loadPosts();
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure?")) return;

    try {
      const response = await fetch(`${POSTS_URL}/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await loadPosts();
        alert("Deleted successfully");
      } else {
        alert(await getApiError(response));
      }
    } catch {
      alert("Error deleting post");
    }
  }

  return (
    <>
      <h1>App Posts</h1>
      <Link href="/posts/new" className="btn btn-primary mb-3">
        Create New Post
      </Link>
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <h4>Error</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      ) : posts.length > 0 ? (
        <div className="row">
          {posts.map((post) => (
            <div key={post.id} className="mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">
                    {post.title}{" "}
                    {!post.published && (
                      <span className="badge bg-secondary">Draft</span>
                    )}
                  </h5>
                  <p className="card-text">{post.content}</p>
                  <small className="text-muted">
                    by {post.author.name} · {formatDate(post.createdAt)}
                  </small>
                  <div className="mt-2">
                    <Link
                      href={`/posts/${post.id}`}
                      className="btn btn-sm btn-info me-2"
                    >
                      View
                    </Link>
                    <Link
                      href={`/posts/${post.id}/edit`}
                      className="btn btn-sm btn-warning me-2"
                    >
                      Edit
                    </Link>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(post.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-info">
          <h4>No posts yet</h4>
          <p>Be the first to create a post!</p>
          <Link href="/posts/new" className="btn btn-primary">
            Create First Post
          </Link>
        </div>
      )}
    </>
  );
}
