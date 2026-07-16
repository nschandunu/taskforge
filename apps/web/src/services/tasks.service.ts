import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { TasksResponse, TasksData, TaskStatus } from "@/types/tasks";
import { getProjects } from "./projects.service";

export async function getTasksByProject(projectId: string): Promise<TasksData> {
  const token = getToken();
  const { data } = await api.get<TasksResponse>(`/tasks/project/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch tasks for project");
  }

  return data.data;
}

export async function getAllTasks(): Promise<TasksData> {
  // Fetch all projects first
  const projectsData = await getProjects();
  
  if (!projectsData.items || projectsData.items.length === 0) {
    return {
      items: [],
      meta: { page: 1, limit: 100, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
    };
  }

  // Fetch tasks for all projects concurrently
  const tasksPromises = projectsData.items.map(project => getTasksByProject(project.id).catch(() => null));
  const results = await Promise.all(tasksPromises);
  
  // Aggregate items
  const allItems = results
    .filter((res): res is TasksData => res !== null)
    .flatMap(res => res.items);

  return {
    items: allItems,
    meta: {
      page: 1,
      limit: 100,
      total: allItems.length,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false
    }
  };
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
  const token = getToken();
  const { data } = await api.patch<{ success: boolean; message: string }>(`/tasks/${taskId}/status`, { status }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!data.success) {
    throw new Error(data.message || "Failed to update task status");
  }
}
