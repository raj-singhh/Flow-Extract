"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Settings2 } from "lucide-react";

export type ExtractionConfig = {
  email: boolean;
  phone: boolean;
  skills: boolean;
  experience: boolean;
  companies: boolean;
  college: boolean;
  suggestedProfiles: boolean;
  totalExperience: boolean;
};

interface ExtractionConfigBarProps {
  config: ExtractionConfig;
  onChange: (key: keyof ExtractionConfig, value: boolean) => void;
  onReset: () => void;
}

export function ExtractionConfigBar({ config, onChange, onReset }: ExtractionConfigBarProps) {
  const formatLabel = (key: string) => {
    if (key === 'totalExperience') return 'YOE';
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <div className="w-full bg-card/50 border-b p-4 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-white"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-headline font-bold tracking-tight text-foreground">FlowExtract</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Batch Engine v2.0</p>
          </div>
        </div>
        
        <div className="flex flex-1 flex-wrap items-center gap-4 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <div className="flex items-center gap-2 mr-2">
            <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-headline whitespace-nowrap">Extraction Fields:</span>
          </div>
          {(Object.keys(config) as Array<keyof ExtractionConfig>).map((key) => (
            <div key={key} className="flex items-center space-x-2 bg-background/50 px-3 py-1.5 rounded-full border border-border hover:border-primary/50 transition-colors cursor-pointer group">
              <Checkbox
                id={key}
                checked={config[key]}
                onCheckedChange={(checked) => onChange(key, !!checked)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label
                htmlFor={key}
                className="text-xs font-medium cursor-pointer group-hover:text-primary transition-colors font-headline whitespace-nowrap"
              >
                {formatLabel(key)}
              </Label>
            </div>
          ))}
        </div>

        <div className="shrink-0">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={onReset}
            className="h-9 px-4 rounded-xl gap-2 font-headline font-bold text-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Data
          </Button>
        </div>
      </div>
    </div>
  );
}
