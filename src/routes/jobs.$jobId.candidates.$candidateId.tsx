import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useCandidate, useJob } from "@/data/store";
import { ScoreBar, ScorePill } from "@/components/ScoreBar";
import { InterviewStatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, AlertTriangle, CheckCircle2, MessageSquareQuote } from "lucide-react";

export const Route = createFileRoute("/jobs/$jobId/candidates/$candidateId")({
  head: () => ({ meta: [{ title: "Candidate — Lumen Hire" }] }),
  component: CandidateDetail,
});

const recColor = {
  strong_hire: "bg-success text-success-foreground",
  hire: "bg-primary text-primary-foreground",
  no_hire: "bg-warning text-warning-foreground",
  strong_no_hire: "bg-destructive text-destructive-foreground",
} as const;

const recLabel = {
  strong_hire: "Strong hire",
  hire: "Hire",
  no_hire: "No hire",
  strong_no_hire: "Strong no hire",
} as const;

function CandidateDetail() {
  const { jobId, candidateId } = Route.useParams();
  const job = useJob(jobId);
  const c = useCandidate(candidateId);

  if (!job || !c) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center text-muted-foreground">
          Candidate not found.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          to="/jobs/$jobId"
          params={{ jobId }}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to pipeline
        </Link>

        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-semibold">{c.name}</h1>
              <ScorePill value={c.score.total} />
              <InterviewStatusBadge status={c.interviewStatus} />
            </div>
            <p className="text-muted-foreground">
              {c.title} at {c.company} · {c.location}
            </p>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{c.experienceSummary}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {c.skills.map((s) => (
                <span
                  key={s}
                  className="px-2 h-6 inline-flex items-center text-xs rounded-md bg-secondary text-secondary-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="card-elev p-5">
            <h2 className="font-semibold mb-4">Semantic score breakdown</h2>
            <div className="space-y-3">
              {Object.entries(c.score.byCriterion).map(([k, v]) => (
                <ScoreBar key={k} label={k} value={v} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              {c.score.rationale}
            </p>
          </div>
          <div className="card-elev p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Red flags
            </h2>
            {c.score.redFlags.length === 0 ? (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                None detected.
              </p>
            ) : (
              <ul className="space-y-2">
                {c.score.redFlags.map((f) => (
                  <li key={f} className="text-sm flex gap-2">
                    <span className="text-warning mt-0.5">•</span>
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {c.scorecard ? (
          <div className="card-elev p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold">Interview scorecard</h2>
              <span
                className={`inline-flex items-center px-3 h-8 rounded-md text-sm font-semibold ${recColor[c.scorecard.recommendation]}`}
              >
                {recLabel[c.scorecard.recommendation]} ·{" "}
                {Math.round(c.scorecard.confidence * 100)}%
              </span>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground mb-6">
              {c.scorecard.summary}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {(["relevance", "clarity", "specificity", "depth"] as const).map((k) => (
                <div key={k} className="bg-surface-2 rounded-lg p-4">
                  <div className="text-xs text-muted-foreground capitalize mb-1">{k}</div>
                  <div className="text-2xl font-semibold tabular-nums">
                    {c.scorecard!.aggregate[k]}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-5">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Per-answer breakdown
              </h3>
              {c.scorecard.answers.map((a, i) => (
                <div key={a.questionId} className="border-l-2 border-border pl-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-medium text-sm">
                      Q{i + 1}. {a.question}
                    </p>
                    <div className="flex gap-1.5 shrink-0">
                      <ScorePill value={a.score.relevance} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{a.summary}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Relevance {a.score.relevance}</span>
                    <span>Clarity {a.score.clarity}</span>
                    <span>Specificity {a.score.specificity}</span>
                    <span>Depth {a.score.depth}</span>
                    <span>·</span>
                    <span>{a.fillerCount} filler words</span>
                    <span>{Math.round(a.durationSec / 60)}m {a.durationSec % 60}s</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <MessageSquareQuote className="h-4 w-4" />
                Recommended follow-up questions
              </h3>
              <ul className="space-y-2">
                {c.scorecard.followUpQuestions.map((q) => (
                  <li key={q} className="text-sm flex gap-2">
                    <span className="text-primary">→</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="card-elev p-8 text-center">
            <p className="text-muted-foreground">No interview yet for this candidate.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
