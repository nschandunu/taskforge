export interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  activeProjects: number;
  overdueTasks: number;
  completionRate: number;
}

export interface RecentProject {
  id: string;
  name: string;
  status: "ACTIVE" | "COMPLETED" | "ON_HOLD";
  priority: "HIGH" | "MEDIUM" | "LOW";
  owner: {
    id: string;
    name: string;
  };
}

export interface RecentActivity {
  id: string;
  user: {
    id: string;
    name: string;
  };
  action: string;
  time: string;
}

export interface RecentTask {
  id: string;
  name: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "HIGH" | "MEDIUM" | "LOW";
  dueDate: string;
  assignee: {
    id: string;
    name: string;
  };
}

export interface DashboardData {
  overview: DashboardStats;
  recentProjects?: RecentProject[];
  recentActivity?: RecentActivity[];
  recentActivities?: RecentActivity[];
  recentTasks?: RecentTask[];
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}
