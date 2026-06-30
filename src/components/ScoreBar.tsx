import { cn } from "@/lib/utils";

export function ScoreBar({
  value,
  label,
  className,
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const tone =
    v >= 80
      ? "bg-success"
      : v >= 65
        ? "bg-primary"
        : v >= 50
          ? "bg-warning"
          : "bg-destructive";
  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium tabular-nums">{v}</span>
        </div>
      )}
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

export function ScorePill({ value }: { value: number }) {
  const v = Math.round(value);
  const tone =
    v >= 80
      ? "bg-success/10 text-success border-success/30"
      : v >= 65
        ? "bg-primary/10 text-primary border-primary/30"
        : v >= 50
          ? "bg-warning/15 text-warning-foreground border-warning/40"
          : "bg-destructive/10 text-destructive border-destructive/30";
  return (
    <span className={cn("inline-flex items-center px-2 h-6 rounded-md border text-xs font-semibold tabular-nums", tone)}>
      {v}
    </span>
  );
}
