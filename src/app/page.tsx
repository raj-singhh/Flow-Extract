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
    const results: ExtractResumeDetailsOutput[] = [];

    try {
      for (const file of files) {
        // Read file as Data URI
        const fileDataUri = await readFileAsDataUri(file);
        
        // Execute GenAI Flow
        const extraction = await extractResumeDetails({
          fileDataUri,
          extractConfig: config,
        });
        
        if (extraction && (extraction.email || extraction.phone || extraction.skills || extraction.experience)) {
          results.push(extraction);
        } else {
          toast({
            variant: "destructive",
            title: "Partial Extraction",
            description: `Could not identify candidate data in ${file.name}.`,
          });
        }
      }
      
      if (results.length > 0) {
        setCandidates((prev) => [...results, ...prev]);
        toast({
          title: "Extraction Successful",
          description: `Processed ${results.length} candidate(s).`,
        });
      }
    } catch (error: any) {
      console.error("Extraction error:", error);
      toast({
        variant: "destructive",
        title: "Extraction Failed",
        description: error.message || "An error occurred while parsing the resumes.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const readFileAsDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        resolve(reader.result as string);
      };
      
      reader.onerror = () => {
        reject(new Error(`Failed to read file: ${file.name}`));
      };
      
      reader.readAsDataURL(file);
    });
  };

  const aggregatedEmails = candidates
    .map((c) => c.email)
    .filter((e): e is string => !!e);
    
  const aggregatedPhones = candidates
    .map((c) => c.phone)
    .filter((p): p is string => !!p);

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground font-body overflow-x-hidden">
      <ExtractionConfigBar config={config} onChange={handleConfigChange} />
      
      <div className="flex-1 flex flex-col">
        <div className="py-12 px-6 max-w-7xl mx-auto w-full text-center">
          <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4 tracking-tight animate-in fade-in slide-in-from-top-4 duration-500">
            Resume Data <span className="text-primary">Extraction</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto animate-in fade-in slide-in-from-top-6 duration-700">
            Drop your resumes below. Our AI parses skills, education, and profiles in seconds.
          </p>
        </div>

        <ContactAggregator emails={aggregatedEmails} phones={aggregatedPhones} />
        
        <ResumeDropZone onFilesDropped={processFiles} isProcessing={isProcessing} />
        
        <CandidateTable candidates={candidates} config={config} isProcessing={isProcessing} />
      </div>

      <footer className="py-8 border-t border-border/50 text-center text-xs text-muted-foreground font-headline tracking-widest uppercase">
        FlowExtract &copy; {new Date().getFullYear()} — Powered by Advanced AI
      </footer>

      <Toaster />
    </main>
  );
}