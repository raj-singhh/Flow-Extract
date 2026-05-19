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
    totalExperience: true,
  });
  
  const [candidates, setCandidates] = useState<ExtractResumeDetailsOutput[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfigChange = (key: keyof ExtractionConfig, value: boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setCandidates([]);
    toast({ title: "Workspace Reset", description: "All extracted data has been cleared." });
  };

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setIsProcessing(true);
    
    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
      try {
        const fileDataUri = await readFileAsDataUri(file);
        
        // Add a 1.2s delay between items to respect rate limits during batch
        if (successCount > 0 || failCount > 0) {
          await new Promise(resolve => setTimeout(resolve, 1200));
        }

        const extraction = await extractResumeDetails({
          fileDataUri,
          extractConfig: config,
        });

        if (extraction) {
          setCandidates((prev) => [extraction, ...prev]);
          successCount++;
        }
      } catch (error: any) {
        console.error(`Failed to process ${file.name}:`, error);
        failCount++;
      }
    }

    if (successCount > 0) {
      toast({ 
        title: "Batch Complete", 
        description: `Extracted ${successCount} profile(s).${failCount > 0 ? ` ${failCount} failed due to demand.` : ''}` 
      });
    } else if (failCount > 0) {
      toast({ 
        variant: "destructive", 
        title: "Service Overloaded", 
        description: "The AI service is experiencing high demand. Please try a smaller batch." 
      });
    }
    
    setIsProcessing(false);
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
        toast({ title: "Extraction Complete", description: "Profile parsed successfully." });
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
      <ExtractionConfigBar config={config} onChange={handleConfigChange} onReset={handleReset} />
      
      <div className="flex-1 flex flex-col">
        <div className="py-12 px-6 max-w-7xl mx-auto w-full text-center">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
            AI-Powered Intelligence Dashboard
          </div>
          <h2 className="text-4xl md:text-6xl font-headline font-bold mb-6 tracking-tight leading-none">
            Scale Your <span className="text-primary italic">Recruitment</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Drag files from folders or paste attachments from email. Multi-modal AI handles 15+ resumes with high precision.
          </p>
        </div>

        <ContactAggregator emails={aggregatedEmails} phones={aggregatedPhones} />
        
        <ResumeDropZone onFilesDropped={processFiles} onTextPasted={processText} isProcessing={isProcessing} />
        
        <CandidateTable candidates={candidates} config={config} isProcessing={isProcessing} />
      </div>

      <footer className="py-8 border-t border-border/50 text-center text-[10px] text-muted-foreground font-headline tracking-[0.2em] uppercase mt-auto">
        FlowExtract Engine &bull; {new Date().getFullYear()}
      </footer>

      <Toaster />
    </main>
  );
}
