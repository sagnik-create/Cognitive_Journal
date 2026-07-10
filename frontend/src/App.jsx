import React from "react";
import { useEffect, useMemo, useState } from "react";
import AuthPage from "./components/AuthPage.jsx";
import Sidebar from "./components/Sidebar.jsx";
import JournalComposer from "./components/JournalComposer.jsx";
import EntryView from "./components/EntryView.jsx";
import LandingPage from "./components/LandingPage.jsx";
import ThoughtReview from "./components/ThoughtReview.jsx";
import { clearToken, fetchEntries, fetchMe, getToken, login, requestReview, signup, submitEntry } from "./lib/api.js";

export default function App() {
  const [screen, setScreen] = useState(getToken() ? "dashboard" : "landing");
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [review, setReview] = useState(null);
  const [booting, setBooting] = useState(Boolean(getToken()));
  const [authLoading, setAuthLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState("");

  const activeEntry = useMemo(
    () => entries.find((entry) => entry.entry_id === activeId) || entries[0],
    [entries, activeId],
  );

  useEffect(() => {
    if (!getToken()) return;
    fetchMe()
      .then((data) => {
        setUser(data.user);
        setScreen("dashboard");
        return loadEntries();
      })
      .catch(() => {
        clearToken();
        setUser(null);
        setScreen("landing");
      })
      .finally(() => setBooting(false));
  }, []);

  async function loadEntries() {
    const data = await fetchEntries();
    setEntries(data.entries || []);
    setActiveId(data.entries?.[0]?.entry_id || null);
  }

  async function handleAuth(email, password) {
    setAuthLoading(true);
    setError("");
    try {
      const data = screen === "signup" ? await signup(email, password) : await login(email, password);
      setUser(data.user);
      setReview(null);
      setScreen("dashboard");
      await loadEntries();
    } catch (err) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    clearToken();
    setUser(null);
    setEntries([]);
    setActiveId(null);
    setReview(null);
    setError("");
    setScreen("landing");
  }

  async function handleSubmit(text) {
    setSubmitting(true);
    setError("");
    try {
      const entry = await submitEntry(text);
      setEntries((current) => [entry, ...current]);
      setActiveId(entry.entry_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReview() {
    setReviewing(true);
    setError("");
    try {
      const data = await requestReview();
      setReview(data.review);
    } catch (err) {
      setError(err.message);
    } finally {
      setReviewing(false);
    }
  }

  if (booting) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] text-sm font-semibold text-slate-500">
        Opening your mirror...
      </main>
    );
  }

  if (screen === "landing") {
    return <LandingPage onLogin={() => setScreen("login")} onSignup={() => setScreen("signup")} />;
  }

  if (screen === "login" || screen === "signup") {
    return (
      <AuthPage
        mode={screen}
        loading={authLoading}
        error={error}
        onBack={() => {
          setError("");
          setScreen("landing");
        }}
        onModeChange={(nextMode) => {
          setError("");
          setScreen(nextMode);
        }}
        onSubmit={handleAuth}
      />
    );
  }

  return (
    <main className="h-screen overflow-hidden bg-[#eef2f6] text-slate-900">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col overflow-hidden bg-white shadow-soft md:flex-row">
        <Sidebar
          entries={entries}
          activeId={activeEntry?.entry_id}
          user={user}
          onLogout={handleLogout}
          onSelect={setActiveId}
        />

        <section className="flex min-w-0 flex-1 flex-col bg-[#f7f9fb]">
          <JournalComposer onSubmit={handleSubmit} loading={submitting} />

          {error ? (
            <div className="mx-5 mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 md:mx-8">
              {error}
            </div>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto">
            <EntryView entry={activeEntry} />
            <ThoughtReview review={review} loading={reviewing} onReview={handleReview} />
          </div>
        </section>
      </div>
    </main>
  );
}
