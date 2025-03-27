import { useState } from "react";
import { Heart, Pencil, Copy, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PromptWithDetails } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PromptCardProps {
  prompt: PromptWithDetails;
  onEdit?: (prompt: PromptWithDetails) => void;
}

export default function PromptCard({ prompt, onEdit }: PromptCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();
  
  const getCategoryVariant = (categoryName: string): "creative" | "business" | "programming" | "education" | "health" => {
    switch (categoryName.toLowerCase()) {
      case "creative writing": return "creative";
      case "business": return "business";
      case "programming": return "programming";
      case "education": return "education";
      case "health": return "health";
      default: return "creative";
    }
  };
  
  const getCategoryIcon = (categoryName: string): string => {
    switch (categoryName.toLowerCase()) {
      case "creative writing": return "palette";
      case "business": return "chart-simple";
      case "programming": return "code";
      case "education": return "lightbulb";
      case "health": return "heart";
      default: return "sparkles";
    }
  };
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // In a real app, would save to user's favorites
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      toast({
        title: "Copied to clipboard",
        description: "Prompt content copied to clipboard",
      });
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };
  
  const handleEdit = () => {
    if (onEdit) {
      onEdit(prompt);
    }
  };
  
  const getUserInitials = (username: string): string => {
    return username.split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <div className="bg-white rounded-xl shadow-card border border-accent overflow-hidden flex flex-col h-full hover:border-gray-300 transition-all">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <Badge 
            variant={getCategoryVariant(prompt.category.name)}
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
          >
            <i className={`fas fa-${getCategoryIcon(prompt.category.name)} mr-1 text-xs`}></i>
            {prompt.category.name}
          </Badge>
          <button 
            onClick={toggleFavorite}
            className={cn(
              "p-1",
              isFavorite ? "text-[#D0021B] hover:text-[#B30018]" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </button>
        </div>
        
        <h3 className="font-semibold text-lg mb-2">{prompt.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{prompt.content}</p>
        
        <div className="flex flex-wrap gap-1.5 mb-4">
          {prompt.tags.map(tag => (
            <Badge 
              key={tag.id} 
              variant="tag"
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
            >
              #{tag.name}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className="mt-auto border-t border-accent p-3 flex justify-between items-center bg-[#FAFAFA]">
        <div className="flex items-center">
          <div className="w-5 h-5 rounded-full bg-[#9013FE] flex items-center justify-center text-white text-xs">
            {getUserInitials(prompt.user.username)}
          </div>
          <span className="text-xs text-gray-500 ml-1.5">{prompt.user.username}</span>
        </div>
        
        <div className="flex space-x-1.5">
          <button 
            className="p-1.5 hover:bg-accent rounded" 
            title="Edit"
            onClick={handleEdit}
          >
            <Pencil className="h-3 w-3 text-gray-500" />
          </button>
          <button 
            className="p-1.5 hover:bg-accent rounded" 
            title="Copy"
            onClick={copyToClipboard}
          >
            <Copy className="h-3 w-3 text-gray-500" />
          </button>
          <button className="p-1.5 hover:bg-accent rounded" title="More">
            <MoreVertical className="h-3 w-3 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
