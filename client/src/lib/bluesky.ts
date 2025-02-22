import { apiRequest } from "./queryClient";
import { type InsertPost, type Post, type BlueskyAuth } from "@shared/schema";

export async function createPost(post: InsertPost): Promise<Post> {
  const res = await apiRequest("POST", "/api/posts", post);
  return res.json();
}

export async function loginToBluesky(auth: Omit<BlueskyAuth, "id">): Promise<BlueskyAuth> {
  const res = await apiRequest("POST", "/api/auth", auth);
  return res.json();
}
