import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopNav from "@/components/layout/TopNav";
import PromptEditor from "@/components/prompt/PromptEditor";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function CreatePrompt() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSave = () => {
    toast({
      title: "Prompt created",
      description: "Your prompt has been created successfully",
    });
    setLocation("/");
  };

  const handleCancel = () => {
    setLocation("/");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - hidden on mobile unless toggled */}
      <div
        className={`${isMobileMenuOpen ? "block" : "hidden"} md:block fixed inset-0 z-40 md:relative md:z-0`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNav onMobileMenuToggle={toggleMobileMenu} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#F9F9FC]">
          <div className="bg-white rounded-xl shadow-soft p-6 md:p-8 mb-6">
            <h1 className="text-2xl font-bold mb-6">Create New Prompt</h1>

            <PromptEditor onSave={handleSave} onCancel={handleCancel} />
          </div>
        </main>
      </div>
    </div>
  );
}
