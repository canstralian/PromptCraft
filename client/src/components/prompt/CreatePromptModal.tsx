import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PromptEditor from "./PromptEditor";
import { usePrompt } from "@/contexts/PromptContext";

export default function CreatePromptModal() {
  const { isModalOpen, setModalOpen, selectedPrompt, setSelectedPrompt } = usePrompt();

  const handleClose = () => {
    setModalOpen(false);
    setSelectedPrompt(null);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {selectedPrompt ? "Edit Prompt" : "Create New Prompt"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1 p-1">
          <PromptEditor 
            promptId={selectedPrompt?.id} 
            onSave={handleClose}
            onCancel={handleClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
