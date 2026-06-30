import { useEffect, useState } from "react";
import { SEED_CANDIDATES, SEED_JOBS } from "./mock";
import type { Candidate, Job } from "./types";

const JOBS_KEY = "talent_jobs_v1";
const CANDS_KEY = "talent_candidates_v1";

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

function read<T>(key: string, seed: T): T {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as T;
  } catch {
    return seed;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  emit();
}

export const store = {
  getJobs(): Job[] {
    return read<Job[]>(JOBS_KEY, SEED_JOBS);
  },
  getJob(id: string): Job | undefined {
    return store.getJobs().find((j) => j.id === id);
  },
  saveJob(job: Job) {
    const jobs = store.getJobs();
    const idx = jobs.findIndex((j) => j.id === job.id);
    if (idx >= 0) jobs[idx] = job;
    else jobs.unshift(job);
    write(JOBS_KEY, jobs);
  },
  getCandidates(jobId?: string): Candidate[] {
    const all = read<Candidate[]>(CANDS_KEY, SEED_CANDIDATES);
    return jobId ? all.filter((c) => c.jobId === jobId) : all;
  },
  getCandidate(id: string): Candidate | undefined {
    return store.getCandidates().find((c) => c.id === id);
  },
  getCandidateByToken(token: string): Candidate | undefined {
    return store.getCandidates().find((c) => c.interviewToken === token);
  },
  updateCandidate(id: string, patch: Partial<Candidate>) {
    const all = store.getCandidates();
    const idx = all.findIndex((c) => c.id === id);
    if (idx < 0) return;
    all[idx] = { ...all[idx], ...patch };
    write(CANDS_KEY, all);
  },
  subscribe(l: Listener): () => void {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  reset() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(JOBS_KEY);
    localStorage.removeItem(CANDS_KEY);
    emit();
  },
};

function useStoreData<T>(reader: () => T): T {
  const [snap, setSnap] = useState<T>(() => reader());
  useEffect(() => {
    setSnap(reader());
    const unsub = store.subscribe(() => setSnap(reader()));
    return () => {
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return snap;
}

export function useJobs() {
  return useStoreData(() => store.getJobs());
}
export function useJob(id: string) {
  return useStoreData(() => store.getJob(id));
}
export function useCandidates(jobId?: string) {
  return useStoreData(() => store.getCandidates(jobId));
}
export function useCandidate(id: string) {
  return useStoreData(() => store.getCandidate(id));
}
