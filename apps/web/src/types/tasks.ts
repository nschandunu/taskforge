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
  title: string;
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

export interface TaskComment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: TaskAssignee;
}

export interface TaskCommentsData {
  items: TaskComment[];
}

export interface TaskCommentsResponse {
  success: boolean;
  message: string;
  data: TaskCommentsData;
}

export interface TaskDetailsResponse {
  success: boolean;
  message: string;
  data: Task;
}
