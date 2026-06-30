import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { chatJSON } from "./ai-gateway.server";
import type { JDAnalysis } from "@/data/types";

const Input = z.object({
  title: z.string().min(2),
  description: z.string().min(20),
});

const SYSTEM = `You are a senior technical recruiter. Analyze a job description and extract structured signals.
Return ONLY JSON matching this shape exactly:
{
  "requiredSkills": [{"name": string, "seniority": "junior"|"mid"|"senior"|"lead"}],
  "preferredSkills": [string],
  "experienceRangeYears": [number, number],
  "roleLevel": "junior"|"mid"|"senior"|"lead",
  "implicitSignals": [string],
  "criteria": [{"name": string, "weight": number}]
}
Rules:
- Include 3-6 required skills with the seniority each one is needed at.
- Include 3-6 preferred skills (no seniority).
- experienceRangeYears: realistic [min, max] integers.
- implicitSignals: 2-4 short bullets surfacing things buried in the JD text (e.g. "fast-paced environment" -> startup tolerance).
- criteria: 3-5 scoring categories, weights summing to 1.0 (e.g. Technical skills, Seniority indicators, Domain experience, Communication & leadership).`;

export const analyzeJobDescription = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Input.parse(input))
  .handler(async ({ data }): Promise<JDAnalysis> => {
    const result = await chatJSON<JDAnalysis>([
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `Job title: ${data.title}\n\nJob description:\n${data.description}`,
      },
    ]);
    return result;
  });
