import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { ProjectsResponse, ProjectsData } from "@/types/projects";

export async function getProjects(): Promise<ProjectsData> {
  const token = getToken();
  const { data } = await api.get<ProjectsResponse>("/projects", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch projects");
  }

  return data.data;
}
export interface CreateProjectPayload {
  name: string;
  description?: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  startDate?: string;
  dueDate?: string;
}

export async function createProject(payload: CreateProjectPayload): Promise<void> {
  const token = getToken();
  const { data } = await api.post("/projects", payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!data.success) throw new Error(data.message || "Failed to create project");
}

export async function getProjectDetails(id: string): Promise<any> {
  const token = getToken();
  const { data } = await api.get(`/projects/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!data.success) throw new Error(data.message || "Failed to fetch project details");
  return data.data;
}
export async function updateProject(id: string, payload: Partial<CreateProjectPayload>): Promise<void> {
  const token = getToken();
  const { data } = await api.patch(`/projects/${id}`, payload, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!data.success) throw new Error(data.message || "Failed to update project");
}

export async function deleteProject(id: string): Promise<void> {
  const token = getToken();
  const { data } = await api.delete(`/projects/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!data.success) throw new Error(data.message || "Failed to delete project");
}

export async function getProjectMembers(projectId: string): Promise<any[]> {
  const token = getToken();
  const { data } = await api.get(`/projects/${projectId}/members`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!data.success) throw new Error(data.message || "Failed to fetch project members");
  return data.data;
}
