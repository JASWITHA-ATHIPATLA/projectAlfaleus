import { cn } from "@/lib/utils";
import type { InterviewStatus } from "@/data/types";

const map: Record<InterviewStatus, { label: string; cls: string }> = {
  not_invited: { label: "Not invited", cls: "bg-muted text-muted-foreground border-border" },
  invited: { label: "Invited", cls: "bg-accent/15 text-accent-foreground border-accent/40" },
  in_progress: { label: "In progress", cls: "bg-primary/10 text-primary border-primary/30" },
  completed: { label: "Completed", cls: "bg-success/10 text-success border-success/30" },
};

export function InterviewStatusBadge({ status }: { status: InterviewStatus }) {
  const m = map[status];
  return (
    <span className={cn("inline-flex items-center px-2 h-6 rounded-md border text-xs font-medium", m.cls)}>
      {m.label}
    </span>
  );
}
