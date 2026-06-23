"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { figures } from "@/lib/data";

// Multi-step taste picker shown after /welcome. No auth, no DB — it writes a
// `figdrop_prefs` blob to localStorage and redirects to the feed. Lives outside
// the (main) route group, so it renders chrome-free like /welcome.

// Figure-type chips. Labels are collector-facing; `values` map to the raw
// `type` strings in lib/data.ts ("Scale Figure" → "Scale", "Action Figure" →
// "Figure"/"Figma") so the home feed can match prefs against figures directly.
const TYPE_OPTIONS: { label: string; values: string[] }[] = [
  { label: "Nendoroid", values: ["Nendoroid"] },
  { label: "Scale Figure", values: ["Scale"] },
  { label: "Model Kit", values: ["Model Kit"] },
  { label: "Action Figure", values: ["Figure", "Figma"] },
];

const BUDGETS: { label: string; value: number | null }[] = [
  { label: "¥5,000", value: 5000 },
  { label: "¥10,000", value: 10000 },
  { label: "¥20,000", value: 20000 },
  { label: "¥50,000", value: 50000 },
  { label: "No limit", value: null },
];

const STEPS = 3;

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        selected
          ? "bg-ink text-white"
          : "border border-line bg-card text-ink hover:border-ink/30"
      }`}
    >
      {children}
    </button>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [series, setSeries] = useState<string[]>([]);
  const [typeLabels, setTypeLabels] = useState<string[]>([]); // [] = "All"
  const [budget, setBudget] = useState<number | null | undefined>(undefined);

  // Franchise chips, derived live from the data (dedupe + drop the honest "—"
  // blanks + sort). Computed once.
  const allSeries = useMemo(
    () =>
      Array.from(new Set(figures.map((f) => f.series)))
        .filter((s) => s && s !== "—")
        .sort((a, b) => a.localeCompare(b)),
    []
  );

  function toggleSeries(s: string) {
    setSeries((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function toggleType(label: string) {
    setTypeLabels((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  }

  function finish() {
    const types = Array.from(
      new Set(
        typeLabels.flatMap(
          (l) => TYPE_OPTIONS.find((t) => t.label === l)?.values ?? []
        )
      )
    );
    const prefs = {
      series,
      types,
      budget: budget === undefined ? null : budget,
    };
    localStorage.setItem("figdrop_prefs", JSON.stringify(prefs));
    router.push("/");
  }

  function advance() {
    if (step < STEPS) setStep(step + 1);
    else finish();
  }

  function back() {
    if (step > 1) setStep(step - 1);
    else router.push("/welcome");
  }

  return (
    <div className="min-h-[100svh] w-full bg-white text-ink">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col px-6 pt-12 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
        {/* Header: wordmark + progress */}
        <div className="space-y-5">
          <span className="text-2xl font-extrabold uppercase tracking-tight text-accent">
            FigDrop
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < step ? "bg-ink" : "bg-line"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step content — fades on each transition (keyed by step). */}
        <div
          key={step}
          className="mt-8 flex-1 animate-[fadeIn_.3s_ease] overflow-y-auto"
        >
          {step === 1 && (
            <Step
              title="Pick your franchises"
              subtitle="What are you collecting? Choose any."
            >
              <div className="flex flex-wrap gap-2">
                {allSeries.map((s) => (
                  <Chip
                    key={s}
                    selected={series.includes(s)}
                    onClick={() => toggleSeries(s)}
                  >
                    {s}
                  </Chip>
                ))}
              </div>
            </Step>
          )}

          {step === 2 && (
            <Step
              title="Figure types"
              subtitle="What formats do you like? Pick any, or all."
            >
              <div className="flex flex-wrap gap-2">
                <Chip
                  selected={typeLabels.length === 0}
                  onClick={() => setTypeLabels([])}
                >
                  All
                </Chip>
                {TYPE_OPTIONS.map((t) => (
                  <Chip
                    key={t.label}
                    selected={typeLabels.includes(t.label)}
                    onClick={() => toggleType(t.label)}
                  >
                    {t.label}
                  </Chip>
                ))}
              </div>
            </Step>
          )}

          {step === 3 && (
            <Step
              title="Budget"
              subtitle="Your usual price ceiling per figure."
            >
              <div className="flex flex-wrap gap-2">
                {BUDGETS.map((b) => (
                  <Chip
                    key={b.label}
                    selected={budget === b.value && budget !== undefined}
                    onClick={() => setBudget(b.value)}
                  >
                    {b.label}
                  </Chip>
                ))}
              </div>
            </Step>
          )}
        </div>

        {/* Footer actions */}
        <div className="space-y-3 pt-6">
          <button
            type="button"
            onClick={advance}
            className="w-full rounded-full bg-ink py-3.5 text-center text-sm font-bold text-white transition hover:opacity-90"
          >
            {step === STEPS ? "Finish" : "Continue"}
          </button>
          <div className="flex items-center justify-between text-sm font-semibold text-dim">
            <button
              type="button"
              onClick={back}
              className="py-1 transition hover:text-ink"
            >
              Back
            </button>
            <button
              type="button"
              onClick={advance}
              className="py-1 transition hover:text-ink"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold leading-tight tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-dim">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
