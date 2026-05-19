"use client";

import { useState, useCallback, useEffect } from "react";
import { Upload, FileText, Loader2, Sparkles, Image as ImageIcon, ClipboardPaste } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ResumeDropZoneProps {
  onFilesDropped: (files: File[]) => void;
  onTextPasted: (text: string) => void;
  isProcessing: boolean;
}

export function ResumeDropZone({ onFilesDropped, onTextPasted, isProcessing }: ResumeDropZoneProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isPasteMode, setIsPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState("");

  const isValidFile = (file: File) => {
    const extension = file.name?.split('.').pop()?.toLowerCase() || '';
    const validExtensions = ['txt', 'pdf', 'png', 'jpg', 'jpeg', 'webp'];
    return validExtensions.includes(extension) || file.type.startsWith('image/') || file.type === 'application/pdf' || file.type === 'text/plain';
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (isProcessing) return;
    
    const items = e.clipboardData?.items;
    if (!items) return;

    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file && isValidFile(file)) {
          files.push(file);
        }
      }
    }

    if (files.length > 0) {
      toast({ title: "Pasted Files Detected", description: `Processing ${files.length} pasted file(s)...` });
      onFilesDropped(files);
    }
  }, [onFilesDropped, isProcessing, toast]);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (url && url.includes('mail-attachment.googleusercontent.com') && e.dataTransfer.files.length === 0) {
      toast({
        variant: "destructive",
        title: "Protected Link",
        description: "Gmail protects attachments. Please use 'Ctrl+C' on the file and 'Ctrl+V' here, or download it first.",
      });
      return;
    }

    const droppedFiles: File[] = [];
    if (e.dataTransfer.items) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        if (e.dataTransfer.items[i].kind === 'file') {
          const file = e.dataTransfer.items[i].getAsFile();
          if (file && isValidFile(file)) droppedFiles.push(file);
        }
      }
    } else {
      const files = Array.from(e.dataTransfer.files).filter(isValidFile);
      droppedFiles.push(...files);
    }

    if (droppedFiles.length > 0) {
      onFilesDropped(droppedFiles);
    }
  }, [onFilesDropped, toast]);

  const handleProcessText = () => {
    if (!pastedText.trim()) return;
    onTextPasted(pastedText);
    setPastedText("");
    setIsPasteMode(false);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-6 mb-12 flex flex-col gap-4">
      <div className="flex justify-center gap-4">
        <Button 
          variant={isPasteMode ? "outline" : "default"} 
          onClick={() => setIsPasteMode(false)}
          className="rounded-full px-8"
        >
          Upload/Drop Files
        </Button>
        <Button 
          variant={isPasteMode ? "default" : "outline"} 
          onClick={() => setIsPasteMode(true)}
          className="rounded-full px-8"
        >
          Paste Resume Text
        </Button>
      </div>

      {!isPasteMode ? (
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative group overflow-hidden border-2 border-dashed rounded-3xl p-12 transition-all duration-500 ease-out flex flex-col items-center justify-center text-center cursor-pointer min-h-[300px]",
            isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border bg-card/10 hover:border-primary/50",
            isProcessing && "pointer-events-none opacity-80"
          )}
        >
          <input type="file" multiple accept=".pdf,.txt,.png,.jpg,.jpeg,.webp" className="hidden" onChange={(e) => onFilesDropped(Array.from(e.target.files || []).filter(isValidFile))} disabled={isProcessing} />
          
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className={cn(
              "w-20 h-20 rounded-2xl flex items-center justify-center transition-all",
              isDragging ? "bg-primary text-white" : "bg-muted group-hover:bg-primary/20 text-muted-foreground group-hover:text-primary"
            )}>
              {isProcessing ? <Loader2 className="w-10 h-10 animate-spin" /> : isDragging ? <Sparkles className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-headline font-bold">
                {isProcessing ? "Processing..." : isDragging ? "Release Files" : "Drop or Paste Files (Ctrl+V)"}
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Drag resumes here, or simply **Paste (Ctrl+V)** after copying a file from your folder.
              </p>
            </div>
          </div>
        </label>
      ) : (
        <div className="bg-card/20 border-2 border-border rounded-3xl p-8 flex flex-col gap-4 min-h-[300px]">
          <h3 className="text-xl font-headline font-bold flex items-center gap-2">
            <ClipboardPaste className="w-5 h-5 text-primary" />
            Quick Paste Text
          </h3>
          <p className="text-sm text-muted-foreground">
            Copy text directly from a resume in Gmail/Browser and paste it below.
          </p>
          <Textarea 
            placeholder="Paste resume content here..." 
            className="flex-1 min-h-[150px] bg-background/50 border-border focus:ring-primary"
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
          />
          <Button 
            className="w-full h-12 text-lg font-headline font-bold" 
            disabled={!pastedText.trim() || isProcessing}
            onClick={handleProcessText}
          >
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Extract Intelligence
          </Button>
        </div>
      )}
    </div>
  );
}
