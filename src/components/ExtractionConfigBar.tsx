import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export type ExtractionConfig = {
  email: boolean;
  phone: boolean;
  skills: boolean;
  experience: boolean;
  companies: boolean;
};

interface ExtractionConfigBarProps {
  config: ExtractionConfig;
  onChange: (key: keyof ExtractionConfig, value: boolean) => void;
}

export function ExtractionConfigBar({ config, onChange }: ExtractionConfigBarProps) {
  return (
    <div className="w-full bg-card/50 border-b p-4 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-white"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h1 className="text-xl font-headline font-bold tracking-tight">FlowExtract</h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-6">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest font-headline">Fields to Extract:</span>
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
                className="text-sm font-medium capitalize cursor-pointer group-hover:text-primary transition-colors font-headline"
              >
                {key}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
