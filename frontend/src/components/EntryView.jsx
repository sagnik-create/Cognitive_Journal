import React from "react";
const insightLabels = [
  ["emotions", "Emotions"],
  ["patterns", "Patterns"],
  ["insights", "Insights"],
  ["suggestions", "Suggestions"],
];

export default function EntryView({ entry }) {
  if (!entry) {
    return (
      <section className="flex flex-1 items-center justify-center px-6 py-16 text-center">
        <div className="max-w-md">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Ready when you are</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">Start with one honest entry.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            The mirror builds from patterns over time, but the first signal is simply what is true today.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 px-5 py-6 md:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          {new Date(entry.timestamp).toLocaleString()}
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-950">{entry.title}</h2>
      </div>

      <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="whitespace-pre-wrap text-base leading-8 text-slate-700">{entry.text}</p>
      </article>

      {entry.insights?.summary || entry.insights?.uniqueness_note ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {entry.insights?.summary ? (
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-950">Summary</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{entry.insights.summary}</p>
            </section>
          ) : null}
          {entry.insights?.uniqueness_note ? (
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-950">What Changed</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{entry.insights.uniqueness_note}</p>
            </section>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {insightLabels.map(([key, label]) => {
          const values = entry.insights?.[key] || [];
          return (
            <div key={key} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-950">{label}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {values.length ? (
                  values.map((value) => (
                    <span key={value} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                      {value}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">No strong signal yet</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
