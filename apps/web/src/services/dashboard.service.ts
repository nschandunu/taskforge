import { api } from "@/lib/api";
import type { DashboardResponse, DashboardData } from "@/types/dashboard";
import { getToken } from "@/lib/auth";

export async function getDashboard(): Promise<DashboardData> {
  const token = getToken();
  const { data } = await api.get<DashboardResponse>("/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!data.success) {
    throw new Error(data.message || "Failed to fetch dashboard data");
  }

  return data.data;
}
