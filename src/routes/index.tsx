import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useCandidates, useJobs } from "@/data/store";
import { ScorePill } from "@/components/ScoreBar";
import { ArrowRight, Plus, Users, TrendingUp, Video } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumen Hire — AI talent screening" },
      {
        name: "description",
        content:
          "Post a job, auto-source candidates, score them semantically against the JD, run async video interviews, and compare scorecards side by side.",
      },
      { property: "og:title", content: "Lumen Hire — AI talent screening" },
      {
        property: "og:description",
        content:
          "End-to-end recruiter platform: JD analysis, semantic candidate scoring, async video interviews, comparable scorecards.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const jobs = useJobs();
  const allCands = useCandidates();

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Recruiter dashboard
            </p>
            <h1 className="text-3xl font-semibold">Active job pipelines</h1>
            <p className="text-muted-foreground mt-1">
              {jobs.length} job{jobs.length === 1 ? "" : "s"} ·{" "}
              {allCands.length} candidates in pipeline
            </p>
          </div>
          <Link
            to="/jobs/new"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
          >
            <Plus className="h-4 w-4" />
            Post new job
          </Link>
        </div>

        <div className="grid gap-4">
          {jobs.map((job) => {
            const cands = allCands.filter((c) => c.jobId === job.id);
            const avg = cands.length
              ? Math.round(cands.reduce((s, c) => s + c.score.total, 0) / cands.length)
              : 0;
            const completed = cands.filter((c) => c.interviewStatus === "completed").length;
            const invited = cands.filter((c) => c.interviewStatus !== "not_invited").length;
            const completionRate = invited
              ? Math.round((completed / invited) * 100)
              : 0;

            return (
              <Link
                key={job.id}
                to="/jobs/$jobId"
                params={{ jobId: job.id }}
                className="card-elev p-6 hover:shadow-elev transition-shadow group"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold truncate">{job.title}</h3>
                      <span className="text-sm text-muted-foreground">·</span>
                      <span className="text-sm text-muted-foreground truncate">
                        {job.company} · {job.location}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.analysis.requiredSkills.slice(0, 4).map((s) => (
                        <span
                          key={s.name}
                          className="px-2 h-6 inline-flex items-center text-xs rounded-md bg-secondary text-secondary-foreground"
                        >
                          {s.name}
                        </span>
                      ))}
                      {job.analysis.requiredSkills.length > 4 && (
                        <span className="text-xs text-muted-foreground self-center">
                          +{job.analysis.requiredSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition" />
                </div>

                <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-border">
                  <Stat icon={<Users className="h-4 w-4" />} label="Candidates" value={String(cands.length)} />
                  <Stat
                    icon={<TrendingUp className="h-4 w-4" />}
                    label="Avg semantic score"
                    value={<ScorePill value={avg} />}
                  />
                  <Stat
                    icon={<Video className="h-4 w-4" />}
                    label="Interview completion"
                    value={`${completionRate}%`}
                  />
                </div>
              </Link>
            );
          })}

          {jobs.length === 0 && (
            <div className="card-elev p-12 text-center">
              <p className="text-muted-foreground">No jobs yet. Post your first one.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
        {icon}
        {label}
      </div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}
