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
import { User, Mail, Phone, Briefcase, Building2, GraduationCap, LayoutGrid, SearchX, Loader2, Timer } from "lucide-react";

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
        <p className="text-muted-foreground font-headline">Drop or Paste resumes to populate your dashboard.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto w-full px-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-headline font-bold flex items-center gap-3 text-foreground">
          <User className="w-6 h-6 text-primary" />
          Intelligence Dashboard
        </h2>
        <div className="flex items-center gap-3">
          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-primary animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Analyzing documents...</span>
            </div>
          )}
          <Badge variant="outline" className="px-3 py-1 border-primary/30 text-primary font-headline">
            {candidates.length} Profiles Tracked
          </Badge>
        </div>
      </div>
      
      <div className="rounded-2xl border border-border bg-card/30 overflow-hidden shadow-2xl backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-border">
              {config.email && <TableHead className="font-headline font-bold text-foreground">Contact</TableHead>}
              {config.totalExperience && <TableHead className="font-headline font-bold text-foreground text-center">YOE</TableHead>}
              {config.college && <TableHead className="font-headline font-bold text-foreground">Education & Stats</TableHead>}
              {config.suggestedProfiles && <TableHead className="font-headline font-bold text-foreground">Fit Roles</TableHead>}
              {config.skills && <TableHead className="font-headline font-bold text-foreground">Expertise</TableHead>}
              {config.experience && <TableHead className="font-headline font-bold text-foreground">Work History</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.length === 0 && isProcessing && (
               <TableRow className="animate-pulse bg-primary/[0.02]">
                 <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">
                   Extracting deep intelligence from your documents...
                 </TableCell>
               </TableRow>
            )}
            {candidates.map((candidate, idx) => (
              <TableRow key={idx} className="group border-border hover:bg-primary/[0.03] transition-colors">
                {config.email && (
                  <TableCell className="py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-primary" />
                        <span className="font-bold text-foreground text-xs truncate max-w-[140px]">{candidate.email || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground group-hover:text-foreground text-[11px]">{candidate.phone || "—"}</span>
                      </div>
                    </div>
                  </TableCell>
                )}
                {config.totalExperience && (
                   <TableCell className="py-5 text-center">
                     <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-lg border border-primary/20 font-headline font-bold text-[11px]">
                       <Timer className="w-3.5 h-3.5" />
                       {candidate.totalExperience || "New Grad"}
                     </div>
                   </TableCell>
                )}
                {config.college && (
                  <TableCell className="py-5">
                    <div className="flex items-start gap-2 max-w-[200px]">
                      <GraduationCap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground font-medium text-[11px] leading-tight">{candidate.college || "—"}</span>
                    </div>
                  </TableCell>
                )}
                {config.suggestedProfiles && (
                  <TableCell className="py-5">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {candidate.suggestedProfiles?.map((profile, i) => (
                        <div key={i} className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-tight bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                          {profile}
                        </div>
                      )) || "—"}
                    </div>
                  </TableCell>
                )}
                {config.skills && (
                  <TableCell className="py-5">
                    <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                      {candidate.skills?.slice(0, 8).map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] py-0 px-1.5 h-5 bg-secondary/50 border-transparent text-muted-foreground group-hover:text-foreground group-hover:border-primary/30 transition-all">
                          {skill}
                        </Badge>
                      )) || "—"}
                    </div>
                  </TableCell>
                )}
                {config.experience && (
                  <TableCell className="py-5">
                    <div className="flex flex-col gap-2 max-w-[250px]">
                      {candidate.experience?.slice(0, 2).map((exp, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">{exp}</span>
                        </div>
                      )) || (
                        <div className="flex items-start gap-2">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="text-[10px] text-muted-foreground italic">No detailed history found</span>
                        </div>
                      )}
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
