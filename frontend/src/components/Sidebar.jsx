import React from "react";
import { CalendarDays, LogOut } from "lucide-react";

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function groupEntries(entries) {
  return entries.reduce((groups, entry) => {
    const date = dateFormatter.format(new Date(entry.timestamp));
    groups[date] = groups[date] || [];
    groups[date].push(entry);
    return groups;
  }, {});
}

export default function Sidebar({ entries, activeId, user, onLogout, onSelect }) {
  const groups = groupEntries(entries);

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-slate-200 bg-white/82 backdrop-blur md:w-80">
      <div className="border-b border-slate-200 px-5 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Cognitive Mirror</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">Journal Memory</h1>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="min-w-0 truncate text-xs font-medium text-slate-500">{user?.email}</p>
          <button
            type="button"
            onClick={onLogout}
            title="Logout"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-rose-300 hover:text-rose-700"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {entries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
            Your entries will gather here by date after the first reflection.
          </div>
        ) : (
          Object.entries(groups).map(([date, dateEntries]) => (
            <section key={date} className="mb-5">
              <div className="mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                <CalendarDays className="h-3.5 w-3.5" />
                {date}
              </div>
              <div className="space-y-2">
                {dateEntries.map((entry) => {
                  const active = entry.entry_id === activeId;
                  return (
                    <button
                      key={entry.entry_id}
                      type="button"
                      onClick={() => onSelect(entry.entry_id)}
                      className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                        active
                          ? "border-teal-500 bg-teal-50 shadow-sm"
                          : "border-transparent bg-transparent hover:border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <p className="line-clamp-1 text-sm font-semibold text-slate-900">{entry.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{entry.text}</p>
                    </button>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </aside>
  );
}
