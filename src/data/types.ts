export type InterviewStatus = "not_invited" | "invited" | "in_progress" | "completed";

export interface JDCriterion {
  name: string;
  weight: number; // 0..1
}

export interface JDAnalysis {
  requiredSkills: { name: string; seniority: "junior" | "mid" | "senior" | "lead" }[];
  preferredSkills: string[];
  experienceRangeYears: [number, number];
  roleLevel: "junior" | "mid" | "senior" | "lead";
  implicitSignals: string[];
  criteria: JDCriterion[]; // categories used for scoring
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  createdAt: string;
  analysis: JDAnalysis;
}

export interface CandidateScore {
  total: number; // 0..100
  byCriterion: Record<string, number>; // criterionName -> 0..100
  redFlags: string[];
  rationale: string;
}

export interface AnswerScore {
  relevance: number;
  clarity: number;
  specificity: number;
  depth: number;
}

export interface InterviewAnswer {
  questionId: string;
  question: string;
  transcript: string;
  summary: string;
  score: AnswerScore;
  fillerCount: number;
  durationSec: number;
}

export interface Scorecard {
  answers: InterviewAnswer[];
  aggregate: AnswerScore;
  recommendation: "strong_hire" | "hire" | "no_hire" | "strong_no_hire";
  confidence: number; // 0..1
  followUpQuestions: string[];
  summary: string;
}

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  title: string;
  company: string;
  location: string;
  skills: string[];
  experienceSummary: string;
  source: "linkedin" | "indeed" | "github" | "stackoverflow";
  profileUrl?: string;
  score: CandidateScore;
  shortlisted: boolean;
  interviewStatus: InterviewStatus;
  interviewToken?: string;
  scorecard?: Scorecard;
}
