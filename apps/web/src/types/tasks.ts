export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface TaskAssignee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface TaskProject {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: string;
  assigneeId: string;
  createdAt: string;
  updatedAt: string;
  assignee: TaskAssignee;
  project: TaskProject;
}

export interface TasksData {
  items: Task[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface TasksResponse {
  success: boolean;
  message: string;
  data: TasksData;
}
