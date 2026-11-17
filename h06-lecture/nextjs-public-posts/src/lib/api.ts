// Shared types and helpers for talking to the NestJS backend.

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ??
  "http://localhost:3000";

export const POSTS_URL = `${API_URL}/posts`;
export const USERS_URL = `${API_URL}/users`;

export interface User {
  id: number;
  name: string;
  email: string;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  published: boolean;
  authorId: number;
  author: User;
  createdAt: string;
  updatedAt: string;
}

/** Body accepted by POST /posts (and, partially, PUT /posts/:id). */
export interface PostInput {
  title: string;
  content: string;
  published: boolean;
  authorId: number;
}

/**
 * Turns a failed response into a readable message.
 * NestJS errors look like `{ message: string | string[] }`; validation
 * errors use the array form.
 */
export async function getApiError(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === "object" && "message" in body) {
      const { message } = body as { message: unknown };
      if (Array.isArray(message)) return message.join("\n");
      if (typeof message === "string") return message;
    }
  } catch {
    // Body was not JSON; fall through to the status text.
  }
  return `Request failed (${response.status} ${response.statusText})`;
}

export function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "An error occurred";
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleString();
}

/** Reads a route param like `router.query.id` and returns it only if it is a positive integer. */
export function parseId(value: string | string[] | undefined): number | null {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return id > 0 ? id : null;
}
