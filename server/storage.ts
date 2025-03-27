import {
  users,
  type User,
  type InsertUser,
  categories,
  type Category,
  type InsertCategory,
  tags,
  type Tag,
  type InsertTag,
  prompts,
  type Prompt,
  type InsertPrompt,
  promptTags,
  type PromptTag,
  type InsertPromptTag,
  type PromptWithDetails,
} from "@shared/schema";

// Storage interface for CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category operations
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Tag operations
  getAllTags(): Promise<Tag[]>;
  getTag(id: number): Promise<Tag | undefined>;
  getTagByName(name: string): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;

  // Prompt operations
  getAllPrompts(): Promise<Prompt[]>;
  getPrompt(id: number): Promise<Prompt | undefined>;
  getPromptWithDetails(id: number): Promise<PromptWithDetails | undefined>;
  getPublicPrompts(): Promise<PromptWithDetails[]>;
  getUserPrompts(userId: number): Promise<PromptWithDetails[]>;
  searchPrompts(query: string): Promise<PromptWithDetails[]>;
  getPromptsByCategory(categoryId: number): Promise<PromptWithDetails[]>;
  getPromptsByTag(tagId: number): Promise<PromptWithDetails[]>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  updatePrompt(
    id: number,
    prompt: Partial<InsertPrompt>,
  ): Promise<Prompt | undefined>;
  deletePrompt(id: number): Promise<boolean>;

  // PromptTag operations
  addTagToPrompt(promptId: number, tagId: number): Promise<PromptTag>;
  removeTagFromPrompt(promptId: number, tagId: number): Promise<boolean>;
  getTagsForPrompt(promptId: number): Promise<Tag[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private tags: Map<number, Tag>;
  private prompts: Map<number, Prompt>;
  private promptTags: Map<number, PromptTag>;

  private userIdCounter: number;
  private categoryIdCounter: number;
  private tagIdCounter: number;
  private promptIdCounter: number;
  private promptTagIdCounter: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.tags = new Map();
    this.prompts = new Map();
    this.promptTags = new Map();

    this.userIdCounter = 1;
    this.categoryIdCounter = 1;
    this.tagIdCounter = 1;
    this.promptIdCounter = 1;
    this.promptTagIdCounter = 1;

    // Initialize with default user
    this.createUser({ username: "John Doe", password: "password" });

    // Initialize with default categories
    const defaultCategories = [
      { name: "Creative Writing", icon: "palette", color: "blue" },
      { name: "Business", icon: "chart-simple", color: "green" },
      { name: "Programming", icon: "code", color: "purple" },
      { name: "Education", icon: "lightbulb", color: "amber" },
      { name: "Health", icon: "heart", color: "red" },
    ];

    defaultCategories.forEach((cat) => this.createCategory(cat));

    // Initialize with default tags
    const defaultTags = [
      "writing",
      "storytelling",
      "fiction",
      "business",
      "marketing",
      "analysis",
      "coding",
      "optimization",
      "software",
      "education",
      "learning",
      "teaching",
      "wellness",
      "health",
      "lifestyle",
      "character",
      "creative",
    ];

    defaultTags.forEach((tagName) => this.createTag({ name: tagName }));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryByName(name: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.name.toLowerCase() === name.toLowerCase(),
    );
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  // Tag methods
  async getAllTags(): Promise<Tag[]> {
    return Array.from(this.tags.values());
  }

  async getTag(id: number): Promise<Tag | undefined> {
    return this.tags.get(id);
  }

  async getTagByName(name: string): Promise<Tag | undefined> {
    return Array.from(this.tags.values()).find(
      (tag) => tag.name.toLowerCase() === name.toLowerCase(),
    );
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const id = this.tagIdCounter++;
    const tag: Tag = { ...insertTag, id };
    this.tags.set(id, tag);
    return tag;
  }

  // Prompt methods
  async getAllPrompts(): Promise<Prompt[]> {
    return Array.from(this.prompts.values());
  }

  async getPrompt(id: number): Promise<Prompt | undefined> {
    return this.prompts.get(id);
  }

  async getPromptWithDetails(
    id: number,
  ): Promise<PromptWithDetails | undefined> {
    const prompt = this.prompts.get(id);
    if (!prompt) {
      return undefined;
    }

    const category = this.categories.get(prompt.categoryId);
    if (!category) {
      return undefined;
    }

    const user = this.users.get(prompt.userId);
    if (!user) {
      return undefined;
    }

    const tags = await this.getTagsForPrompt(prompt.id);

    return {
      ...prompt,
      category,
      user: {
        id: user.id,
        username: user.username,
      },
      tags,
    };
  }

  async getPublicPrompts(): Promise<PromptWithDetails[]> {
    const publicPrompts = Array.from(this.prompts.values()).filter(
      (prompt) => prompt.isPublic,
    );

    const promptDetails: PromptWithDetails[] = [];
    for (const prompt of publicPrompts) {
      const details = await this.getPromptWithDetails(prompt.id);
      if (details) {
        promptDetails.push(details);
      }
    }

    return promptDetails;
  }

  async getUserPrompts(userId: number): Promise<PromptWithDetails[]> {
    const userPrompts = Array.from(this.prompts.values()).filter(
      (prompt) => prompt.userId === userId,
    );

    const promptDetails: PromptWithDetails[] = [];
    for (const prompt of userPrompts) {
      const details = await this.getPromptWithDetails(prompt.id);
      if (details) {
        promptDetails.push(details);
      }
    }

    return promptDetails;
  }

  async searchPrompts(query: string): Promise<PromptWithDetails[]> {
    const lowercaseQuery = query.toLowerCase();

    const matchingPrompts = Array.from(this.prompts.values()).filter(
      (prompt) => {
        return (
          prompt.isPublic &&
          (prompt.title.toLowerCase().includes(lowercaseQuery) ||
            prompt.content.toLowerCase().includes(lowercaseQuery))
        );
      },
    );

    const promptDetails: PromptWithDetails[] = [];
    for (const prompt of matchingPrompts) {
      const details = await this.getPromptWithDetails(prompt.id);
      if (details) {
        promptDetails.push(details);
      }
    }

    return promptDetails;
  }

  async getPromptsByCategory(categoryId: number): Promise<PromptWithDetails[]> {
    const categoryPrompts = Array.from(this.prompts.values()).filter(
      (prompt) => prompt.categoryId === categoryId && prompt.isPublic,
    );

    const promptDetails: PromptWithDetails[] = [];
    for (const prompt of categoryPrompts) {
      const details = await this.getPromptWithDetails(prompt.id);
      if (details) {
        promptDetails.push(details);
      }
    }

    return promptDetails;
  }

  async getPromptsByTag(tagId: number): Promise<PromptWithDetails[]> {
    const promptIds = new Set(
      Array.from(this.promptTags.values())
        .filter((pt) => pt.tagId === tagId)
        .map((pt) => pt.promptId),
    );

    const tagPrompts = Array.from(this.prompts.values()).filter(
      (prompt) => promptIds.has(prompt.id) && prompt.isPublic,
    );

    const promptDetails: PromptWithDetails[] = [];
    for (const prompt of tagPrompts) {
      const details = await this.getPromptWithDetails(prompt.id);
      if (details) {
        promptDetails.push(details);
      }
    }

    return promptDetails;
  }

  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const id = this.promptIdCounter++;
    const now = new Date();
    const prompt: Prompt = {
      ...insertPrompt,
      id,
      createdAt: now,
    };
    this.prompts.set(id, prompt);
    return prompt;
  }

  async updatePrompt(
    id: number,
    updateData: Partial<InsertPrompt>,
  ): Promise<Prompt | undefined> {
    const prompt = this.prompts.get(id);
    if (!prompt) {
      return undefined;
    }

    const updatedPrompt: Prompt = {
      ...prompt,
      ...updateData,
    };

    this.prompts.set(id, updatedPrompt);
    return updatedPrompt;
  }

  async deletePrompt(id: number): Promise<boolean> {
    const deleted = this.prompts.delete(id);

    // Also delete related prompt tags
    if (deleted) {
      const promptTagsToDelete = Array.from(this.promptTags.values()).filter(
        (pt) => pt.promptId === id,
      );

      promptTagsToDelete.forEach((pt) => {
        this.promptTags.delete(pt.id);
      });
    }

    return deleted;
  }

  // PromptTag methods
  async addTagToPrompt(promptId: number, tagId: number): Promise<PromptTag> {
    // Check if this prompt-tag relationship already exists
    const existingRelation = Array.from(this.promptTags.values()).find(
      (pt) => pt.promptId === promptId && pt.tagId === tagId,
    );

    if (existingRelation) {
      return existingRelation;
    }

    const id = this.promptTagIdCounter++;
    const promptTag: PromptTag = { id, promptId, tagId };
    this.promptTags.set(id, promptTag);
    return promptTag;
  }

  async removeTagFromPrompt(promptId: number, tagId: number): Promise<boolean> {
    const ptToDelete = Array.from(this.promptTags.values()).find(
      (pt) => pt.promptId === promptId && pt.tagId === tagId,
    );

    if (!ptToDelete) {
      return false;
    }

    return this.promptTags.delete(ptToDelete.id);
  }

  async getTagsForPrompt(promptId: number): Promise<Tag[]> {
    const tagIds = Array.from(this.promptTags.values())
      .filter((pt) => pt.promptId === promptId)
      .map((pt) => pt.tagId);

    return tagIds.map((id) => this.tags.get(id)).filter(Boolean) as Tag[];
  }
}

export const storage = new MemStorage();
