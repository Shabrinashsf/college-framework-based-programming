import { useRouter } from "next/router";
import PostForm from "@/components/PostForm";
import { POSTS_URL, getApiError, type PostInput } from "@/lib/api";

export default function NewPost() {
  const router = useRouter();

  async function createPost(values: PostInput) {
    const response = await fetch(POSTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!response.ok) {
      throw new Error(await getApiError(response));
    }
    await router.push("/");
  }

  return (
    <>
      <h1>Create New Post</h1>
      <PostForm
        submitLabel="Create Post"
        submittingLabel="Creating..."
        cancelHref="/"
        onSubmit={createPost}
      />
    </>
  );
}
