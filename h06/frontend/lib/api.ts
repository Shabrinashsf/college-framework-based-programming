export const API_URL = "http://localhost:3000";

export interface Post {
  id: string;
  posterName: string;
  content: string;
  replyToId?: string | null;
  createdAt: string;
  updatedAt: string;
  replies?: Post[];
}
