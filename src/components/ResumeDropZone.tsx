
"use client";

import { useState, useCallback, useEffect } from "react";
import { Upload, FileText, Loader2, Sparkles, Image as ImageIcon, ClipboardPaste, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

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
      toast({ 
        title: "Fast-Paste Detected", 
        description: `Extracting data from ${files.length} clipboard file(s)...` 
      });
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
    
    // Check for Gmail attachment links
    const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    const isGmailLink = url && (url.includes('mail.google.com') || url.includes('googleusercontent.com'));
    
    if (isGmailLink && e.dataTransfer.files.length === 0) {
      toast({
        variant: "destructive",
        title: "Gmail Drag Restriction",
        description: "Google prevents direct dragging. Instead, Copy (Ctrl+C) the attachment in Gmail and Paste (Ctrl+V) here instantly!",
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
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
        <div className="flex items-center gap-2 text-xs font-headline font-bold text-primary uppercase tracking-tighter">
          <Sparkles className="w-4 h-4" />
          Quick Workflow:
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Badge variant="outline" className="bg-background/80 flex items-center gap-1.5 py-1">
            <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px]">Ctrl+C</kbd>
            <span className="text-[10px]">Attachment in Gmail</span>
          </Badge>
          <Badge variant="outline" className="bg-background/80 flex items-center gap-1.5 py-1">
            <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px]">Ctrl+V</kbd>
            <span className="text-[10px]">Anywhere on this page</span>
          </Badge>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Button 
          variant={isPasteMode ? "outline" : "default"} 
          onClick={() => setIsPasteMode(false)}
          className="rounded-full px-8 gap-2"
        >
          <Upload className="w-4 h-4" />
          Drop/Upload Files
        </Button>
        <Button 
          variant={isPasteMode ? "default" : "outline"} 
          onClick={() => setIsPasteMode(true)}
          className="rounded-full px-8 gap-2"
        >
          <ClipboardPaste className="w-4 h-4" />
          Paste Text
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
          <input 
            type="file" 
            multiple 
            accept=".pdf,.txt,.png,.jpg,.jpeg,.webp" 
            className="hidden" 
            onChange={(e) => onFilesDropped(Array.from(e.target.files || []).filter(isValidFile))} 
            disabled={isProcessing} 
          />
          
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className={cn(
              "w-24 h-24 rounded-3xl flex items-center justify-center transition-all shadow-2xl",
              isDragging ? "bg-primary text-white rotate-6" : "bg-card border border-border group-hover:bg-primary/10 text-muted-foreground group-hover:text-primary"
            )}>
              {isProcessing ? (
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              ) : isDragging ? (
                <MousePointer2 className="w-12 h-12" />
              ) : (
                <div className="relative">
                   <Upload className="w-12 h-12" />
                   <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full animate-bounce">
                     Fast
                   </div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-headline font-bold tracking-tight">
                {isProcessing ? "Analyzing Resume..." : isDragging ? "Release to Extract" : "Drop or Ctrl+V Anywhere"}
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Drag files here or just <span className="text-primary font-bold italic">Paste (Ctrl+V)</span> directly from Gmail to skip the download step.
              </p>
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50 pointer-events-none" />
        </label>
      ) : (
        <div className="bg-card/20 border-2 border-border rounded-3xl p-8 flex flex-col gap-4 min-h-[300px] animate-in slide-in-from-right-4 duration-300">
          <h3 className="text-xl font-headline font-bold flex items-center gap-2">
            <ClipboardPaste className="w-5 h-5 text-primary" />
            Direct Content Extraction
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Copy the text body from an email or a website and paste it here for instant analysis.
          </p>
          <Textarea 
            placeholder="Paste raw resume content here..." 
            className="flex-1 min-h-[180px] bg-background/50 border-border focus:ring-primary text-sm resize-none"
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
          />
          <Button 
            className="w-full h-14 text-lg font-headline font-bold rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" 
            disabled={!pastedText.trim() || isProcessing}
            onClick={handleProcessText}
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-5 w-5" />
            )}
            Extract Candidate Intel
          </Button>
        </div>
      )}
    </div>
  );
}
