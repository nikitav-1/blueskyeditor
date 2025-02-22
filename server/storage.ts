import { type Post, type InsertPost, type BlueskyAuth } from "@shared/schema";

export interface IStorage {
  getPosts(): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  getPost(id: number): Promise<Post | undefined>;
  updatePost(id: number, post: Partial<Post>): Promise<Post>;
  getBlueskyAuth(): Promise<BlueskyAuth | undefined>;
  setBlueskyAuth(auth: Omit<BlueskyAuth, "id">): Promise<BlueskyAuth>;
}

export class MemStorage implements IStorage {
  private posts: Map<number, Post>;
  private auth: BlueskyAuth | undefined;
  private currentId: number;

  constructor() {
    this.posts = new Map();
    this.currentId = 1;
  }

  async getPosts(): Promise<Post[]> {
    return Array.from(this.posts.values());
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.currentId++;
    const post: Post = { ...insertPost, id, published: false };
    this.posts.set(id, post);
    return post;
  }

  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async updatePost(id: number, update: Partial<Post>): Promise<Post> {
    const post = await this.getPost(id);
    if (!post) throw new Error("Post not found");
    
    const updatedPost = { ...post, ...update };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async getBlueskyAuth(): Promise<BlueskyAuth | undefined> {
    return this.auth;
  }

  async setBlueskyAuth(auth: Omit<BlueskyAuth, "id">): Promise<BlueskyAuth> {
    this.auth = { ...auth, id: 1 };
    return this.auth;
  }
}

export const storage = new MemStorage();
