import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Lightbulb, Bold, Italic, List, BracesIcon, SpellCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { AiEnhancementResponse } from "@shared/schema";

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  content: z.string().min(10, { message: "Content must be at least 10 characters" }),
  categoryId: z.number(),
  userId: z.number().default(1), // Default user ID
  isPublic: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PromptEditorProps {
  promptId?: number;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function PromptEditor({ promptId, onSave, onCancel }: PromptEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  
  // Fetch categories for the dropdown
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });
  
  // Fetch prompt data if editing existing prompt
  const { data: promptData, isLoading: promptLoading } = useQuery<any>({
    queryKey: ['/api/prompts', promptId],
    enabled: !!promptId,
  });
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: 1, // Default to first category
      isPublic: true,
      tags: [],
    },
  });
  
  // Update form when promptData changes (editing mode)
  useEffect(() => {
    if (promptData) {
      form.reset({
        title: promptData.title || "",
        content: promptData.content || "",
        categoryId: promptData.categoryId || 1,
        userId: promptData.userId || 1,
        isPublic: typeof promptData.isPublic === 'boolean' ? promptData.isPublic : true,
      });
      
      // Set tags
      if (promptData.tags && Array.isArray(promptData.tags)) {
        const tagNames = promptData.tags.map((tag: any) => tag.name);
        setTags(tagNames);
      }
    }
  }, [promptData, form]);
  
  // Create/update prompt mutation
  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const apiUrl = promptId ? `/api/prompts/${promptId}` : '/api/prompts';
      const method = promptId ? 'PUT' : 'POST';
      
      // Include tags in the request
      const data = {
        ...values,
        tags: tags,
      };
      
      const response = await apiRequest(method, apiUrl, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prompts'] });
      toast({
        title: promptId ? "Prompt updated" : "Prompt created",
        description: promptId ? "Your prompt has been updated successfully" : "Your prompt has been created successfully",
      });
      if (onSave) onSave();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${promptId ? "update" : "create"} prompt: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // AI enhancement mutation
  const enhanceMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest('POST', '/api/ai/enhance', { prompt });
      return response.json() as Promise<AiEnhancementResponse>;
    },
    onSuccess: (data) => {
      setAiSuggestions(data.suggestions || []);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to get AI enhancements: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: FormValues) => {
    createMutation.mutate(values);
  };
  
  // Handle tag input
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Request AI suggestions
  const getAiSuggestions = () => {
    const currentPrompt = form.getValues('content');
    if (currentPrompt.trim().length > 10) {
      enhanceMutation.mutate(currentPrompt);
    } else {
      toast({
        title: "Prompt too short",
        description: "Please enter a longer prompt to get AI suggestions",
      });
    }
  };
  
  // Add AI suggestion to content
  const addSuggestion = (suggestion: string) => {
    const currentContent = form.getValues('content');
    form.setValue('content', currentContent + '\n' + suggestion);
  };
  
  if (promptLoading) {
    return <div className="p-8 flex justify-center">Loading prompt data...</div>;
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Prompt Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter a descriptive title"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Category Selector */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Prompt Content */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt Content</FormLabel>
              <div className="border border-accent rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
                <div className="bg-[#F9F9FC] border-b border-accent px-3 py-1.5 flex items-center space-x-1.5">
                  <Button type="button" variant="ghost" size="sm" className="p-1.5 hover:bg-accent rounded text-gray-700">
                    <Bold className="h-3 w-3" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="p-1.5 hover:bg-accent rounded text-gray-700">
                    <Italic className="h-3 w-3" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="p-1.5 hover:bg-accent rounded text-gray-700">
                    <List className="h-3 w-3" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="p-1.5 hover:bg-accent rounded text-gray-700">
                    <BracesIcon className="h-3 w-3" />
                  </Button>
                  <span className="h-4 w-px bg-gray-300 mx-1"></span>
                  <Button type="button" variant="ghost" size="sm" className="p-1.5 hover:bg-accent rounded text-gray-700">
                    <SpellCheck className="h-3 w-3" />
                  </Button>
                </div>
                <FormControl>
                  <Textarea
                    className="w-full px-3 py-2 border-0 focus:outline-none"
                    placeholder="Write your prompt here. Use [placeholders] for variables that users can customize."
                    rows={5}
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage />
              
              {/* AI Suggestions */}
              <Card className="mt-2 p-3 bg-accent rounded-lg">
                <h4 className="text-sm font-medium flex items-center mb-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500 mr-2" />
                  Gemini AI Suggestions
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-primary hover:text-primary-light"
                    onClick={getAiSuggestions}
                    disabled={enhanceMutation.isPending}
                  >
                    {enhanceMutation.isPending ? "Analyzing..." : "Get Suggestions"}
                  </Button>
                </h4>
                
                {aiSuggestions.length > 0 ? (
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, i) => (
                      <div key={i} className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-200 flex items-center justify-between">
                        <p>{suggestion}</p>
                        <Button 
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addSuggestion(suggestion)}
                          className="text-primary hover:text-primary-light"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    {enhanceMutation.isPending 
                      ? "Analyzing your prompt..."
                      : "Click 'Get Suggestions' to receive AI-powered enhancements for your prompt."}
                  </p>
                )}
              </Card>
            </FormItem>
          )}
        />
        
        {/* Tags */}
        <div>
          <FormLabel htmlFor="promptTags">Tags</FormLabel>
          <div className="flex flex-wrap gap-2 p-2 border border-accent rounded-lg min-h-[42px]">
            {tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="tag"
                className="inline-flex items-center px-2 py-1 rounded-md text-xs text-gray-700"
              >
                {tag}
                <button 
                  type="button"
                  className="ml-1 text-gray-500 hover:text-gray-700"
                  onClick={() => removeTag(tag)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Input
              id="promptTags"
              type="text"
              className="flex-1 min-w-[80px] outline-none text-sm border-none"
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
            />
          </div>
          <FormDescription>
            Press Enter to add a tag
          </FormDescription>
        </div>
        
        {/* Visibility */}
        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <div className="space-y-0.5">
                <FormLabel>Visibility</FormLabel>
                <FormDescription>
                  {field.value ? "Everyone can see this prompt" : "Only you can see this prompt"}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        {/* Submit Buttons */}
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Saving..." : promptId ? "Update Prompt" : "Create Prompt"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
