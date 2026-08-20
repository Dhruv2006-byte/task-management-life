export type Priority = "Low" | "Medium" | "High";
export type Status = "todo" | "in-progress" | "completed";
export type Project = "College" | "Personal" | "Work" | "Study" | "Other";

export interface User {
  fullName: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  project: Project;
  priority: Priority;
  status: Status;
  dueDate: string; // ISO date (YYYY-MM-DD)
  estimate: number; // minutes
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type TasksByUser = Record<string, Task[]>;

export const STATUS_LABEL: Record<Status, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  completed: "Completed",
};

export const PROJECTS: Project[] = ["College", "Personal", "Work", "Study", "Other"];
export const PRIORITIES: Priority[] = ["Low", "Medium", "High"];
export const STATUSES: Status[] = ["todo", "in-progress", "completed"];
