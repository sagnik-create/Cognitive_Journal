import React, { useState } from "react";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";

export default function AuthPage({ mode, loading, error, onBack, onModeChange, onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isSignup = mode === "signup";

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit(email, password);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-5 py-8 text-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-teal-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Cognitive Mirror</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {isSignup
            ? "Start a private journal memory that only belongs to your account."
            : "Log in to continue with your isolated journal memory."}
        </p>

        {error ? (
          <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100"
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSignup ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            {loading ? "Please wait" : isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => onModeChange(isSignup ? "login" : "signup")}
          className="mt-5 w-full text-center text-sm font-semibold text-teal-700 transition hover:text-slate-950"
        >
          {isSignup ? "Already have an account? Login" : "Need an account? Sign up"}
        </button>
      </section>
    </main>
  );
}
