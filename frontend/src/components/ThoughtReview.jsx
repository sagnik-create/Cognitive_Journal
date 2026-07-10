import React from "react";
import { Brain, RefreshCw } from "lucide-react";

const sections = [
  ["patterns", "Patterns"],
  ["weaknesses", "Weaknesses"],
  ["personality", "Personality"],
  ["emotional_cycles", "Emotional Cycles"],
  ["behavior_loops", "Behavior Loops"],
  ["growth_suggestions", "Suggestions"],
];

export default function ThoughtReview({ review, loading, onReview }) {
  return (
    <aside className="border-t border-slate-200 bg-[#f7f9fb] px-5 py-5 md:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
            <Brain className="h-4 w-4" />
            Thought Review
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Patterns across your journal memory</h2>
        </div>
        <button
          type="button"
          onClick={onReview}
          disabled={loading}
          className="flex h-11 items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-slate-950 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Reviewing" : "Review My Mind"}
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {sections.map(([key, label]) => {
          const items = review?.[key] || [];
          return (
            <section key={key} className="min-h-40 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-950">{label}</h3>
              {loading ? (
                <div className="mt-4 space-y-3">
                  <div className="h-3 w-11/12 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-8/12 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-10/12 animate-pulse rounded bg-slate-200" />
                </div>
              ) : items.length ? (
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  {items.map((item) => (
                    <li key={item} className="border-l-2 border-teal-200 pl-3">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Add entries, then generate a review to surface long-term signals.
                </p>
              )}
            </section>
          );
        })}
      </div>
    </aside>
  );
}
