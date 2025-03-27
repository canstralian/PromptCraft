import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Category schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  icon: true,
  color: true,
});

// Tag schema
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const insertTagSchema = createInsertSchema(tags).pick({
  name: true,
});

// Prompt schema
export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  categoryId: integer("category_id").notNull(),
  userId: integer("user_id").notNull(),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPromptSchema = createInsertSchema(prompts).pick({
  title: true,
  content: true,
  categoryId: true,
  userId: true,
  isPublic: true,
});

// PromptTag junction table
export const promptTags = pgTable("prompt_tags", {
  id: serial("id").primaryKey(),
  promptId: integer("prompt_id").notNull(),
  tagId: integer("tag_id").notNull(),
});

export const insertPromptTagSchema = createInsertSchema(promptTags).pick({
  promptId: true,
  tagId: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;

export type Prompt = typeof prompts.$inferSelect;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;

export type PromptTag = typeof promptTags.$inferSelect;
export type InsertPromptTag = z.infer<typeof insertPromptTagSchema>;

// Enhanced types for the frontend
export type PromptWithDetails = Prompt & {
  category: Category;
  user: {
    id: number;
    username: string;
  };
  tags: Tag[];
};

// Request and response types
export interface AiEnhancementRequest {
  prompt: string;
}

export interface AiEnhancementResponse {
  suggestions: string[];
}

export interface AiGeneratePromptRequest {
  topic: string;
  description?: string;
  category?: string;
}
