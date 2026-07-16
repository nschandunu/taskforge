export interface ProjectOwner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  startDate: string | null;
  dueDate: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: ProjectOwner;
  // Based on the API response we've seen, member and task counts aren't directly nested by default
  // We'll map them optionally for safety.
  tasks?: any[];
  members?: any[];
}

export interface ProjectsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProjectsData {
  items: Project[];
  meta: ProjectsMeta;
}

export interface ProjectsResponse {
  success: boolean;
  message: string;
  data: ProjectsData;
}
