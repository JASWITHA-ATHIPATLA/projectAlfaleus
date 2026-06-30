import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { store } from "@/data/store";
import { Video, Mic, AlertCircle, CheckCircle2, Loader2, Play, Square } from "lucide-react";

export const Route = createFileRoute("/interview/$token")({
  head: () => ({
    meta: [
      { title: "Your interview — Lumen Hire" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Interview,
});

interface Q {
  id: string;
  text: string;
  thinkSec: number;
  maxSec: number;
}

const DEFAULT_QUESTIONS: Q[] = [
  {
    id: "q1",
    text: "Walk us through a project you're most proud of. What was your specific role and the outcome?",
    thinkSec: 30,
    maxSec: 180,
  },
  {
    id: "q2",
    text: "Tell us about a time you disagreed with a teammate on a technical decision. How did you handle it?",
    thinkSec: 30,
    maxSec: 180,
  },
  {
    id: "q3",
    text: "What's the most challenging technical problem you've solved in the last year?",
    thinkSec: 30,
    maxSec: 180,
  },
];

type Phase = "intro" | "ready" | "thinking" | "recording" | "submitted" | "review" | "done";

function Interview() {
  const { token } = Route.useParams();
  const candidate = typeof window !== "undefined" ? store.getCandidateByToken(token) : undefined;
  const [questions] = useState<Q[]>(DEFAULT_QUESTIONS);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [thinkLeft, setThinkLeft] = useState(0);
  const [recLeft, setRecLeft] = useState(0);
  const [submitted, setSubmitted] = useState<Record<string, { blob: Blob; durationSec: number }>>({});
  const [permError, setPermError] = useState<string | null>(null);
  const [uploadingPct, setUploadingPct] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);

  const q = questions[idx];

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  async function ensureStream() {
    if (streamRef.current) return streamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      return stream;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Permission") || msg.includes("NotAllowed")) {
        setPermError(
          "We need access to your camera and microphone to record your answers. Please allow access in your browser, then refresh this page.",
        );
      } else if (msg.includes("NotFound")) {
        setPermError("No camera or microphone was found on this device.");
      } else {
        setPermError(`Could not start recording (${msg}). Try refreshing the page.`);
      }
      throw err;
    }
  }

  async function startQuestion() {
    setPhase("thinking");
    setThinkLeft(q.thinkSec);
    try {
      await ensureStream();
    } catch {
      setPhase("ready");
      return;
    }
    tickRef.current = setInterval(() => {
      setThinkLeft((s) => {
        if (s <= 1) {
          if (tickRef.current) clearInterval(tickRef.current);
          beginRecording();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  function beginRecording() {
    const stream = streamRef.current;
    if (!stream) return;
    chunksRef.current = [];
    const rec = new MediaRecorder(stream, { mimeType: "video/webm" });
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const duration = Math.round((Date.now() - startedAtRef.current) / 1000);
      // Simulate chunked upload with retries
      await fakeChunkedUpload(blob, setUploadingPct);
      setUploadingPct(null);
      setSubmitted((prev) => ({ ...prev, [q.id]: { blob, durationSec: duration } }));
      setPhase("submitted");
    };
    // Chunked recording so we can flush per-chunk to the backend in a real build
    rec.start(1000);
    recorderRef.current = rec;
    startedAtRef.current = Date.now();
    setRecLeft(q.maxSec);
    setPhase("recording");
    tickRef.current = setInterval(() => {
      setRecLeft((s) => {
        if (s <= 1) {
          if (tickRef.current) clearInterval(tickRef.current);
          stopRecording();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  function stopRecording() {
    if (tickRef.current) clearInterval(tickRef.current);
    recorderRef.current?.stop();
  }

  function next() {
    if (idx < questions.length - 1) {
      setIdx(idx + 1);
      setPhase("ready");
    } else {
      setPhase("review");
    }
  }

  function submitAll() {
    if (candidate) {
      store.updateCandidate(candidate.id, { interviewStatus: "completed" });
    }
    setPhase("done");
  }

  if (!candidate && typeof window !== "undefined") {
    return (
      <Frame>
        <div className="text-center max-w-md">
          <AlertCircle className="h-8 w-8 text-warning mx-auto mb-3" />
          <h1 className="text-xl font-semibold mb-2">This link is no longer valid</h1>
          <p className="text-muted-foreground text-sm">
            Please contact your recruiter to request a new interview link.
          </p>
        </div>
      </Frame>
    );
  }

  return (
    <Frame>
      <div className="w-full max-w-2xl">
        {/* Progress */}
        {phase !== "intro" && phase !== "done" && (
          <div className="flex items-center gap-2 mb-6">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${
                  i < idx || (i === idx && (phase === "submitted" || phase === "review"))
                    ? "bg-primary"
                    : i === idx
                      ? "bg-primary/40"
                      : "bg-secondary"
                }`}
              />
            ))}
          </div>
        )}

        {phase === "intro" && (
          <div className="card-elev p-8">
            <h1 className="text-2xl font-semibold mb-3">Welcome{candidate ? `, ${candidate.name.split(" ")[0]}` : ""}</h1>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              You&apos;ll answer {questions.length} questions on video. For each one you&apos;ll have:
            </p>
            <ul className="space-y-3 mb-6 text-sm">
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-secondary text-secondary-foreground grid place-items-center text-xs font-semibold shrink-0">
                  30s
                </span>
                <span>Think time before the camera starts recording.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-semibold shrink-0">
                  3m
                </span>
                <span>Recording time per answer. You can stop early when you&apos;re done.</span>
              </li>
              <li className="flex items-start gap-3">
                <Video className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span>Answers cannot be re-recorded once submitted, so take your time during think time.</span>
              </li>
            </ul>
            {permError && (
              <p className="text-sm bg-warning/10 border border-warning/40 text-warning-foreground rounded-md p-3 mb-4">
                {permError}
              </p>
            )}
            <button
              onClick={async () => {
                try {
                  await ensureStream();
                  setPhase("ready");
                } catch {
                  /* permError set */
                }
              }}
              className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 inline-flex items-center justify-center gap-2"
            >
              <Mic className="h-4 w-4" />
              Test camera & start
            </button>
          </div>
        )}

        {(phase === "ready" || phase === "thinking" || phase === "recording" || phase === "submitted") && (
          <div className="card-elev overflow-hidden">
            <div className="relative bg-black aspect-video">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              {phase === "recording" && (
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-destructive text-destructive-foreground px-2.5 h-7 rounded-md text-xs font-medium">
                  <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                  REC · {fmt(recLeft)}
                </div>
              )}
              {phase === "thinking" && (
                <div className="absolute inset-0 grid place-items-center bg-black/60">
                  <div className="text-center text-white">
                    <p className="text-sm uppercase tracking-widest opacity-80">Think time</p>
                    <p className="text-6xl font-semibold tabular-nums my-2">{thinkLeft}</p>
                    <p className="text-xs opacity-70">Recording will start automatically</p>
                  </div>
                </div>
              )}
              {phase === "submitted" && uploadingPct !== null && (
                <div className="absolute inset-0 grid place-items-center bg-black/70">
                  <div className="text-center text-white">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin mb-2" />
                    <p className="text-sm">Uploading answer… {uploadingPct}%</p>
                    <p className="text-xs opacity-70 mt-1">Safe to keep the tab open</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Question {idx + 1} of {questions.length}
              </p>
              <h2 className="text-xl font-medium leading-snug mb-5">{q.text}</h2>

              {phase === "ready" && (
                <button
                  onClick={startQuestion}
                  className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 inline-flex items-center justify-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start think time
                </button>
              )}
              {phase === "recording" && (
                <button
                  onClick={stopRecording}
                  className="w-full h-11 rounded-md bg-destructive text-destructive-foreground font-medium hover:bg-destructive/90 inline-flex items-center justify-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  I&apos;m done — submit answer
                </button>
              )}
              {phase === "submitted" && uploadingPct === null && (
                <div className="space-y-3">
                  <p className="text-sm flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    Answer submitted.
                  </p>
                  <button
                    onClick={next}
                    className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                  >
                    {idx < questions.length - 1 ? "Next question" : "Review & submit interview"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {phase === "review" && (
          <div className="card-elev p-6">
            <h2 className="text-xl font-semibold mb-1">Review</h2>
            <p className="text-muted-foreground text-sm mb-5">
              All {questions.length} answers recorded. Submit to send your interview to the recruiter.
            </p>
            <ul className="space-y-2 mb-6">
              {questions.map((qq, i) => (
                <li
                  key={qq.id}
                  className="flex items-center justify-between gap-3 text-sm p-3 rounded-md bg-surface-2"
                >
                  <span className="truncate">
                    Q{i + 1}. {qq.text}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-success text-xs shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Submitted
                  </span>
                </li>
              ))}
            </ul>
            <button
              onClick={submitAll}
              className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90"
            >
              Submit interview
            </button>
          </div>
        )}

        {phase === "done" && (
          <div className="card-elev p-10 text-center">
            <div className="h-12 w-12 rounded-full bg-success/15 grid place-items-center mx-auto mb-4">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Thank you</h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Your interview has been submitted. The recruiting team will review it and get back to
              you. You can safely close this tab.
            </p>
          </div>
        )}
      </div>
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border py-4">
        <div className="mx-auto max-w-2xl px-6 flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center text-xs font-bold">
            L
          </div>
          <span className="font-semibold text-sm">Lumen Hire</span>
          <span className="text-xs text-muted-foreground ml-auto">Async video interview</span>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-10">{children}</main>
    </div>
  );
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

async function fakeChunkedUpload(blob: Blob, onProgress: (pct: number) => void) {
  // Simulate 5 chunks with a tiny artificial delay; in production each chunk
  // would POST to the backend with resume-on-failure semantics.
  const chunks = 5;
  void blob;
  for (let i = 1; i <= chunks; i++) {
    await new Promise((r) => setTimeout(r, 180));
    onProgress(Math.round((i / chunks) * 100));
  }
}
