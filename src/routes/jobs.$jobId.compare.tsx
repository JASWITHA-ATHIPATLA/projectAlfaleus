import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useCandidates, useJob } from "@/data/store";
import { ScoreBar, ScorePill } from "@/components/ScoreBar";
import { ArrowLeft, ChevronDown, Trophy } from "lucide-react";

interface CompareSearch {
  ids: string;
}
const searchSchema = z.object({ ids: z.string().default("") });

export const Route = createFileRoute("/jobs/$jobId/compare")({
  validateSearch: (s: Record<string, unknown>): CompareSearch => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Compare candidates — Lumen Hire" }] }),
  component: Compare,
});

function Compare() {
  const { jobId } = Route.useParams();
  const search = Route.useSearch() as CompareSearch;
  const ids: string = search.ids ?? "";
  const job = useJob(jobId);
  const all = useCandidates(jobId);
  const selectedIds: string[] = ids.split(",").filter(Boolean);
  const cands = selectedIds
    .map((id: string) => all.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const [expanded, setExpanded] = useState<string | null>(null);

  if (!job || cands.length < 2) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-muted-foreground mb-4">Select 2–4 candidates to compare.</p>
          <Link to="/jobs/$jobId" params={{ jobId }} className="text-primary text-sm">
            Back to pipeline
          </Link>
        </div>
      </AppShell>
    );
  }

  const criteria = job.analysis.criteria.map((c) => c.name);
  const dims = ["relevance", "clarity", "specificity", "depth"] as const;

  // Recommended ranking: weighted combo of semantic score and aggregate interview clarity+depth+relevance avg
  const ranked = [...cands].sort((a, b) => {
    const ai = a.scorecard
      ? (a.scorecard.aggregate.relevance + a.scorecard.aggregate.depth + a.scorecard.aggregate.clarity) / 3
      : 0;
    const bi = b.scorecard
      ? (b.scorecard.aggregate.relevance + b.scorecard.aggregate.depth + b.scorecard.aggregate.clarity) / 3
      : 0;
    return b.score.total * 0.5 + bi * 0.5 - (a.score.total * 0.5 + ai * 0.5);
  });

  // Gather unique questions across candidates that have a scorecard
  const questions = Array.from(
    new Map(
      cands.flatMap((c) => c.scorecard?.answers.map((a) => [a.questionId, a.question] as const) ?? []),
    ).entries(),
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Link
          to="/jobs/$jobId"
          params={{ jobId }}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to pipeline
        </Link>
        <h1 className="text-3xl font-semibold mb-2">Side-by-side comparison</h1>
        <p className="text-muted-foreground mb-8">
          {cands.length} candidates · {job.title}
        </p>

        {/* Recommended ranking */}
        <div className="card-elev p-5 mb-6 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-sm uppercase tracking-wider">
              Recommended ranking
            </h2>
          </div>
          <ol className="space-y-2">
            {ranked.map((c, i) => (
              <li key={c.id} className="flex items-center gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-semibold">
                  {i + 1}
                </span>
                <span className="font-medium">{c.name}</span>
                <ScorePill value={c.score.total} />
                <span className="text-muted-foreground text-xs">
                  {i === 0
                    ? "Strongest combined signal across JD fit and interview depth."
                    : `Behind ${ranked[0].name} primarily on ${c.score.total < ranked[0].score.total ? "JD semantic fit" : "interview depth"}.`}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Header row */}
        <div className="card-elev overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-2 border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground w-48">
                  Candidate
                </th>
                {cands.map((c) => (
                  <th key={c.id} className="text-left px-4 py-3 align-top">
                    <Link
                      to="/jobs/$jobId/candidates/$candidateId"
                      params={{ jobId, candidateId: c.id }}
                      className="font-semibold hover:text-primary"
                    >
                      {c.name}
                    </Link>
                    <div className="text-xs text-muted-foreground font-normal">
                      {c.title} · {c.company}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-muted-foreground">Semantic total</td>
                {cands.map((c) => (
                  <td key={c.id} className="px-4 py-3">
                    <ScorePill value={c.score.total} />
                  </td>
                ))}
              </tr>

              {criteria.map((k) => (
                <tr key={k} className="border-b border-border">
                  <td className="px-4 py-3 text-muted-foreground">{k}</td>
                  {cands.map((c) => (
                    <td key={c.id} className="px-4 py-3">
                      <ScoreBar value={c.score.byCriterion[k] ?? 0} />
                    </td>
                  ))}
                </tr>
              ))}

              <tr className="border-b border-border bg-surface-2/50">
                <td className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground" colSpan={cands.length + 1}>
                  Interview dimensions
                </td>
              </tr>

              {dims.map((d) => (
                <tr key={d} className="border-b border-border">
                  <td className="px-4 py-3 text-muted-foreground capitalize">{d}</td>
                  {cands.map((c) => (
                    <td key={c.id} className="px-4 py-3">
                      {c.scorecard ? (
                        <ScoreBar value={c.scorecard.aggregate[d]} />
                      ) : (
                        <span className="text-xs text-muted-foreground">No interview</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}

              {questions.length > 0 && (
                <tr className="border-b border-border bg-surface-2/50">
                  <td
                    className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground"
                    colSpan={cands.length + 1}
                  >
                    Per-question summaries
                  </td>
                </tr>
              )}
              {questions.map(([qid, qtext]) => {
                const isOpen = expanded === qid;
                return (
                  <tr key={qid} className="border-b border-border align-top">
                    <td className="px-4 py-3 text-muted-foreground">
                      <button
                        onClick={() => setExpanded(isOpen ? null : qid)}
                        className="flex items-start gap-1.5 text-left hover:text-foreground"
                      >
                        <ChevronDown
                          className={`h-4 w-4 mt-0.5 transition-transform ${isOpen ? "" : "-rotate-90"}`}
                        />
                        <span className="text-xs">{qtext}</span>
                      </button>
                    </td>
                    {cands.map((c) => {
                      const a = c.scorecard?.answers.find((x) => x.questionId === qid);
                      return (
                        <td key={c.id} className="px-4 py-3">
                          {a ? (
                            <>
                              <div className="flex items-center gap-2 mb-1">
                                <ScorePill value={a.score.relevance} />
                                <span className="text-xs text-muted-foreground">
                                  {a.fillerCount} fillers
                                </span>
                              </div>
                              <p className={`text-xs leading-relaxed ${isOpen ? "" : "line-clamp-2"}`}>
                                {a.summary}
                              </p>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
