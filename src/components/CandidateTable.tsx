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
import { User, Mail, Phone, Briefcase, GraduationCap, SearchX, Loader2, Timer } from "lucide-react";

interface CandidateTableProps {
  candidates: ExtractResumeDetailsOutput[];
  config: ExtractionConfig;
  isProcessing?: boolean;
}

export function CandidateTable({ candidates, config, isProcessing }: CandidateTableProps) {
  if (candidates.length === 0 && !isProcessing) return (
    <div className="max-w-7xl mx-auto w-full px-6 py-12 text-center">
      <div className="bg-card/20 border border-dashed border-border rounded-3xl p-12 flex flex-col items-center gap-4">
        <SearchX className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-muted-foreground font-headline">No candidates extracted yet.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto w-full px-6 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-headline font-bold flex items-center gap-3">
          <User className="w-6 h-6 text-primary" />
          Candidate Intelligence
        </h2>
        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-primary animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Processing batch...</span>
          </div>
        )}
      </div>
      
      <div className="rounded-2xl border border-border bg-card/30 overflow-hidden shadow-2xl backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-border">
              {config.email && <TableHead className="font-bold text-foreground">Contact</TableHead>}
              {config.totalExperience && <TableHead className="font-bold text-foreground text-center">Total YOE</TableHead>}
              {config.college && <TableHead className="font-bold text-foreground">Education & Score</TableHead>}
              {config.suggestedProfiles && <TableHead className="font-bold text-foreground">Top Profiles</TableHead>}
              {config.skills && <TableHead className="font-bold text-foreground">Skills</TableHead>}
              {config.experience && <TableHead className="font-bold text-foreground">History</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate, idx) => (
              <TableRow key={idx} className="group border-border hover:bg-primary/[0.02]">
                {config.email && (
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-primary" />
                        <span className="font-bold text-xs">{candidate.email || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground text-[10px]">{candidate.phone || "—"}</span>
                      </div>
                    </div>
                  </TableCell>
                )}
                {config.totalExperience && (
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary gap-1">
                      <Timer className="w-3 h-3" />
                      {candidate.totalExperience || "—"}
                    </Badge>
                  </TableCell>
                )}
                {config.college && (
                  <TableCell>
                    <div className="flex items-start gap-2 max-w-[200px]">
                      <GraduationCap className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="text-[11px] font-medium leading-tight">{candidate.college || "—"}</span>
                    </div>
                  </TableCell>
                )}
                {config.suggestedProfiles && (
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {candidate.suggestedProfiles?.map((p, i) => (
                        <span key={i} className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 uppercase font-bold tracking-tight">
                          {p}
                        </span>
                      )) || "—"}
                    </div>
                  </TableCell>
                )}
                {config.skills && (
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {candidate.skills?.slice(0, 8).map((s, i) => (
                        <Badge key={i} variant="secondary" className="text-[9px] px-1 h-4 font-normal">
                          {s}
                        </Badge>
                      )) || "—"}
                    </div>
                  </TableCell>
                )}
                {config.experience && (
                  <TableCell>
                    <div className="flex flex-col gap-1.5 max-w-[220px]">
                      {candidate.experience?.slice(0, 3).map((exp, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <Briefcase className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                          <span className="text-[10px] text-muted-foreground leading-tight">{exp}</span>
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
