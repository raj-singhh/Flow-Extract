
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
        toast({ title: "Batch Processed", description: `Successfully extracted ${results.length} candidate(s).` });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Extraction Failed", description: error.message });
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
        toast({ title: "Intelligence Extracted", description: "Profile successfully parsed from pasted content." });
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
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
            New: Gmail Paste Workflow Enabled
          </div>
          <h2 className="text-4xl md:text-6xl font-headline font-bold mb-6 tracking-tight leading-none">
            Smart Resume <span className="text-primary italic">Intelligence</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Drag files, paste text, or use <span className="text-foreground font-semibold">Ctrl+V</span> directly from Gmail attachments. No manual downloads needed.
          </p>
        </div>

        <ContactAggregator emails={aggregatedEmails} phones={aggregatedPhones} />
        
        <ResumeDropZone onFilesDropped={processFiles} onTextPasted={processText} isProcessing={isProcessing} />
        
        <CandidateTable candidates={candidates} config={config} isProcessing={isProcessing} />
      </div>

      <footer className="py-8 border-t border-border/50 text-center text-[10px] text-muted-foreground font-headline tracking-[0.2em] uppercase mt-auto">
        FlowExtract Intelligence &bull; Powered by Multi-Modal AI &bull; {new Date().getFullYear()}
      </footer>

      <Toaster />
    </main>
  );
}
