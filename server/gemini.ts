import { GoogleGenerativeAI } from "@google/generative-ai";
import { AiEnhancementResponse, AiGeneratePromptRequest } from "@shared/schema";

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Generate AI-powered prompt based on user input
 */
export async function generatePrompt(request: AiGeneratePromptRequest): Promise<string> {
  try {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Construct a detailed prompt for Gemini
    const prompt = `
    Create a detailed and effective prompt for AI systems based on the following information:
    
    Topic: ${request.topic}
    ${request.description ? `Description: ${request.description}` : ''}
    ${request.category ? `Category: ${request.category}` : ''}
    
    Your response should be a well-structured prompt that:
    1. Is clear and specific
    2. Includes relevant context
    3. Uses appropriate tone and style for the category
    4. Includes any necessary parameters or constraints
    5. Is optimized for getting high-quality results from AI

    Respond with ONLY the prompt text, without any explanations, introductions or additional text.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    return text.trim();
  } catch (error) {
    console.error("Error generating prompt with Gemini:", error);
    throw new Error("Failed to generate prompt: " + (error as Error).message);
  }
}

/**
 * Enhance an existing prompt with AI suggestions
 */
export async function enhancePrompt(promptText: string): Promise<AiEnhancementResponse> {
  try {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    // Construct a detailed prompt for Gemini
    const prompt = `
    Analyze and improve the following AI prompt:
    
    "${promptText}"
    
    Provide 3 different enhanced versions of this prompt that:
    1. Make it more specific and detailed
    2. Add more context and constraints
    3. Improve clarity and optimize for better AI responses
    
    Format your response as 3 separate suggestions only, without any additional text, explanations or numbering.
    Each suggestion should be a complete prompt that can be used as-is.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Split the response into separate suggestions
    let suggestions = text.split('\n\n')
      .filter(suggestion => suggestion.trim().length > 0)
      .map(suggestion => suggestion.trim())
      .slice(0, 3); // Ensure we only have max 3 suggestions
    
    if (suggestions.length === 0) {
      suggestions = [text.trim()]; // Fallback if we can't split properly
    }
    
    return { suggestions };
  } catch (error) {
    console.error("Error enhancing prompt with Gemini:", error);
    throw new Error("Failed to enhance prompt: " + (error as Error).message);
  }
}