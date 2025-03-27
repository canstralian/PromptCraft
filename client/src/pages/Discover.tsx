import { useState } from "react";
import { 
  Sparkles, 
  Image, 
  SlidersHorizontal, 
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import PromptGrid from "@/components/prompt/PromptGrid";
import CreatePromptModal from "@/components/prompt/CreatePromptModal";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { usePrompt } from "@/contexts/PromptContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Discover() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { setModalOpen } = usePrompt();
  
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['/api/categories'],
  });
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  let queryKey = '/api/prompts';
  if (selectedCategory !== 'all') {
    queryKey = `/api/categories/${selectedCategory}/prompts`;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - hidden on mobile unless toggled */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block fixed inset-0 z-40 md:relative md:z-0`}>
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNav onMobileMenuToggle={toggleMobileMenu} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#F9F9FC]">
          {/* Hero Section */}
          <div className="bg-white rounded-xl shadow-soft mb-6 overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">Discover AI Prompts</h1>
                  <p className="text-gray-600 mb-4">Find, create, and organize effective prompts for your AI workflows</p>
                  <div className="flex space-x-3">
                    <Button 
                      onClick={() => setModalOpen(true)}
                      className="px-4 py-2 bg-[#4A90E2] hover:bg-[#4A90E2]/80 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate with Gemini
                    </Button>
                    <Button 
                      variant="outline"
                      className="px-4 py-2 border border-accent hover:bg-accent rounded-lg transition-colors text-sm font-medium"
                    >
                      Browse Collection
                    </Button>
                  </div>
                </div>
                <div className="hidden md:block ml-4">
                  <Image className="h-32 w-64 rounded-lg text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5">
            <div className="flex space-x-1 overflow-x-auto scrollbar-hide mb-3 sm:mb-0">
              <button 
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'all' 
                  ? 'text-[#F5A623] border-b-2 border-[#F5A623]' 
                  : 'text-gray-500 hover:text-text border-b-2 border-transparent hover:border-gray-300'}`}
                onClick={() => setActiveTab('all')}
              >
                All Prompts
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'popular' 
                  ? 'text-[#4A90E2] border-b-2 border-[#4A90E2]' 
                  : 'text-gray-500 hover:text-text border-b-2 border-transparent hover:border-gray-300'}`}
                onClick={() => setActiveTab('popular')}
              >
                Popular
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'recent' 
                  ? 'text-[#50E3C2] border-b-2 border-[#50E3C2]' 
                  : 'text-gray-500 hover:text-text border-b-2 border-transparent hover:border-gray-300'}`}
                onClick={() => setActiveTab('recent')}
              >
                Recent
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'my-prompts' 
                  ? 'text-[#9013FE] border-b-2 border-[#9013FE]' 
                  : 'text-gray-500 hover:text-text border-b-2 border-transparent hover:border-gray-300'}`}
                onClick={() => setActiveTab('my-prompts')}
              >
                My Prompts
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px] text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" className="p-1.5 border border-accent bg-white hover:bg-accent rounded-lg">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Prompt Cards Grid */}
          <PromptGrid queryKey={queryKey} />
        </main>
      </div>
      
      {/* Floating Action Button for Mobile */}
      <div className="md:hidden fixed right-6 bottom-6">
        <Button 
          onClick={() => setModalOpen(true)}
          className="w-14 h-14 rounded-full bg-[#50E3C2] hover:bg-[#47CCB0] text-white flex items-center justify-center shadow-lg transition-colors"
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      </div>
      
      {/* Prompt Create/Edit Modal */}
      <CreatePromptModal />
    </div>
  );
}
