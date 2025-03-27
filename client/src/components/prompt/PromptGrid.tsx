import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PromptCard from "./PromptCard";
import { PromptWithDetails } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { usePrompt } from "@/contexts/PromptContext";

interface PromptGridProps {
  queryKey: string | Array<string>;
  emptyMessage?: string;
  onEditPrompt?: (prompt: PromptWithDetails) => void;
}

export default function PromptGrid({ 
  queryKey, 
  emptyMessage = "No prompts found",
  onEditPrompt
}: PromptGridProps) {
  const [visibleCount, setVisibleCount] = useState(6);
  const { data: prompts = [], isLoading } = useQuery<PromptWithDetails[]>({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
  });
  
  const { setSelectedPrompt, setModalOpen } = usePrompt();
  
  const handleEditPrompt = (prompt: PromptWithDetails) => {
    if (onEditPrompt) {
      onEditPrompt(prompt);
    } else {
      setSelectedPrompt(prompt);
      setModalOpen(true);
    }
  };
  
  const loadMore = () => {
    setVisibleCount(prev => prev + 6);
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="bg-white rounded-xl shadow-card border border-accent h-48 animate-pulse"
          ></div>
        ))}
      </div>
    );
  }
  
  if (!prompts.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }
  
  const visiblePrompts = prompts.slice(0, visibleCount);
  const hasMore = visibleCount < prompts.length;
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {visiblePrompts.map(prompt => (
          <PromptCard 
            key={prompt.id} 
            prompt={prompt} 
            onEdit={handleEditPrompt}
          />
        ))}
      </div>
      
      {hasMore && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={loadMore}
            className="px-5 py-2.5 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
          >
            Load More
          </Button>
        </div>
      )}
    </>
  );
}
