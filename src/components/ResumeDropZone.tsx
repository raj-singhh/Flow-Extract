"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumeDropZoneProps {
  onFilesDropped: (files: File[]) => void;
  isProcessing: boolean;
}

export function ResumeDropZone({ onFilesDropped, isProcessing }: ResumeDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

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
    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "text/plain" || file.name.endsWith(".txt") || file.type === "application/pdf"
    );
    if (files.length > 0) {
      onFilesDropped(files);
    }
  }, [onFilesDropped]);

  return (
    <div className="max-w-7xl mx-auto w-full px-6 mb-12">
      <div
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
        {/* Decorative Background Elements */}
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
              Drag and drop multiple text or PDF resumes to instantly parse contact info and skills with AI.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-background border rounded-lg text-xs font-medium text-muted-foreground group-hover:border-primary/30 transition-all">
              <FileText className="w-3.5 h-3.5" />
              <span>PDF Supported</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-background border rounded-lg text-xs font-medium text-muted-foreground group-hover:border-primary/30 transition-all">
              <FileText className="w-3.5 h-3.5" />
              <span>TEXT Supported</span>
            </div>
          </div>
        </div>

        {/* Pulsing Border Effect for Drag State */}
        {isDragging && (
          <div className="absolute inset-0 border-4 border-primary/20 rounded-3xl animate-pulse" />
        )}
      </div>
    </div>
  );
}
