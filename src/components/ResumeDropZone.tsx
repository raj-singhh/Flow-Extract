"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ResumeDropZoneProps {
  onFilesDropped: (files: File[]) => void;
  isProcessing: boolean;
}

export function ResumeDropZone({ onFilesDropped, isProcessing }: ResumeDropZoneProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const isValidFile = (file: File) => {
    const extension = file.name?.split('.').pop()?.toLowerCase() || '';
    const validExtensions = ['txt', 'pdf', 'png', 'jpg', 'jpeg', 'webp'];
    const validMimeTypes = [
      "text/plain",
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/octet-stream"
    ];
    return validExtensions.includes(extension) || validMimeTypes.includes(file.type);
  };

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
    
    // Check if the user dropped a URL (like a Gmail attachment chip) instead of a file
    const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    if (url && url.includes('mail-attachment.googleusercontent.com') && e.dataTransfer.files.length === 0) {
      toast({
        variant: "destructive",
        title: "Attachment Link Detected",
        description: "Please download the attachment to your computer first, then drag the file here.",
      });
      return;
    }

    const droppedFiles: File[] = [];
    
    // More robust file extraction from items
    if (e.dataTransfer.items) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        if (e.dataTransfer.items[i].kind === 'file') {
          const file = e.dataTransfer.items[i].getAsFile();
          if (file && isValidFile(file)) {
            droppedFiles.push(file);
          }
        }
      }
    } else {
      // Fallback
      const files = Array.from(e.dataTransfer.files).filter(isValidFile);
      droppedFiles.push(...files);
    }

    if (droppedFiles.length > 0) {
      onFilesDropped(droppedFiles);
    } else if (e.dataTransfer.files.length > 0 || e.dataTransfer.items.length > 0) {
      toast({
        variant: "destructive",
        title: "Unsupported File",
        description: "Please drop PDF, Image, or Text resumes only.",
      });
    }
  }, [onFilesDropped, toast]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(isValidFile);
    
    if (files.length > 0) {
      onFilesDropped(files);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-6 mb-12">
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative group overflow-hidden border-2 border-dashed rounded-3xl p-12 transition-all duration-500 ease-out flex flex-col items-center justify-center text-center cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01] shadow-2xl shadow-primary/10"
            : "border-border bg-card/10 hover:border-primary/50 hover:bg-primary/[0.02]",
          isProcessing && "pointer-events-none opacity-80"
        )}
      >
        <input 
          type="file" 
          multiple 
          accept=".pdf,.txt,.png,.jpg,.jpeg,.webp" 
          className="hidden" 
          onChange={handleFileInput}
          disabled={isProcessing}
        />
        
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className={cn(
            "w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500",
            isDragging ? "bg-primary scale-110 rotate-6" : "bg-muted group-hover:bg-primary/20",
            isProcessing && "animate-pulse"
          )}>
            {isProcessing ? (
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            ) : isDragging ? (
              <Sparkles className="w-10 h-10 text-white" />
            ) : (
              <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-headline font-bold">
              {isProcessing ? "Extracting Intelligence..." : isDragging ? "Release to Extract" : "Drop Resumes Here"}
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Drag and drop multiple PDF, Images, or Text resumes, or click to browse.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-background border rounded-lg text-xs font-medium text-muted-foreground group-hover:border-primary/30 transition-all">
              <FileText className="w-3.5 h-3.5" />
              <span>PDF / TXT</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-background border rounded-lg text-xs font-medium text-muted-foreground group-hover:border-primary/30 transition-all">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Images (JPG/PNG)</span>
            </div>
          </div>
        </div>

        {isDragging && (
          <div className="absolute inset-0 border-4 border-primary/20 rounded-3xl animate-pulse" />
        )}
      </label>
    </div>
  );
}