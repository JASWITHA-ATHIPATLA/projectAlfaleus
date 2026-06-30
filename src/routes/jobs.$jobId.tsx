import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useCandidates, useJob, store } from "@/data/store";
import { ScorePill, ScoreBar } from "@/components/ScoreBar";
import { InterviewStatusBadge } from "@/components/StatusBadge";
import { Mail, GitCompare, AlertTriangle, ArrowLeft, Linkedin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/jobs/$jobId")({
  head: ({ params }) => ({
    meta: [
      { title: `Pipeline — Lumen Hire` },
      { name: "description", content: `Ranked candidate pipeline for job ${params.jobId}.` },
    ],
  }),
  component: Pipeline,
});

function Pipeline() {
  const { jobId } = Route.useParams();
  const job = useJob(jobId);
  const candidates = useCandidates(jobId);
  const [threshold, setThreshold] = useState(70);
  const [selected, setSelected] = useState<string[]>([]);

  const ranked = useMemo(
    () => [...candidates].sort((a, b) => b.score.total - a.score.total),
    [candidates],
  );

  if (!job) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-muted-foreground">Job not found.</p>
          <Link to="/" className="text-primary text-sm">Back to dashboard</Link>
        </div>
      </AppShell>
    );
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) {
        toast.info("You can compare up to 4 candidates.");
        return prev;
      }
      return [...prev, id];
    });
  }

  function toggleShortlist(id: string, value: boolean) {
    store.updateCandidate(id, { shortlisted: value });
  }

  function sendInvite(id: string) {
    const token = `tok_${Math.random().toString(36).slice(2, 10)}`;
    store.updateCandidate(id, { interviewStatus: "invited", interviewToken: token });
    const link = `${window.location.origin}/interview/${token}`;
    navigator.clipboard?.writeText(link).catch(() => {});
    toast.success("Invitation sent. Interview link copied to clipboard.", {
      description: link,
    });
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> All jobs
        </Link>

        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <h1 className="text-3xl font-semibold">{job.title}</h1>
            <p className="text-muted-foreground mt-1">
              {job.company} · {job.location} · {ranked.length} candidates sourced
            </p>
          </div>
          {selected.length >= 2 && (
            <Link
              to="/jobs/$jobId/compare"
              params={{ jobId: job.id }}
              search={{ ids: selected.join(",") }}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
            >
              <GitCompare className="h-4 w-4" />
              Compare {selected.length}
            </Link>
          )}
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Candidate list */}
          <div className="space-y-3">
            {ranked.map((c) => {
              const isSel = selected.includes(c.id);
              const meetsThreshold = c.score.total >= threshold;
              return (
                <div
                  key={c.id}
                  className={`card-elev p-5 transition ${isSel ? "ring-2 ring-primary" : ""}`}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={isSel}
                      onChange={() => toggleSelect(c.id)}
                      className="mt-1.5 h-4 w-4 rounded border-border accent-primary"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Link
                          to="/jobs/$jobId/candidates/$candidateId"
                          params={{ jobId: job.id, candidateId: c.id }}
                          className="text-base font-semibold hover:text-primary transition"
                        >
                          {c.name}
                        </Link>
                        <ScorePill value={c.score.total} />
                        <InterviewStatusBadge status={c.interviewStatus} />
                        {c.score.redFlags.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-warning-foreground bg-warning/15 border border-warning/40 px-1.5 h-5 rounded">
                            <AlertTriangle className="h-3 w-3" /> {c.score.redFlags.length} flag
                            {c.score.redFlags.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {c.title} at {c.company} · {c.location}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                        {Object.entries(c.score.byCriterion).map(([k, v]) => (
                          <ScoreBar key={k} label={k} value={v} />
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={c.shortlisted}
                          onChange={(e) => toggleShortlist(c.id, e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-border accent-primary"
                        />
                        Shortlist
                      </label>
                      {c.interviewStatus === "not_invited" ? (
                        <button
                          onClick={() => sendInvite(c.id)}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Send invite
                        </button>
                      ) : c.interviewToken ? (
                        <Link
                          to="/interview/$token"
                          params={{ token: c.interviewToken }}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border text-xs hover:bg-surface-2"
                        >
                          Open link
                        </Link>
                      ) : null}
                      {c.source === "linkedin" && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Linkedin className="h-3 w-3" /> {c.source}
                        </span>
                      )}
                    </div>
                  </div>
                  {!meetsThreshold && (
                    <p className="text-[11px] text-muted-foreground mt-3 pl-8">
                      Below shortlist threshold ({threshold}). You can still shortlist manually.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* JD analysis sidebar */}
          <aside className="space-y-4">
            <div className="card-elev p-5">
              <h3 className="text-sm font-semibold mb-3">Auto-shortlist threshold</h3>
              <input
                type="range"
                min={40}
                max={95}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>40</span>
                <span className="font-medium text-foreground">{threshold}</span>
                <span>95</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Above threshold: {ranked.filter((c) => c.score.total >= threshold).length} of{" "}
                {ranked.length}
              </p>
            </div>

            <div className="card-elev p-5">
              <h3 className="text-sm font-semibold mb-3">JD analysis</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Role level</div>
                  <div className="font-medium capitalize">{job.analysis.roleLevel}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Experience</div>
                  <div className="font-medium">
                    {job.analysis.experienceRangeYears[0]}–{job.analysis.experienceRangeYears[1]} years
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1.5">Required skills</div>
                  <ul className="space-y-1">
                    {job.analysis.requiredSkills.map((s) => (
                      <li key={s.name} className="flex justify-between gap-2 text-xs">
                        <span>{s.name}</span>
                        <span className="text-muted-foreground capitalize">{s.seniority}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1.5">Implicit signals</div>
                  <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-4">
                    {job.analysis.implicitSignals.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1.5">Scoring criteria</div>
                  <ul className="space-y-1">
                    {job.analysis.criteria.map((c) => (
                      <li key={c.name} className="flex justify-between gap-2 text-xs">
                        <span>{c.name}</span>
                        <span className="text-muted-foreground tabular-nums">
                          {Math.round(c.weight * 100)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
