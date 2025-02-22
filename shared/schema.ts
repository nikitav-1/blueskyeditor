import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  scheduledFor: timestamp("scheduled_for"),
  published: boolean("published").default(false).notNull(),
});

export const blueskyAuth = pgTable("bluesky_auth", {
  id: serial("id").primaryKey(),
  identifier: text("identifier").notNull(),
  password: text("password").notNull(),
});

export const insertPostSchema = createInsertSchema(posts).omit({ id: true, published: true });
export const insertBlueskyAuthSchema = createInsertSchema(blueskyAuth).omit({ id: true });

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
export type BlueskyAuth = typeof blueskyAuth.$inferSelect;
