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
import { User, Mail, Phone, Briefcase, Building2, GraduationCap, LayoutGrid } from "lucide-react";

interface CandidateTableProps {
  candidates: ExtractResumeDetailsOutput[];
  config: ExtractionConfig;
}

export function CandidateTable({ candidates, config }: CandidateTableProps) {
  if (candidates.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto w-full px-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-headline font-bold flex items-center gap-3">
          <User className="w-6 h-6 text-primary" />
          Processed Candidates
        </h2>
        <Badge variant="outline" className="px-3 py-1 border-primary/30 text-primary font-headline">
          {candidates.length} Resumes Parsed
        </Badge>
      </div>
      
      <div className="rounded-2xl border border-border bg-card/30 overflow-hidden shadow-xl backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-border">
              {config.email && <TableHead className="font-headline font-bold text-foreground">Email</TableHead>}
              {config.phone && <TableHead className="font-headline font-bold text-foreground">Phone</TableHead>}
              {config.college && <TableHead className="font-headline font-bold text-foreground">College</TableHead>}
              {config.suggestedProfiles && <TableHead className="font-headline font-bold text-foreground">Suggested Profiles</TableHead>}
              {config.skills && <TableHead className="font-headline font-bold text-foreground">Top Skills</TableHead>}
              {config.experience && <TableHead className="font-headline font-bold text-foreground">Latest Exp</TableHead>}
              {config.companies && <TableHead className="font-headline font-bold text-foreground">Companies</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
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
