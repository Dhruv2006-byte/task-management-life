import { useMemo, useState } from "react";
import type { Priority, Project, Status, Task, User } from "../types";
import { PRIORITIES, PROJECTS, STATUS_LABEL, STATUSES } from "../types";
import { getTasksForUser, setTasksForUser } from "../storage";
import { TaskCard } from "./TaskCard";
import { TaskModal } from "./TaskModal";
import { ConfirmDialog } from "./ConfirmDialog";

interface Props {
  user: User;
  onLogout: () => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

type SectionTab = "today" | "upcoming" | "completed" | "all";
type DueFilter = "any" | "today" | "week" | "overdue" | "none";

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function todayISO() {
  return iso(new Date());
}

function isSameDate(a: string, b: string) {
  return a === b;
}

function daysBetween(dateStr: string) {
  if (!dateStr) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function Dashboard({ user, onLogout, showToast }: Props) {
  const [tasks, setTasks] = useState<Task[]>(() => getTasksForUser(user.email));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  // filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [filterProject, setFilterProject] = useState<Project | "all">("all");
  const [filterDue, setFilterDue] = useState<DueFilter>("any");
  const [tab, setTab] = useState<SectionTab>("today");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const persist = (next: Task[]) => {
    setTasks(next);
    setTasksForUser(user.email, next);
  };

  const handleSave = (task: Task) => {
    const exists = tasks.some((t) => t.id === task.id);
    let next: Task[];
    if (exists) {
      next = tasks.map((t) => (t.id === task.id ? task : t));
      persist(next);
      showToast("Task updated successfully");
    } else {
      next = [task, ...tasks];
      persist(next);
      showToast("Task created successfully");
    }
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const next = tasks.filter((t) => t.id !== deleteTarget.id);
    persist(next);
    setDeleteTarget(null);
    showToast("Task deleted", "info");
  };

  const handleToggleComplete = (t: Task) => {
    const next = tasks.map((x) =>
      x.id === t.id
        ? {
            ...x,
            status: (x.status === "completed" ? "todo" : "completed") as Status,
            updatedAt: new Date().toISOString(),
          }
        : x,
    );
    persist(next);
    showToast(
      t.status === "completed" ? "Task marked as pending" : "Task marked as completed",
      t.status === "completed" ? "info" : "success",
    );
  };

  // ------------- Filtering -------------
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (filterPriority !== "all" && t.priority !== filterPriority) return false;
      if (filterProject !== "all" && t.project !== filterProject) return false;

      if (filterDue !== "any") {
        const diff = daysBetween(t.dueDate);
        if (filterDue === "today" && diff !== 0) return false;
        if (filterDue === "week" && (diff < 0 || diff > 7)) return false;
        if (filterDue === "overdue" && !(diff < 0 && t.status !== "completed")) return false;
        if (filterDue === "none" && t.dueDate) return false;
      }

      if (q) {
        const hay = (
          t.title +
          " " +
          t.description +
          " " +
          t.project +
          " " +
          t.tags.join(" ")
        ).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tasks, search, filterStatus, filterPriority, filterProject, filterDue]);

  // Section grouping (uses filtered tasks)
  const today = todayISO();
  const sections = useMemo(() => {
    const todays = filtered.filter(
      (t) => isSameDate(t.dueDate, today) && t.status !== "completed",
    );
    const upcoming = filtered.filter((t) => {
      const diff = daysBetween(t.dueDate);
      return diff > 0 && t.status !== "completed";
    });
    const completed = filtered.filter((t) => t.status === "completed");
    return { todays, upcoming, completed, all: filtered };
  }, [filtered, today]);

  // Stats (based on ALL tasks, not filtered)
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const pending = total - completed;
    const high = tasks.filter((t) => t.priority === "High" && t.status !== "completed").length;
    const overdue = tasks.filter(
      (t) => t.status !== "completed" && daysBetween(t.dueDate) < 0,
    ).length;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, high, overdue, percent };
  }, [tasks]);

  const activeList =
    tab === "today"
      ? sections.todays
      : tab === "upcoming"
      ? sections.upcoming
      : tab === "completed"
      ? sections.completed
      : sections.all;

  const resetFilters = () => {
    setSearch("");
    setFilterStatus("all");
    setFilterPriority("all");
    setFilterProject("all");
    setFilterDue("any");
  };

  const anyFilterActive =
    !!search ||
    filterStatus !== "all" ||
    filterPriority !== "all" ||
    filterProject !== "all" ||
    filterDue !== "any";

  const initials = user.fullName
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const dateStr = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-lg text-slate-800">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow">
              ✓
            </span>
            <span className="hidden sm:inline">TaskFlow</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => {
                setEditingTask(null);
                setModalOpen(true);
              }}
              className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold px-4 py-2 rounded-xl shadow-lg shadow-indigo-200 text-sm transition"
            >
              <span className="text-base leading-none">+</span> New Task
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center text-sm font-semibold">
                {initials || "U"}
              </div>
              <div className="hidden md:block text-sm">
                <div className="font-semibold text-slate-800 leading-tight">{user.fullName}</div>
                <div className="text-slate-500 text-xs leading-tight">{user.email}</div>
              </div>
            </div>
            <button
              onClick={() => setLogoutConfirm(true)}
              className="text-sm font-medium text-slate-600 hover:text-rose-600 px-3 py-2 rounded-lg hover:bg-rose-50 transition"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero */}
        <section className="rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="uppercase tracking-widest text-white/70 text-xs font-semibold">
                Task Management for Daily Life
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold mt-2">
                Welcome back, {user.fullName.split(" ")[0]} 👋
              </h1>
              <p className="text-white/80 mt-1">{dateStr}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-white/70 text-xs font-medium">Progress today</div>
                <div className="text-2xl font-bold">{stats.percent}%</div>
              </div>
              <div className="w-16 h-16 rounded-full bg-white/15 border-4 border-white/30 flex items-center justify-center relative">
                <svg viewBox="0 0 36 36" className="w-16 h-16 absolute inset-0 -rotate-90">
                  <path
                    d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32"
                    fill="none"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2a16 16 0 1 1 0 32 16 16 0 1 1 0-32"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeDasharray={`${stats.percent}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-sm font-bold">{stats.completed}/{stats.total || 0}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Tasks" value={stats.total} icon="📋" tint="from-indigo-50 to-indigo-100" text="text-indigo-700" />
          <StatCard label="Completed" value={stats.completed} icon="✅" tint="from-emerald-50 to-emerald-100" text="text-emerald-700" />
          <StatCard label="Pending" value={stats.pending} icon="🕒" tint="from-amber-50 to-amber-100" text="text-amber-700" />
          <StatCard label="High Priority" value={stats.high} icon="🔥" tint="from-rose-50 to-rose-100" text="text-rose-700" />
        </section>

        {/* Controls */}
        <section className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4 sm:p-5">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, description, project, or tag..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition ${
                  filtersOpen || anyFilterActive
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                ⚙ Filters
                {anyFilterActive && (
                  <span className="ml-2 bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    on
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setEditingTask(null);
                  setModalOpen(true);
                }}
                className="sm:hidden inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-200 text-sm"
              >
                + New
              </button>
            </div>
          </div>

          {filtersOpen && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <SelectField
                label="Status"
                value={filterStatus}
                onChange={(v) => setFilterStatus(v as Status | "all")}
                options={[
                  { value: "all", label: "All statuses" },
                  ...STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] })),
                ]}
              />
              <SelectField
                label="Priority"
                value={filterPriority}
                onChange={(v) => setFilterPriority(v as Priority | "all")}
                options={[
                  { value: "all", label: "All priorities" },
                  ...PRIORITIES.map((p) => ({ value: p, label: p })),
                ]}
              />
              <SelectField
                label="Project"
                value={filterProject}
                onChange={(v) => setFilterProject(v as Project | "all")}
                options={[
                  { value: "all", label: "All projects" },
                  ...PROJECTS.map((p) => ({ value: p, label: p })),
                ]}
              />
              <SelectField
                label="Due Date"
                value={filterDue}
                onChange={(v) => setFilterDue(v as DueFilter)}
                options={[
                  { value: "any", label: "Any time" },
                  { value: "today", label: "Due today" },
                  { value: "week", label: "Next 7 days" },
                  { value: "overdue", label: "Overdue" },
                  { value: "none", label: "No due date" },
                ]}
              />
              {anyFilterActive && (
                <button
                  onClick={resetFilters}
                  className="col-span-2 md:col-span-4 text-xs font-semibold text-indigo-600 hover:text-indigo-700 self-start"
                >
                  Reset all filters ×
                </button>
              )}
            </div>
          )}
        </section>

        {/* Tabs */}
        <section>
          <div className="flex flex-wrap gap-2 border-b border-slate-200 mb-4">
            <Tab active={tab === "today"} onClick={() => setTab("today")} label="Today's Tasks" count={sections.todays.length} />
            <Tab active={tab === "upcoming"} onClick={() => setTab("upcoming")} label="Upcoming" count={sections.upcoming.length} />
            <Tab active={tab === "completed"} onClick={() => setTab("completed")} label="Completed" count={sections.completed.length} />
            <Tab active={tab === "all"} onClick={() => setTab("all")} label="All Tasks" count={sections.all.length} />
          </div>

          {activeList.length === 0 ? (
            <EmptyState
              hasAnyTasks={tasks.length > 0}
              onCreate={() => {
                setEditingTask(null);
                setModalOpen(true);
              }}
            />
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {activeList.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onEdit={(t) => {
                    setEditingTask(t);
                    setModalOpen(true);
                  }}
                  onDelete={(t) => setDeleteTarget(t)}
                  onToggleComplete={handleToggleComplete}
                />
              ))}
            </div>
          )}
        </section>

        {/* Stats footer */}
        {tasks.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Quick insights</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <Insight label="Completion rate" value={`${stats.percent}%`} />
              <Insight label="Overdue tasks" value={stats.overdue} tone={stats.overdue ? "danger" : "default"} />
              <Insight label="Active projects" value={new Set(tasks.map((t) => t.project)).size} />
              <Insight
                label="Total estimated time"
                value={`${Math.round(tasks.reduce((a, t) => a + (t.estimate || 0), 0) / 60 * 10) / 10}h`}
              />
            </div>
          </section>
        )}

        <footer className="text-center text-xs text-slate-400 pt-4 pb-6">
          Data is stored privately in your browser. © {new Date().getFullYear()} TaskFlow.
        </footer>
      </main>

      <TaskModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSave}
        initialTask={editingTask}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this task?"
        message={`"${deleteTarget?.title ?? ""}" will be permanently removed. This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={logoutConfirm}
        title="Log out?"
        message="Your tasks will remain safely stored on this device."
        confirmLabel="Log out"
        onConfirm={() => {
          setLogoutConfirm(false);
          onLogout();
        }}
        onCancel={() => setLogoutConfirm(false)}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tint,
  text,
}: {
  label: string;
  value: number;
  icon: string;
  tint: string;
  text: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4 sm:p-5 flex items-center gap-4 hover:shadow-md transition">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tint} ${text} flex items-center justify-center text-xl`}>
        {icon}
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
        <div className="text-2xl font-bold text-slate-800 mt-0.5">{value}</div>
      </div>
    </div>
  );
}

function Tab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2.5 text-sm font-semibold transition -mb-px border-b-2 ${
        active
          ? "text-indigo-700 border-indigo-600"
          : "text-slate-500 hover:text-slate-800 border-transparent"
      }`}
    >
      {label}
      <span
        className={`ml-2 text-[11px] px-1.5 py-0.5 rounded-full ${
          active ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Insight({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "danger";
}) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
      <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
      <div className={`text-xl font-bold mt-1 ${tone === "danger" ? "text-rose-600" : "text-slate-800"}`}>
        {value}
      </div>
    </div>
  );
}

function EmptyState({ hasAnyTasks, onCreate }: { hasAnyTasks: boolean; onCreate: () => void }) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
      <div className="text-5xl mb-3">🗂</div>
      <h3 className="text-lg font-bold text-slate-800">
        {hasAnyTasks ? "No tasks match this view" : "You have no tasks yet"}
      </h3>
      <p className="text-slate-500 mt-1 text-sm">
        {hasAnyTasks
          ? "Try adjusting your filters, search, or switching tabs."
          : "Create your first task to start organizing your day."}
      </p>
      {!hasAnyTasks && (
        <button
          onClick={onCreate}
          className="mt-5 inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 text-sm transition"
        >
          + Create your first task
        </button>
      )}
    </div>
  );
}
