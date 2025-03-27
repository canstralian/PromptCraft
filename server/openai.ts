import OpenAI from "openai";
import { AiEnhancementResponse, AiGeneratePromptRequest } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

/**
 * Generate AI-powered prompt based on user input
 */
export async function generatePrompt(request: AiGeneratePromptRequest): Promise<string> {
  const { topic, description, category } = request;
  
  let prompt = `Create a detailed, effective AI prompt about ${topic}`;
  
  if (description) {
    prompt += ` that addresses: ${description}`;
  }
  
  if (category) {
    prompt += `. This prompt should be appropriate for the category: ${category}`;
  }
  
  prompt += `. The format should use placeholders like [placeholder] for variables users can customize. 
  Make the prompt detailed, specific, and designed to get high-quality AI responses.
  Do not include explanations, just return the prompt text directly.`;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are an expert at creating effective AI prompts." },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
    });

    return response.choices[0].message.content?.trim() || 
      "Create a [type] about [subject] with [specific details] in a [style] format.";
  } catch (error) {
    console.error("Error generating prompt:", error);
    throw new Error("Failed to generate prompt with AI");
  }
}

/**
 * Enhance an existing prompt with AI suggestions
 */
export async function enhancePrompt(promptText: string): Promise<AiEnhancementResponse> {
  const prompt = `
    Analyze this AI prompt and suggest 3 specific ways to enhance it for better results:
    
    "${promptText}"
    
    Provide your suggestions in a clear, actionable format. Each suggestion should be complete and ready to implement.
    Return just the suggestions as a JSON array of strings.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are an expert at improving AI prompts for clarity and effectiveness." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return { suggestions: [] };
    }
    
    // Parse the JSON response
    try {
      const parsedResponse = JSON.parse(content);
      if (Array.isArray(parsedResponse.suggestions)) {
        return { suggestions: parsedResponse.suggestions };
      } else {
        return { suggestions: [] };
      }
    } catch (parseError) {
      // If parsing fails, try to extract suggestions from the text
      const suggestionMatches = content.match(/"([^"]*)"/g);
      if (suggestionMatches && suggestionMatches.length > 0) {
        return { 
          suggestions: suggestionMatches
            .map(match => match.replace(/"/g, ''))
            .filter(s => s.length > 0)
        };
      }
      return { suggestions: [] };
    }
  } catch (error) {
    console.error("Error enhancing prompt:", error);
    throw new Error("Failed to enhance prompt with AI");
  }
}
