import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import PostForm, { PostFormValues } from "../../../components/PostForm";
import { API_URL, Post } from "../../../lib/api";

export default function EditPost() {
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
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        router.push(`/posts/${postId}`);
      } else {
        alert("Error updating post");
      }
    } catch {
      alert("Error updating post");
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
        <h1 className="page-title">Edit post</h1>
      </div>

      <PostForm
        initialName={post.posterName}
        initialContent={post.content}
        submitLabel="Save"
        cancelHref={`/posts/${post.id}`}
        onSubmit={handleSubmit}
      />
    </>
  );
}
