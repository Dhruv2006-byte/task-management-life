import type { Task } from "../types";
import { STATUS_LABEL } from "../types";

interface Props {
  task: Task;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  onToggleComplete: (t: Task) => void;
}

const projectColor: Record<string, string> = {
  College: "bg-sky-100 text-sky-700",
  Personal: "bg-emerald-100 text-emerald-700",
  Work: "bg-amber-100 text-amber-700",
  Study: "bg-fuchsia-100 text-fuchsia-700",
  Other: "bg-slate-100 text-slate-700",
};

const priorityColor: Record<string, string> = {
  Low: "bg-slate-100 text-slate-700 border-slate-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  High: "bg-rose-100 text-rose-700 border-rose-200",
};

const statusColor: Record<string, string> = {
  todo: "bg-slate-100 text-slate-700",
  "in-progress": "bg-indigo-100 text-indigo-700",
  completed: "bg-emerald-100 text-emerald-700",
};

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function isOverdue(iso: string, status: string) {
  if (status === "completed" || !iso) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(iso + "T00:00:00");
  return d.getTime() < today.getTime();
}

export function TaskCard({ task, onEdit, onDelete, onToggleComplete }: Props) {
  const overdue = isOverdue(task.dueDate, task.status);
  const done = task.status === "completed";

  return (
    <div
      className={`group relative bg-white rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition p-5 ${
        done ? "opacity-80" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleComplete(task)}
          className={`mt-1 w-6 h-6 rounded-md border-2 flex items-center justify-center transition shrink-0 ${
            done
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-slate-300 hover:border-emerald-500"
          }`}
          aria-label="Toggle complete"
          title={done ? "Mark as incomplete" : "Mark as completed"}
        >
          {done && <span className="text-xs font-bold">✓</span>}
        </button>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-slate-800 leading-snug break-words ${
              done ? "line-through text-slate-400" : ""
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-slate-500 mt-1 line-clamp-2 break-words">{task.description}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-4">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${projectColor[task.project] ?? projectColor.Other}`}>
          {task.project}
        </span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${priorityColor[task.priority]}`}>
          {task.priority === "High" && "🔥 "}
          {task.priority}
        </span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[task.status]}`}>
          {STATUS_LABEL[task.status]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span>📅</span>
          <span className={overdue ? "text-rose-600 font-semibold" : ""}>
            {formatDate(task.dueDate)}
            {overdue && " (overdue)"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>⏱</span>
          <span>{task.estimate || 0} min</span>
        </div>
      </div>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {task.tags.map((t) => (
            <span
              key={t}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
        <button
          onClick={() => onEdit(task)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
        >
          ✎ Edit
        </button>
        <button
          onClick={() => onToggleComplete(task)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
            done
              ? "bg-amber-100 hover:bg-amber-200 text-amber-700"
              : "bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
          }`}
        >
          {done ? "↺ Reopen" : "✓ Complete"}
        </button>
        <button
          onClick={() => onDelete(task)}
          className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
}
