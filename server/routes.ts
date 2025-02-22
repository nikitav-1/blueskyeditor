import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPostSchema, insertBlueskyAuthSchema } from "@shared/schema";
import { BskyAgent } from "@atproto/api";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  app.post("/api/auth", async (req, res) => {
    const result = insertBlueskyAuthSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const agent = new BskyAgent({ service: "https://bsky.social" });
    try {
      // Add timeout to the login request
      const loginPromise = agent.login({ 
        identifier: result.data.identifier, 
        password: result.data.password 
      });

      // Reduce timeout to 5 seconds for faster feedback
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Login timed out")), 5000);
      });

      await Promise.race([loginPromise, timeoutPromise]);
      const auth = await storage.setBlueskyAuth(result.data);

      // Return quickly to improve perceived performance
      res.json(auth);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid credentials";
      res.status(401).json({ error: message });
    }
  });

  app.get("/api/auth", async (req, res) => {
    const auth = await storage.getBlueskyAuth();
    res.json(auth);
  });

  app.get("/api/posts", async (req, res) => {
    const posts = await storage.getPosts();
    // Filter out drafts from the main posts list
    res.json(posts.filter(post => !post.isDraft));
  });

  app.get("/api/posts/drafts", async (req, res) => {
    const posts = await storage.getPosts();
    // Only return drafts
    res.json(posts.filter(post => post.isDraft));
  });

  app.post("/api/posts/draft", async (req, res) => {
    const result = insertPostSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const post = await storage.createPost({
      ...result.data,
      isDraft: true
    });

    res.json(post);
  });

  app.delete("/api/posts/draft/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    await storage.deletePost(id);
    res.sendStatus(200);
  });

  app.post("/api/posts", async (req, res) => {
    const result = insertPostSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const post = await storage.createPost({
      ...result.data,
      isDraft: false
    });

    // If no schedule date, post immediately
    if (!post.scheduledFor) {
      const auth = await storage.getBlueskyAuth();
      if (!auth) {
        return res.status(401).json({ error: "Not authenticated with Bluesky" });
      }

      const agent = new BskyAgent({ service: "https://bsky.social" });
      try {
        await agent.login({ identifier: auth.identifier, password: auth.password });
        await agent.post({ text: post.content });
        await storage.updatePost(post.id, { published: true });
        post.published = true;
      } catch (error) {
        return res.status(500).json({ error: "Failed to post to Bluesky" });
      }
    }

    res.json(post);
  });

  return httpServer;
}