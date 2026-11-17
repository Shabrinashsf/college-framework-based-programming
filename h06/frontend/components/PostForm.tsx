import { useState } from "react";
import Link from "next/link";

export interface PostFormValues {
  posterName: string;
  content: string;
}

interface PostFormProps {
  submitLabel: string;
  cancelHref: string;
  onSubmit: (values: PostFormValues) => Promise<void>;
  initialName?: string;
  initialContent?: string;
  contentLabel?: string;
  placeholder?: string;
}

// Form for new, edit, and reply (same as h05 views/partials/post-form.ejs)
export default function PostForm({
  submitLabel,
  cancelHref,
  onSubmit,
  initialName = "",
  initialContent = "",
  contentLabel = "Content",
  placeholder = "",
}: PostFormProps) {
  const [posterName, setPosterName] = useState(initialName);
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!posterName.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        posterName: posterName.trim(),
        content: content.trim(),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="field">
        <label htmlFor="posterName">Name</label>
        <input
          type="text"
          id="posterName"
          maxLength={100}
          required
          autoFocus={!initialName}
          value={posterName}
          onChange={(e) => setPosterName(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="content">{contentLabel}</label>
        <textarea
          id="content"
          maxLength={25000}
          placeholder={placeholder}
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="form-actions">
        <Link href={cancelHref} className="btn btn-outline">
          Cancel
        </Link>
        <button type="submit" className="btn" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
