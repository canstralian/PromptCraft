import { Menu, Bell, Search, User, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePrompt } from "@/contexts/PromptContext";

interface TopNavProps {
  onMobileMenuToggle: () => void;
}

export default function TopNav({ onMobileMenuToggle }: TopNavProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { setModalOpen } = usePrompt();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="bg-white border-b border-accent p-4 flex items-center justify-between">
      {/* Mobile Menu Button */}
      <button
        onClick={onMobileMenuToggle}
        className="md:hidden text-text p-2 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl mx-4">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-accent rounded-lg bg-accent focus:bg-white"
              placeholder="Search for prompts, categories, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-text hover:bg-accent rounded-lg"
        >
          <Bell className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-text hover:bg-accent rounded-lg md:hidden"
        >
          <User className="h-5 w-5" />
        </Button>
        <Button
          onClick={() => setModalOpen(true)}
          className="hidden md:flex items-center justify-center px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>New Prompt</span>
        </Button>
      </div>
    </header>
  );
}
