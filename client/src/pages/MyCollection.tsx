import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import PromptGrid from "@/components/prompt/PromptGrid";
import CreatePromptModal from "@/components/prompt/CreatePromptModal";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export default function MyCollection() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>My Prompt Collection</CardTitle>
              <CardDescription>
                Manage and organize your collection of AI prompts
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Tabs defaultValue="all" className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Prompts</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="private">Private</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              <PromptGrid 
                queryKey="/api/prompts" 
                emptyMessage="You haven't created any prompts yet." 
              />
            </TabsContent>
            <TabsContent value="favorites" className="mt-6">
              <PromptGrid 
                queryKey="/api/prompts/favorites" 
                emptyMessage="You don't have any favorite prompts yet." 
              />
            </TabsContent>
            <TabsContent value="private" className="mt-6">
              <PromptGrid 
                queryKey="/api/prompts/private" 
                emptyMessage="You don't have any private prompts." 
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      {/* Create/Edit Prompt Modal */}
      <CreatePromptModal />
    </div>
  );
}
