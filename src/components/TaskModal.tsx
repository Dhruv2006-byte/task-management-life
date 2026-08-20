import { useEffect, useState } from "react";
import type { Priority, Project, Status, Task } from "../types";
import { PRIORITIES, PROJECTS, STATUS_LABEL, STATUSES } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  initialTask?: Task | null;
}

function makeEmpty(): Task {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    project: "Personal",
    priority: "Medium",
    status: "todo",
    dueDate: new Date().toISOString().slice(0, 10),
    estimate: 30,
    tags: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function TaskModal({ open, onClose, onSave, initialTask }: Props) {
  const [task, setTask] = useState<Task>(makeEmpty());
  const [tagsInput, setTagsInput] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const base = initialTask ? { ...initialTask } : makeEmpty();
      setTask(base);
      setTagsInput(base.tags.join(", "));
      setTitleError(null);
    }
  }, [open, initialTask]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = task.title.trim();
    if (!trimmedTitle) {
      setTitleError("Task title is required.");
      return;
    }
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const finalTask: Task = {
      ...task,
      title: trimmedTitle,
      description: task.description.trim(),
      tags,
      estimate: Number.isFinite(task.estimate) ? Math.max(0, Number(task.estimate)) : 0,
      updatedAt: new Date().toISOString(),
    };
    onSave(finalTask);
  };

  const isEdit = !!initialTask;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-violet-50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {isEdit ? "Edit Task" : "Create New Task"}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {isEdit ? "Update your task details." : "Add a task to plan your day."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-white text-slate-500 hover:text-slate-800 transition flex items-center justify-center text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={task.title}
              onChange={(e) => {
                setTask({ ...task, title: e.target.value });
                if (titleError && e.target.value.trim()) setTitleError(null);
              }}
              placeholder="e.g. Finish project proposal"
              autoFocus
              className={`w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${
                titleError ? "border-rose-400 focus:ring-rose-200" : "border-slate-200 focus:ring-indigo-200 focus:border-indigo-400"
              }`}
            />
            {titleError && <p className="text-xs text-rose-500 mt-1">{titleError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={task.description}
              onChange={(e) => setTask({ ...task, description: e.target.value })}
              placeholder="Add details, notes, or subtasks..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
              <select
                value={task.project}
                onChange={(e) => setTask({ ...task, project: e.target.value as Project })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
              >
                {PROJECTS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={task.priority}
                onChange={(e) => setTask({ ...task, priority: e.target.value as Priority })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={task.status}
                onChange={(e) => setTask({ ...task, status: e.target.value as Status })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={task.dueDate}
                onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Estimated Time (min)
              </label>
              <input
                type="number"
                min={0}
                value={task.estimate}
                onChange={(e) => setTask({ ...task, estimate: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Urgent, Home"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm shadow-lg shadow-indigo-200 transition"
            >
              {isEdit ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
