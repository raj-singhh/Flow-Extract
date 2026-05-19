"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactAggregatorProps {
  emails: string[];
  phones: string[];
}

export function ContactAggregator({ emails, phones }: ContactAggregatorProps) {
  const { toast } = useToast();
  const [copiedType, setCopiedType] = useState<"email" | "phone" | null>(null);

  const copyToClipboard = async (data: string[], type: "email" | "phone") => {
    if (data.length === 0) return;
    const text = data.join(", ");
    await navigator.clipboard.writeText(text);
    setCopiedType(type);
    toast({
      title: "Copied to clipboard",
      description: `${data.length} ${type}s copied.`,
    });
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 max-w-7xl mx-auto w-full">
      <AggregatorColumn
        title="Aggregated Emails"
        data={emails}
        type="email"
        icon={<Mail className="w-4 h-4" />}
        onCopy={() => copyToClipboard(emails, "email")}
        isCopied={copiedType === "email"}
      />
      <AggregatorColumn
        title="Aggregated Phone Numbers"
        data={phones}
        type="phone"
        icon={<Phone className="w-4 h-4" />}
        onCopy={() => copyToClipboard(phones, "phone")}
        isCopied={copiedType === "phone"}
      />
    </div>
  );
}

function AggregatorColumn({
  title,
  data,
  icon,
  onCopy,
  isCopied,
}: {
  title: string;
  data: string[];
  icon: React.ReactNode;
  onCopy: () => void;
  isCopied: boolean;
}) {
  const content = data.length > 0 ? data.join(", ") : "No data extracted yet...";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary font-headline font-semibold">
          {icon}
          <span>{title}</span>
          <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full">
            {data.length}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-2 bg-background/50 border-border hover:border-primary hover:text-primary transition-all"
          disabled={data.length === 0}
          onClick={onCopy}
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span className="text-xs">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-xs">Copy List</span>
            </>
          )}
        </Button>
      </div>
      <div className="bg-card/30 border border-border rounded-xl p-4 min-h-[100px] max-h-[150px] overflow-y-auto text-sm text-muted-foreground leading-relaxed transition-all hover:border-primary/30">
        {content}
      </div>
    </div>
  );
}
