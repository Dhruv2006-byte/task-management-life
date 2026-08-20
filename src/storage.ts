import type { Task, TasksByUser, User } from "./types";

const USERS_KEY = "task_management_users";
const CURRENT_USER_KEY = "task_management_current_user";
const TASKS_KEY = "task_management_tasks";

// -------------------- Users --------------------
export function getUsers(): Record<string, User> {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, User>;
  } catch {
    return {};
  }
}

export function saveUsers(users: Record<string, User>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerUser(user: User): { ok: boolean; error?: string } {
  const users = getUsers();
  const key = user.email.trim().toLowerCase();
  if (users[key]) {
    return { ok: false, error: "An account with this email already exists." };
  }
  users[key] = { ...user, email: key };
  saveUsers(users);
  return { ok: true };
}

export function verifyUser(email: string, password: string): User | null {
  const users = getUsers();
  const key = email.trim().toLowerCase();
  const u = users[key];
  if (!u) return null;
  if (u.password !== password) return null;
  return u;
}

// -------------------- Session --------------------
export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null) {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
}

// -------------------- Tasks --------------------
export function getAllTasks(): TasksByUser {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as TasksByUser;
  } catch {
    return {};
  }
}

export function saveAllTasks(tasks: TasksByUser) {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function getTasksForUser(email: string): Task[] {
  const all = getAllTasks();
  return all[email.toLowerCase()] ?? [];
}

export function setTasksForUser(email: string, tasks: Task[]) {
  const all = getAllTasks();
  all[email.toLowerCase()] = tasks;
  saveAllTasks(all);
}

// -------------------- Demo seed --------------------
export function seedDemoIfNeeded() {
  const users = getUsers();
  const demoEmail = "demo@example.com";
  if (!users[demoEmail]) {
    users[demoEmail] = {
      fullName: "Demo User",
      email: demoEmail,
      password: "demo123",
      createdAt: new Date().toISOString(),
    };
    saveUsers(users);
  }

  const all = getAllTasks();
  if (!all[demoEmail] || all[demoEmail].length === 0) {
    const today = new Date();
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const addDays = (days: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + days);
      return iso(d);
    };
    const now = new Date().toISOString();
    all[demoEmail] = [
      {
        id: crypto.randomUUID(),
        title: "Complete React assignment",
        description: "Finish the component design homework for class.",
        project: "College",
        priority: "High",
        status: "todo",
        dueDate: iso(today),
        estimate: 90,
        tags: ["College", "Important"],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        title: "Grocery shopping",
        description: "Buy vegetables, fruits, milk, and coffee.",
        project: "Personal",
        priority: "Medium",
        status: "in-progress",
        dueDate: addDays(1),
        estimate: 45,
        tags: ["Home", "Errand"],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        title: "Weekly team sync",
        description: "Discuss sprint progress and blockers.",
        project: "Work",
        priority: "Low",
        status: "completed",
        dueDate: addDays(-1),
        estimate: 30,
        tags: ["Meeting"],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        title: "Read chapter 5 — Algorithms",
        description: "Focus on dynamic programming examples.",
        project: "Study",
        priority: "High",
        status: "todo",
        dueDate: addDays(3),
        estimate: 120,
        tags: ["Study", "DSA"],
        createdAt: now,
        updatedAt: now,
      },
    ];
    saveAllTasks(all);
  }
}
