"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ExtractionConfig } from "./ExtractionConfigBar";
import { ExtractResumeDetailsOutput } from "@/ai/flows/extract-resume-details-flow";
import { User, Mail, Phone, Briefcase, Building2, GraduationCap, LayoutGrid, SearchX, Loader2 } from "lucide-react";

interface CandidateTableProps {
  candidates: ExtractResumeDetailsOutput[];
  config: ExtractionConfig;
  isProcessing?: boolean;
}

export function CandidateTable({ candidates, config, isProcessing }: CandidateTableProps) {
  if (candidates.length === 0 && !isProcessing) return (
    <div className="max-w-7xl mx-auto w-full px-6 py-12 text-center animate-in fade-in duration-1000">
      <div className="bg-card/20 border border-dashed border-border rounded-3xl p-12 flex flex-col items-center gap-4">
        <SearchX className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-muted-foreground font-headline">No candidates processed yet.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto w-full px-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-headline font-bold flex items-center gap-3">
          <User className="w-6 h-6 text-primary" />
          Candidate Dashboard
        </h2>
        <div className="flex items-center gap-3">
          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-primary animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Parsing files...</span>
            </div>
          )}
          <Badge variant="outline" className="px-3 py-1 border-primary/30 text-primary font-headline">
            {candidates.length} Profiles Extracted
          </Badge>
        </div>
      </div>
      
      <div className="rounded-2xl border border-border bg-card/30 overflow-hidden shadow-xl backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-border">
              {config.email && <TableHead className="font-headline font-bold text-foreground">Email</TableHead>}
              {config.phone && <TableHead className="font-headline font-bold text-foreground">Phone</TableHead>}
              {config.college && <TableHead className="font-headline font-bold text-foreground">Education</TableHead>}
              {config.suggestedProfiles && <TableHead className="font-headline font-bold text-foreground">Fit Roles</TableHead>}
              {config.skills && <TableHead className="font-headline font-bold text-foreground">Expertise</TableHead>}
              {config.experience && <TableHead className="font-headline font-bold text-foreground">Latest Summary</TableHead>}
              {config.companies && <TableHead className="font-headline font-bold text-foreground">History</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.length === 0 && isProcessing && (
               <TableRow className="animate-pulse bg-primary/[0.02]">
                 <TableCell colSpan={7} className="h-24 text-center text-muted-foreground italic">
                   Extracting intelligence from your documents...
                 </TableCell>
               </TableRow>
            )}
            {candidates.map((candidate, idx) => (
              <TableRow key={idx} className="group border-border hover:bg-primary/[0.03] transition-colors">
                {config.email && (
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="font-medium text-foreground text-xs">{candidate.email || "—"}</span>
                    </div>
                  </TableCell>
                )}
                {config.phone && (
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-muted-foreground group-hover:text-foreground text-xs">{candidate.phone || "—"}</span>
                    </div>
                  </TableCell>
                )}
                {config.college && (
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2 max-w-[150px]">
                      <GraduationCap className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      <span className="text-muted-foreground group-hover:text-foreground text-xs line-clamp-2">{candidate.college || "—"}</span>
                    </div>
                  </TableCell>
                )}
                {config.suggestedProfiles && (
                  <TableCell className="py-4">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {candidate.suggestedProfiles?.map((profile, i) => (
                        <div key={i} className="flex items-center gap-1 text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                          <LayoutGrid className="w-3 h-3" />
                          {profile}
                        </div>
                      )) || "—"}
                    </div>
                  </TableCell>
                )}
                {config.skills && (
                  <TableCell className="py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-[150px]">
                      {candidate.skills?.slice(0, 4).map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] py-0 bg-secondary/50 hover:bg-primary/20 hover:text-primary transition-all">
                          {skill}
                        </Badge>
                      )) || "—"}
                    </div>
                  </TableCell>
                )}
                {config.experience && (
                  <TableCell className="py-4">
                    <div className="flex items-start gap-2 max-w-[180px]">
                      <Briefcase className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                      <span className="text-[11px] text-muted-foreground line-clamp-2">{candidate.experience?.[0] || "—"}</span>
                    </div>
                  </TableCell>
                )}
                {config.companies && (
                  <TableCell className="py-4">
                    <div className="flex flex-wrap gap-1 max-w-[120px]">
                      {candidate.companies?.slice(0, 2).map((co, i) => (
                        <div key={i} className="flex items-center gap-1 text-[10px] text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
                          <Building2 className="w-3 h-3" />
                          {co}
                        </div>
                      )) || "—"}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
