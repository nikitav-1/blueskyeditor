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

      // Set 10 second timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Login timed out")), 10000);
      });

      await Promise.race([loginPromise, timeoutPromise]);
      const auth = await storage.setBlueskyAuth(result.data);
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
    res.json(posts);
  });

  app.post("/api/posts", async (req, res) => {
    const result = insertPostSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const post = await storage.createPost(result.data);

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