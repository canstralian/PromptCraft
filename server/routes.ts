import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generatePrompt, enhancePrompt } from "./gemini";
import { z } from "zod";
import { insertPromptSchema, insertTagSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes should be prefixed with /api
  const httpServer = createServer(app);

  // Get all categories
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get all public prompts
  app.get("/api/prompts", async (req: Request, res: Response) => {
    try {
      const prompts = await storage.getPublicPrompts();
      res.json(prompts);
    } catch (error) {
      console.error("Error fetching prompts:", error);
      res.status(500).json({ message: "Failed to fetch prompts" });
    }
  });

  // Get a single prompt by ID
  app.get("/api/prompts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid prompt ID" });
      }

      const prompt = await storage.getPromptWithDetails(id);
      if (!prompt) {
        return res.status(404).json({ message: "Prompt not found" });
      }

      res.json(prompt);
    } catch (error) {
      console.error("Error fetching prompt:", error);
      res.status(500).json({ message: "Failed to fetch prompt" });
    }
  });

  // Create a new prompt
  app.post("/api/prompts", async (req: Request, res: Response) => {
    try {
      const validationResult = insertPromptSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid prompt data", 
          errors: validationResult.error.errors 
        });
      }

      const prompt = await storage.createPrompt(validationResult.data);
      
      // Handle tags if provided
      if (req.body.tags && Array.isArray(req.body.tags)) {
        for (const tagName of req.body.tags) {
          let tag = await storage.getTagByName(tagName);
          
          // Create tag if it doesn't exist
          if (!tag) {
            tag = await storage.createTag({ name: tagName });
          }
          
          // Add tag to prompt
          await storage.addTagToPrompt(prompt.id, tag.id);
        }
      }
      
      const promptWithDetails = await storage.getPromptWithDetails(prompt.id);
      res.status(201).json(promptWithDetails);
    } catch (error) {
      console.error("Error creating prompt:", error);
      res.status(500).json({ message: "Failed to create prompt" });
    }
  });

  // Update an existing prompt
  app.put("/api/prompts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid prompt ID" });
      }

      const prompt = await storage.getPrompt(id);
      if (!prompt) {
        return res.status(404).json({ message: "Prompt not found" });
      }

      const validationResult = z.object({
        title: z.string().optional(),
        content: z.string().optional(),
        categoryId: z.number().optional(),
        isPublic: z.boolean().optional()
      }).safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid prompt data", 
          errors: validationResult.error.errors 
        });
      }

      const updatedPrompt = await storage.updatePrompt(id, validationResult.data);
      
      // Handle tags if provided
      if (req.body.tags && Array.isArray(req.body.tags)) {
        // Get current tags for this prompt
        const currentTags = await storage.getTagsForPrompt(id);
        const currentTagNames = currentTags.map(tag => tag.name);
        
        // Add new tags
        for (const tagName of req.body.tags) {
          if (!currentTagNames.includes(tagName)) {
            let tag = await storage.getTagByName(tagName);
            
            // Create tag if it doesn't exist
            if (!tag) {
              tag = await storage.createTag({ name: tagName });
            }
            
            // Add tag to prompt
            await storage.addTagToPrompt(id, tag.id);
          }
        }
        
        // Remove tags that are no longer present
        for (const tag of currentTags) {
          if (!req.body.tags.includes(tag.name)) {
            await storage.removeTagFromPrompt(id, tag.id);
          }
        }
      }
      
      const promptWithDetails = await storage.getPromptWithDetails(id);
      res.json(promptWithDetails);
    } catch (error) {
      console.error("Error updating prompt:", error);
      res.status(500).json({ message: "Failed to update prompt" });
    }
  });

  // Delete a prompt
  app.delete("/api/prompts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid prompt ID" });
      }

      const success = await storage.deletePrompt(id);
      if (!success) {
        return res.status(404).json({ message: "Prompt not found" });
      }

      res.json({ message: "Prompt deleted successfully" });
    } catch (error) {
      console.error("Error deleting prompt:", error);
      res.status(500).json({ message: "Failed to delete prompt" });
    }
  });

  // Search for prompts
  app.get("/api/prompts/search/:query", async (req: Request, res: Response) => {
    try {
      const query = req.params.query;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const prompts = await storage.searchPrompts(query);
      res.json(prompts);
    } catch (error) {
      console.error("Error searching prompts:", error);
      res.status(500).json({ message: "Failed to search prompts" });
    }
  });

  // Get prompts by category
  app.get("/api/categories/:id/prompts", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      const prompts = await storage.getPromptsByCategory(id);
      res.json(prompts);
    } catch (error) {
      console.error("Error fetching prompts by category:", error);
      res.status(500).json({ message: "Failed to fetch prompts by category" });
    }
  });

  // Get all tags
  app.get("/api/tags", async (req: Request, res: Response) => {
    try {
      const tags = await storage.getAllTags();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ message: "Failed to fetch tags" });
    }
  });
  
  // Get prompts by tag
  app.get("/api/tags/:id/prompts", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tag ID" });
      }

      const tag = await storage.getTag(id);
      if (!tag) {
        return res.status(404).json({ message: "Tag not found" });
      }

      const prompts = await storage.getPromptsByTag(id);
      res.json(prompts);
    } catch (error) {
      console.error("Error fetching prompts by tag:", error);
      res.status(500).json({ message: "Failed to fetch prompts by tag" });
    }
  });

  // Add a new tag
  app.post("/api/tags", async (req: Request, res: Response) => {
    try {
      const validationResult = insertTagSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid tag data", 
          errors: validationResult.error.errors 
        });
      }

      const tag = await storage.createTag(validationResult.data);
      res.status(201).json(tag);
    } catch (error) {
      console.error("Error creating tag:", error);
      res.status(500).json({ message: "Failed to create tag" });
    }
  });

  // AI prompt enhancement
  app.post("/api/ai/enhance", async (req: Request, res: Response) => {
    try {
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ message: "Prompt text is required" });
      }

      const enhancements = await enhancePrompt(prompt);
      res.json(enhancements);
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      res.status(500).json({ message: "Failed to enhance prompt" });
    }
  });

  // AI prompt generation
  app.post("/api/ai/generate", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        topic: z.string(),
        description: z.string().optional(),
        category: z.string().optional()
      });

      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid generation data", 
          errors: validationResult.error.errors 
        });
      }

      const generatedPrompt = await generatePrompt(validationResult.data);
      res.json({ prompt: generatedPrompt });
    } catch (error) {
      console.error("Error generating prompt:", error);
      res.status(500).json({ message: "Failed to generate prompt" });
    }
  });

  return httpServer;
}
