import Link from "next/link";
import { useEffect, useState, type SubmitEvent } from "react";
import {
  USERS_URL,
  getApiError,
  getErrorMessage,
  type PostInput,
  type User,
} from "@/lib/api";

interface PostFormProps {
  initialValues?: PostInput;
  submitLabel: string;
  submittingLabel: string;
  cancelHref: string;
  /** Throws an Error with a readable message when saving fails. */
  onSubmit: (values: PostInput) => Promise<void>;
}

const EMPTY_POST: PostInput = {
  title: "",
  content: "",
  published: false,
  authorId: 0,
};

export default function PostForm({
  initialValues = EMPTY_POST,
  submitLabel,
  submittingLabel,
  cancelHref,
  onSubmit,
}: PostFormProps) {
  const [title, setTitle] = useState(initialValues.title);
  const [content, setContent] = useState(initialValues.content);
  const [published, setPublished] = useState(initialValues.published);
  const [authorId, setAuthorId] = useState(initialValues.authorId);

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    fetch(USERS_URL)
      .then(async (response) => {
        if (!response.ok) throw new Error(await getApiError(response));
        return response.json() as Promise<User[]>;
      })
      .then((data) => {
        if (ignore) return;
        setUsers(data);
        // Pre-select the first user when creating a new post.
        setAuthorId((current) => current || data[0]?.id || 0);
      })
      .catch((err) => {
        if (!ignore) setUsersError(getErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setUsersLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const values: PostInput = {
      title: title.trim(),
      content: content.trim(),
      published,
      authorId,
    };
    if (!values.title || !values.content) {
      setSubmitError("Title and content are required.");
      return;
    }
    if (!values.authorId) {
      setSubmitError("Please choose an author.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      setIsSubmitting(false);
    }
  }

  const noUsers = !usersLoading && !usersError && users.length === 0;

  return (
    <form onSubmit={handleSubmit}>
      {submitError && (
        <div className="alert alert-danger" style={{ whiteSpace: "pre-line" }}>
          {submitError}
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="title" className="form-label">
          Title
        </label>
        <input
          className="form-control"
          id="title"
          type="text"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="content" className="form-label">
          Content
        </label>
        <textarea
          className="form-control"
          id="content"
          rows={5}
          required
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label htmlFor="authorId" className="form-label">
          Author
        </label>
        {usersLoading ? (
          <p className="form-text">Loading users...</p>
        ) : usersError ? (
          <div className="alert alert-warning mb-0">
            Could not load users: {usersError}
          </div>
        ) : noUsers ? (
          <div className="alert alert-warning mb-0">
            No users yet. Create one first with <code>POST /users</code> on
            the backend.
          </div>
        ) : (
          <select
            className="form-select"
            id="authorId"
            required
            value={authorId}
            onChange={(e) => setAuthorId(Number(e.target.value))}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="form-check mb-3">
        <input
          className="form-check-input"
          id="published"
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        <label htmlFor="published" className="form-check-label">
          Published
        </label>
      </div>

      <div className="d-flex gap-2">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting || usersLoading || users.length === 0}
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
        <Link href={cancelHref} className="btn btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
