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
