import React from "react";
import { Brain, LockKeyhole, Sparkles, Users } from "lucide-react";

const features = [
  ["Private memory", "Every account gets an isolated journal memory and recall context.", LockKeyhole],
  ["Personalized insight", "Reflections connect today's entry with your own recurring patterns.", Sparkles],
  ["Long-term mirror", "Reviews surface emotional cycles, behavior loops, and growth signals.", Brain],
];

export default function LandingPage({ onLogin, onSignup }) {
  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-between px-6 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Brain className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-600">Cognitive Mirror</span>
          </div>
          <button
            type="button"
            onClick={onLogin}
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700"
          >
            Login
          </button>
        </nav>

        <div className="grid items-center gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Journal-based AI memory</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight text-slate-950 md:text-6xl">
              A private mirror for the patterns behind your thoughts.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Write or speak what happened. Cognitive Mirror remembers your reflections, retrieves the relevant past,
              and returns structured insight that is specific to your emotional history.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onSignup}
                className="h-12 rounded-lg bg-slate-950 px-6 text-sm font-semibold text-white shadow-soft transition hover:bg-teal-700"
              >
                Get Started
              </button>
              <button
                type="button"
                onClick={onLogin}
                className="h-12 rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700"
              >
                Login
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Users className="h-5 w-5 text-teal-700" />
              <div>
                <h2 className="text-base font-semibold text-slate-950">Built for individual context</h2>
                <p className="text-sm text-slate-500">No shared journal memory between accounts.</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {features.map(([title, description, Icon]) => (
                <div key={title} className="flex gap-3">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
