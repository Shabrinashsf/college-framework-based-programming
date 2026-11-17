import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PostForm from "@/components/PostForm";
import {
  POSTS_URL,
  formatDate,
  getApiError,
  parseId,
  type Post,
  type PostInput,
} from "@/lib/api";

export default function EditPost() {
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

  async function updatePost(values: PostInput) {
    const response = await fetch(`${POSTS_URL}/${postId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!response.ok) {
      throw new Error(await getApiError(response));
    }
    await router.push(`/posts/${postId}`);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <>
      <h1>Edit Post</h1>
      <p>
        <small className="text-muted">
          <strong>Created:</strong> {formatDate(post.createdAt)}
          <br />
          <strong>Last Updated:</strong> {formatDate(post.updatedAt)}
        </small>
      </p>
      <PostForm
        initialValues={{
          title: post.title,
          content: post.content,
          published: post.published,
          authorId: post.authorId,
        }}
        submitLabel="Update Post"
        submittingLabel="Updating..."
        cancelHref={`/posts/${post.id}`}
        onSubmit={updatePost}
      />
    </>
  );
}
