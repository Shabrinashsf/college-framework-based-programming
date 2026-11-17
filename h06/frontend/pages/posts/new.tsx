import Link from "next/link";
import { useRouter } from "next/router";
import PostForm, { PostFormValues } from "../../components/PostForm";
import { API_URL } from "../../lib/api";

export default function NewPost() {
  const router = useRouter();

  async function handleSubmit(values: PostFormValues) {
    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        router.push("/");
      } else {
        alert("Error creating post");
      }
    } catch {
      alert("Error creating post");
    }
  }

  return (
    <>
      <div className="page-head">
        <Link href="/" className="back" aria-label="Back">
          ←
        </Link>
        <h1 className="page-title">New post</h1>
      </div>

      <PostForm
        placeholder="What's happening?"
        submitLabel="Post"
        cancelHref="/"
        onSubmit={handleSubmit}
      />
    </>
  );
}
