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
  });
  
  const [candidates, setCandidates] = useState<ExtractResumeDetailsOutput[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfigChange = (key: keyof ExtractionConfig, value: boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    const results: ExtractResumeDetailsOutput[] = [];

    try {
      for (const file of files) {
        // Read file content
        const content = await readFileAsText(file);
        
        // Execute GenAI Flow
        const extraction = await extractResumeDetails({
          resumeContent: content,
          extractConfig: config,
        });
        
        results.push(extraction);
      }
      
      setCandidates((prev) => [...results, ...prev]);
      toast({
        title: "Extraction Complete",
        description: `Successfully processed ${files.length} resume(s).`,
      });
    } catch (error) {
      console.error("Extraction error:", error);
      toast({
        variant: "destructive",
        title: "Extraction Failed",
        description: "An error occurred while parsing the resumes.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      
      // Simple text reading for now
      // In a production app, we would use a PDF parsing library on the client or server
      if (file.type === "application/pdf") {
        // Mocking PDF to Text for this prototype
        // Real-world: Use library like pdfjs-dist or a cloud function
        resolve(`[PDF CONTENT MOCK: ${file.name}]\nExperience: Senior Software Engineer at Tech Corp (2020-2023). Skills: React, TypeScript, Next.js. Contact: john.doe@example.com, 555-123-4567.`);
      } else {
        reader.readAsText(file);
      }
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
        {/* Dynamic Header Space */}
        <div className="py-12 px-6 max-w-7xl mx-auto w-full text-center">
          <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4 tracking-tight">
            Resume Data <span className="text-primary">Extraction</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our AI analyzes your documents in real-time, pulling only the details you need for your hiring pipeline.
          </p>
        </div>

        {/* Aggregated View */}
        <ContactAggregator emails={aggregatedEmails} phones={aggregatedPhones} />
        
        {/* Drop Zone */}
        <ResumeDropZone onFilesDropped={processFiles} isProcessing={isProcessing} />
        
        {/* Result Table */}
        <CandidateTable candidates={candidates} config={config} />
      </div>

      {/* Subtle Footer */}
      <footer className="py-8 border-t border-border/50 text-center text-xs text-muted-foreground font-headline tracking-widest uppercase">
        FlowExtract &copy; {new Date().getFullYear()} — Powered by Advanced AI
      </footer>

      <Toaster />
    </main>
  );
}
