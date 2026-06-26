import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "isotype" | "full";
}

function IsotypeSvg({ className }: { className?: string }) {
  return (
    <div className={cn("shrink-0", className)}>
      <svg viewBox="0 0 32 32" fill="none" className="h-full w-full">
        <rect x="0.5" y="0.5" width="31" height="31" rx="8" className="fill-primary" />
        <path d="M4 11h24" className="stroke-primary-foreground" strokeWidth="3" strokeLinecap="round" />
        <path d="M13 11v16" className="stroke-primary-foreground" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M19 11v16" className="stroke-primary-foreground" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function Logo({ className, variant = "isotype" }: LogoProps) {
  if (variant === "full") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <IsotypeSvg className="h-8 w-8" />
        <span className="text-sm font-semibold">Transespeciales ERP</span>
      </div>
    );
  }

  return <IsotypeSvg className={className} />;
}
