"use client";

import { useState } from "react";
import { ExtractionConfigBar, type ExtractionConfig } from "@/components/ExtractionConfigBar";
import { ContactAggregator } from "@/components/ContactAggregator";
import { ResumeDropZone } from "@/components/ResumeDropZone";
import { CandidateTable } from "@/components/CandidateTable";
import { extractResumeDetails, type ExtractResumeDetailsOutput } from "@/ai/flows/extract-resume-details-flow";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

export default function FlowExtract() {
  const { toast } = useToast();
  const [config, setConfig] = useState<ExtractionConfig>({
    email: true,
    phone: true,
    skills: true,
    experience: true,
    companies: true,
    college: true,
    suggestedProfiles: true,
  });
  
  const [candidates, setCandidates] = useState<ExtractResumeDetailsOutput[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfigChange = (key: keyof ExtractionConfig, value: boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setIsProcessing(true);
    
    try {
      const results: ExtractResumeDetailsOutput[] = [];
      for (const file of files) {
        const fileDataUri = await readFileAsDataUri(file);
        const extraction = await extractResumeDetails({
          fileDataUri,
          extractConfig: config,
        });
        if (extraction) results.push(extraction);
      }
      if (results.length > 0) {
        setCandidates((prev) => [...results, ...prev]);
        toast({ title: "Batch Processed", description: `Extracted ${results.length} candidate(s).` });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const processText = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    try {
      const extraction = await extractResumeDetails({
        text,
        extractConfig: config,
      });
      if (extraction) {
        setCandidates((prev) => [extraction, ...prev]);
        toast({ title: "Text Processed", description: "Successfully extracted profile from pasted text." });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Extraction Failed", description: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const readFileAsDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
      reader.readAsDataURL(file);
    });
  };

  const aggregatedEmails = candidates.map((c) => c.email).filter((e): e is string => !!e);
  const aggregatedPhones = candidates.map((c) => c.phone).filter((p): p is string => !!p);

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground font-body overflow-x-hidden pb-20">
      <ExtractionConfigBar config={config} onChange={handleConfigChange} />
      
      <div className="flex-1 flex flex-col">
        <div className="py-12 px-6 max-w-7xl mx-auto w-full text-center">
          <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4 tracking-tight">
            Seamless Data <span className="text-primary">Extraction</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Drop files, paste files, or just paste text. Our AI handles the rest in one click.
          </p>
        </div>

        <ContactAggregator emails={aggregatedEmails} phones={aggregatedPhones} />
        
        <ResumeDropZone onFilesDropped={processFiles} onTextPasted={processText} isProcessing={isProcessing} />
        
        <CandidateTable candidates={candidates} config={config} isProcessing={isProcessing} />
      </div>

      <footer className="py-8 border-t border-border/50 text-center text-xs text-muted-foreground font-headline tracking-widest uppercase mt-auto">
        FlowExtract &copy; {new Date().getFullYear()} — Optimized Workflow
      </footer>

      <Toaster />
    </main>
  );
}
