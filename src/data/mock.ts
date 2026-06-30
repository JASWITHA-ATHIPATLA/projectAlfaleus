import type { Candidate, Job, Scorecard } from "./types";

const sampleScorecard = (strong: boolean): Scorecard => ({
  answers: [
    {
      questionId: "q1",
      question: "Walk me through a distributed system you designed and the tradeoffs you made.",
      transcript:
        "So, um, at my last role I designed the order ingestion pipeline. We had spikes of 50k events per second so we used Kafka for buffering, and we partitioned by tenant id...",
      summary: strong
        ? "Designed a Kafka-based ingestion pipeline handling 50k events/sec, partitioned by tenant. Discussed backpressure, exactly-once tradeoffs, and chose at-least-once with idempotency keys for simplicity."
        : "Mentioned using Kafka but did not explain partitioning strategy, delivery guarantees, or scale numbers. Answer stayed at a surface description.",
      score: strong
        ? { relevance: 92, clarity: 85, specificity: 88, depth: 90 }
        : { relevance: 60, clarity: 55, specificity: 40, depth: 35 },
      fillerCount: strong ? 4 : 18,
      durationSec: strong ? 168 : 92,
    },
    {
      questionId: "q2",
      question: "Tell me about a time you disagreed with an engineering decision and how you handled it.",
      transcript:
        "Yeah, so we were about to ship a microservice split that I thought was premature. I wrote a one-pager with the costs, talked to the tech lead, and we ended up keeping the monolith for two more quarters.",
      summary: strong
        ? "Disagreed with a premature microservice split. Wrote a one-pager quantifying costs, aligned with tech lead, and team kept monolith. Showed structured disagreement and follow-through."
        : "Said they 'just talked to their manager.' No specific situation, no outcome, no reflection.",
      score: strong
        ? { relevance: 88, clarity: 90, specificity: 86, depth: 82 }
        : { relevance: 55, clarity: 60, specificity: 30, depth: 35 },
      fillerCount: strong ? 3 : 14,
      durationSec: strong ? 142 : 70,
    },
    {
      questionId: "q3",
      question: "How do you approach mentoring more junior engineers on your team?",
      transcript:
        "I usually pair on the first week of any new project, then move to async code reviews with longer explanations, and we run a weekly office hour.",
      summary: strong
        ? "Structured mentoring: pairs first week, async code reviews with rich context, weekly office hours. Demonstrates intentional ramp-up framework."
        : "Said 'I help when they ask' — reactive, no structure, no measurement of growth.",
      score: strong
        ? { relevance: 85, clarity: 88, specificity: 80, depth: 78 }
        : { relevance: 50, clarity: 65, specificity: 30, depth: 25 },
      fillerCount: strong ? 2 : 9,
      durationSec: strong ? 110 : 48,
    },
  ],
  aggregate: strong
    ? { relevance: 88, clarity: 88, specificity: 85, depth: 83 }
    : { relevance: 55, clarity: 60, specificity: 33, depth: 32 },
  recommendation: strong ? "strong_hire" : "no_hire",
  confidence: strong ? 0.86 : 0.78,
  summary: strong
    ? "Strong technical depth and clear communication. Concrete examples with measurable outcomes. Demonstrates structured thinking on both technical and people topics."
    : "Answers were generic, lacked specifics, and showed limited depth on the technical question. Communication had high filler-word density.",
  followUpQuestions: strong
    ? [
        "Walk me through the exactly-once vs at-least-once tradeoff in more detail.",
        "Tell me about a mentoring case that did not go well.",
        "What would you change about that disagreement in hindsight?",
      ]
    : [
        "Can you walk through a specific system you built end-to-end?",
        "Give me a concrete example with measurable outcomes.",
        "What was the hardest engineering decision you made last year?",
      ],
});

const seedJob: Job = {
  id: "job_senior_backend",
  title: "Senior Backend Engineer",
  company: "Northwind Labs",
  location: "Remote (EU)",
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  description:
    "We're hiring a senior backend engineer to own our event-driven order pipeline. You'll design distributed services, work closely with product, and mentor mid-level engineers in a fast-paced environment.",
  analysis: {
    requiredSkills: [
      { name: "Distributed systems", seniority: "senior" },
      { name: "Python or Go", seniority: "senior" },
      { name: "Event streaming (Kafka)", seniority: "mid" },
      { name: "Postgres", seniority: "mid" },
    ],
    preferredSkills: ["Kubernetes", "Observability (OTel)", "Domain-driven design"],
    experienceRangeYears: [5, 9],
    roleLevel: "senior",
    implicitSignals: [
      "Comfort with ambiguity ('fast-paced environment')",
      "Stakeholder communication implied by 'work closely with product'",
      "Mentorship expected beyond IC scope",
    ],
    criteria: [
      { name: "Technical skills", weight: 0.4 },
      { name: "Seniority indicators", weight: 0.25 },
      { name: "Domain experience", weight: 0.2 },
      { name: "Communication & leadership", weight: 0.15 },
    ],
  },
};

const candidates: Candidate[] = [
  {
    id: "c_amelia",
    jobId: seedJob.id,
    name: "Amelia Chen",
    title: "Staff Engineer",
    company: "Stripe",
    location: "Berlin, DE",
    skills: ["Go", "Kafka", "Postgres", "Kubernetes", "OpenTelemetry"],
    experienceSummary:
      "8y building payment and ledger systems at scale. Led migration to event sourcing for a billion-dollar volume product.",
    source: "linkedin",
    profileUrl: "https://www.linkedin.com/in/sample-amelia",
    score: {
      total: 91,
      byCriterion: {
        "Technical skills": 95,
        "Seniority indicators": 92,
        "Domain experience": 88,
        "Communication & leadership": 85,
      },
      redFlags: [],
      rationale:
        "Profile language semantically aligns with required event-driven and distributed-systems criteria. Tenure pattern and scope suggest senior IC with mentorship experience.",
    },
    shortlisted: true,
    interviewStatus: "completed",
    interviewToken: "tok_amelia_demo",
    scorecard: sampleScorecard(true),
  },
  {
    id: "c_marcus",
    jobId: seedJob.id,
    name: "Marcus Bauer",
    title: "Senior Software Engineer",
    company: "Zalando",
    location: "Berlin, DE",
    skills: ["Python", "FastAPI", "Postgres", "AWS"],
    experienceSummary:
      "6y backend. Owned the inventory service, reduced p99 latency by 40% through query and cache redesign.",
    source: "linkedin",
    score: {
      total: 78,
      byCriterion: {
        "Technical skills": 82,
        "Seniority indicators": 80,
        "Domain experience": 70,
        "Communication & leadership": 76,
      },
      redFlags: [],
      rationale:
        "Strong on backend basics and measurable impact. Slightly weaker on explicit event-streaming experience but inventory optimization is a strong semantic proxy for the pipeline work.",
    },
    shortlisted: true,
    interviewStatus: "completed",
    interviewToken: "tok_marcus_demo",
    scorecard: sampleScorecard(false),
  },
  {
    id: "c_priya",
    jobId: seedJob.id,
    name: "Priya Raman",
    title: "Senior Backend Engineer",
    company: "Mistral AI",
    location: "Paris, FR",
    skills: ["Go", "gRPC", "Kafka", "Postgres", "Terraform"],
    experienceSummary:
      "7y in distributed data infrastructure. Designed a multi-tenant streaming pipeline serving 1M req/min.",
    source: "linkedin",
    score: {
      total: 87,
      byCriterion: {
        "Technical skills": 90,
        "Seniority indicators": 85,
        "Domain experience": 88,
        "Communication & leadership": 78,
      },
      redFlags: [],
      rationale: "Highly aligned on technical surface and domain. Communication signal from profile is lower confidence.",
    },
    shortlisted: true,
    interviewStatus: "invited",
  },
  {
    id: "c_jordan",
    jobId: seedJob.id,
    name: "Jordan Lee",
    title: "Director of Engineering",
    company: "TinyStartup (5 people)",
    location: "London, UK",
    skills: ["Node.js", "MongoDB", "AWS"],
    experienceSummary: "3y experience. Director title at a 5-person company.",
    source: "linkedin",
    score: {
      total: 54,
      byCriterion: {
        "Technical skills": 58,
        "Seniority indicators": 48,
        "Domain experience": 50,
        "Communication & leadership": 62,
      },
      redFlags: [
        "Title inflation: Director title at 5-person company; scope likely below stated level.",
        "Tech stack misaligned: Node/Mongo vs required Go/Python + Postgres + Kafka.",
      ],
      rationale: "Mixed signal. Title overstates scope and stack only partially overlaps with JD requirements.",
    },
    shortlisted: false,
    interviewStatus: "not_invited",
  },
  {
    id: "c_sofia",
    jobId: seedJob.id,
    name: "Sofia Almeida",
    title: "Senior Engineer",
    company: "N26",
    location: "Lisbon, PT",
    skills: ["Java", "Kafka", "Postgres", "Kubernetes"],
    experienceSummary:
      "9y building banking backends. Owned account-events pipeline. Last 3 jobs in 2 years.",
    source: "indeed",
    score: {
      total: 73,
      byCriterion: {
        "Technical skills": 84,
        "Seniority indicators": 72,
        "Domain experience": 80,
        "Communication & leadership": 60,
      },
      redFlags: ["Frequent job changes: 3 roles in 2 years without an obvious contracting pattern."],
      rationale: "Strong technically but tenure pattern is a yellow flag worth probing in interview.",
    },
    shortlisted: true,
    interviewStatus: "in_progress",
  },
  {
    id: "c_dev",
    jobId: seedJob.id,
    name: "Dev Patel",
    title: "Software Engineer",
    company: "Unknown",
    location: "Remote",
    skills: ["Python"],
    experienceSummary: "Limited profile data available.",
    source: "indeed",
    score: {
      total: 42,
      byCriterion: {
        "Technical skills": 50,
        "Seniority indicators": 35,
        "Domain experience": 30,
        "Communication & leadership": 40,
      },
      redFlags: ["Partial profile: only name, title, and one skill visible. Low confidence."],
      rationale: "Processed at low confidence due to sparse public data.",
    },
    shortlisted: false,
    interviewStatus: "not_invited",
  },
];

export const SEED_JOBS: Job[] = [seedJob];
export const SEED_CANDIDATES: Candidate[] = candidates;
