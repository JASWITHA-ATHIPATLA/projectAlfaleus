import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/layout/AppShell";
import { analyzeJobDescription } from "@/lib/jd-analysis.functions";
import { store } from "@/data/store";
import type { Job } from "@/data/types";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/jobs/new")({
  head: () => ({
    meta: [
      { title: "Post a job — Lumen Hire" },
      {
        name: "description",
        content:
          "Paste a job description. Lumen Hire extracts required skills, seniority, and scoring criteria automatically.",
      },
    ],
  }),
  component: NewJob,
});

const sample = `We're hiring a senior backend engineer to own our event-driven order pipeline. You'll design distributed services that handle 50k events/sec, work closely with product on roadmap, and mentor 2-3 mid-level engineers in a fast-paced environment.

Requirements:
- 5+ years building backend services in Go or Python
- Strong experience with Kafka or similar event streaming
- Postgres at scale, query optimization
- Comfortable with on-call and production ownership

Nice to have:
- Kubernetes, observability tooling
- Background in fintech or marketplaces`;

function NewJob() {
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeJobDescription);
  const [title, setTitle] = useState("Senior Backend Engineer");
  const [company, setCompany] = useState("Northwind Labs");
  const [location, setLocation] = useState("Remote (EU)");
  const [description, setDescription] = useState(sample);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const analysis = await analyze({ data: { title, description } });
      const job: Job = {
        id: `job_${Date.now()}`,
        title,
        company,
        location,
        description,
        createdAt: new Date().toISOString(),
        analysis,
      };
      store.saveJob(job);
      toast.success("Job analyzed. Scraping pipeline starting...");
      navigate({ to: "/jobs/$jobId", params: { jobId: job.id } });
    } catch (err) {
      console.error(err);
      toast.error("Failed to analyze JD. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          New job posting
        </p>
        <h1 className="text-3xl font-semibold mb-2">Describe the role</h1>
        <p className="text-muted-foreground mb-8">
          We&apos;ll extract required skills, seniority, and scoring criteria, then begin sourcing
          and ranking candidates.
        </p>

        <form onSubmit={onSubmit} className="card-elev p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Job title">
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Company">
              <input
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="input"
              />
            </Field>
          </div>
          <Field label="Location">
            <input
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Job description" hint="Paste the full JD. The more context the better.">
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={14}
              className="input font-mono text-[13px] leading-relaxed"
            />
          </Field>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Analyzed with Gemini via Lovable AI · runs server-side.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze & start pipeline
                </>
              )}
            </button>
          </div>
        </form>

        <style>{`
          .input {
            width: 100%;
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
            outline: none;
            transition: border-color .15s, box-shadow .15s;
          }
          .input:focus { border-color: var(--color-ring); box-shadow: 0 0 0 3px color-mix(in oklch, var(--color-ring) 18%, transparent); }
        `}</style>
      </div>
    </AppShell>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm font-medium">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </label>
  );
}
