"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FolderKanban, CheckSquare, CheckCircle2, Clock, AlertCircle, Activity, PlusCircle, Edit3, Trash2 } from "lucide-react";
import { getDashboard } from "@/services/dashboard.service";
import { getProjects } from "@/services/projects.service";
import { getAllTasks } from "@/services/tasks.service";
import { getUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function formatRelativeTime(dateString: string): string {
  try {
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const diffInMs = date.getTime() - Date.now();
    const diffInSeconds = Math.round(diffInMs / 1000);
    const diffInMinutes = Math.round(diffInSeconds / 60);
    const diffInHours = Math.round(diffInMinutes / 60);
    const diffInDays = Math.round(diffInHours / 24);

    if (Math.abs(diffInDays) >= 1) return rtf.format(diffInDays, "day");
    if (Math.abs(diffInHours) >= 1) return rtf.format(diffInHours, "hour");
    if (Math.abs(diffInMinutes) >= 1) return rtf.format(diffInMinutes, "minute");
    return rtf.format(diffInSeconds, "second");
  } catch {
    return dateString;
  }
}

function getActivityIcon(action: string) {
  const lower = action.toLowerCase();
  if (lower.includes("creat") || lower.includes("add")) return <PlusCircle className="size-4 text-[#16A34A]" />;
  if (lower.includes("delet") || lower.includes("remov")) return <Trash2 className="size-4 text-[#DC2626]" />;
  if (lower.includes("updat") || lower.includes("edit")) return <Edit3 className="size-4 text-[#F59E0B]" />;
  return <Activity className="size-4 text-[#2563EB]" />;
}

export default function DashboardPage() {
  const user = getUser();
  const router = useRouter();

  const { data, isLoading: isDashboardLoading, isError, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });

  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ["tasks", "all"],
    queryFn: getAllTasks,
  });

  const isLoading = isDashboardLoading || isProjectsLoading || isTasksLoading;

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-[1600px] flex-col space-y-8 animate-in fade-in duration-300">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-md" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="size-8 rounded-full" />
              </div>
              <Skeleton className="h-10 w-16 mt-2 rounded-md" />
              <Skeleton className="h-3 w-32 mt-1 rounded-md" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-6 shadow-sm h-[400px]">
            <Skeleton className="h-6 w-32 rounded-md mb-2" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
          <div className="flex flex-col gap-4 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-6 shadow-sm h-[400px]">
            <Skeleton className="h-6 w-32 rounded-md mb-2" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="size-10 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-1/4 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col gap-4 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-6 shadow-sm h-[400px]">
          <Skeleton className="h-6 w-32 rounded-md mb-2" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto flex w-full max-w-[1600px] flex-col space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Dashboard</h2>
          <p className="text-[#6B7280]">Welcome back, {user?.name || "User"}</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load dashboard data. Please try again."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) return null;

  const recentProjects = projectsData?.items?.slice(0, 5) || [];
  const recentActivities = data.recentActivities || data.recentActivity || [];
  const recentTasks = tasksData?.items?.slice(0, 5) || [];

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-[#111827]">Dashboard</h2>
        <p className="text-[#6B7280] text-base">Welcome back, {user?.name || "User"}. Here is what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { 
            title: "Projects", 
            value: data.overview.totalProjects, 
            subtitle: "Active workspace projects",
            icon: FolderKanban,
            color: "text-[#2563EB]",
            bg: "bg-[#2563EB]/5"
          },
          { 
            title: "Tasks", 
            value: data.overview.totalTasks, 
            subtitle: "Total assigned tasks",
            icon: CheckSquare,
            color: "text-[#111827]",
            bg: "bg-[#111827]/5"
          },
          { 
            title: "Completed", 
            value: data.overview.completedTasks, 
            subtitle: "Tasks successfully finished",
            icon: CheckCircle2,
            color: "text-[#16A34A]",
            bg: "bg-[#16A34A]/5"
          },
          { 
            title: "Overdue", 
            value: data.overview.overdueTasks, 
            subtitle: "Requires immediate attention",
            icon: Clock,
            color: "text-[#DC2626]",
            bg: "bg-[#DC2626]/5"
          }
        ].map((stat, i) => (
          <Card key={i} className="group rounded-xl border-[#E5E7EB] bg-[#FFFFFF] shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#2563EB]/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider">{stat.title}</CardTitle>
              <div className={`flex size-10 items-center justify-center rounded-full ${stat.bg} transition-colors duration-200 group-hover:bg-[#2563EB]/10`}>
                <stat.icon className={`size-5 ${stat.color} transition-transform duration-200 group-hover:scale-110`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#111827]">{stat.value}</div>
              <p className="text-xs font-medium text-[#6B7280] mt-2">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-7">
        
        {/* Recent Projects */}
        <Card className="lg:col-span-4 rounded-xl border-[#E5E7EB] bg-[#FFFFFF] shadow-sm flex flex-col transition-all duration-200 hover:shadow-md">
          <CardHeader className="border-b border-[#E5E7EB]/50 pb-4">
            <CardTitle className="text-[#111827] text-lg font-semibold flex items-center gap-2">
              <FolderKanban className="size-5 text-[#2563EB]" />
              Recent Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 px-0 overflow-x-auto pt-0">
            <Table>
              <TableHeader>
                <TableRow className="border-[#E5E7EB] hover:bg-transparent">
                  <TableHead className="text-[#6B7280] px-6 font-semibold py-4">Name</TableHead>
                  <TableHead className="text-[#6B7280] font-semibold py-4">Status</TableHead>
                  <TableHead className="text-[#6B7280] font-semibold py-4">Priority</TableHead>
                  <TableHead className="text-[#6B7280] px-6 text-right font-semibold py-4">Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProjects.map((project) => (
                  <TableRow 
                    key={project.id} 
                    onClick={() => router.push('/projects')}
                    className="border-[#E5E7EB]/50 hover:bg-[#FAFAFA] cursor-pointer transition-colors duration-150 group"
                  >
                    <TableCell className="font-semibold text-[#111827] px-6 py-4 group-hover:text-[#2563EB] transition-colors">{project.name}</TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className={
                        project.status === "ACTIVE" ? "border-[#2563EB] text-[#2563EB] bg-[#2563EB]/5" :
                        project.status === "COMPLETED" ? "border-[#16A34A] text-[#16A34A] bg-[#16A34A]/5" :
                        "border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B]/5"
                      }>
                        {project.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className={
                        project.priority === "HIGH" ? "border-[#DC2626] text-[#DC2626] bg-[#DC2626]/5" :
                        project.priority === "MEDIUM" ? "border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B]/5" :
                        "border-[#6B7280] text-[#6B7280] bg-[#6B7280]/5"
                      }>
                        {project.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 text-right py-4">
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-sm font-medium text-[#111827]">{project.owner.firstName} {project.owner.lastName}</span>
                        <Avatar className="size-8 border border-white shadow-sm ring-1 ring-[#E5E7EB]">
                          <AvatarFallback className="bg-[#2563EB]/10 text-[#2563EB] text-xs font-semibold">
                            {project.owner.firstName.charAt(0)}{project.owner.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {recentProjects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FolderKanban className="size-8 text-[#E5E7EB]" />
                        <p className="text-[#6B7280] font-medium">No recent projects found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-3 rounded-xl border-[#E5E7EB] bg-[#FFFFFF] shadow-sm flex flex-col transition-all duration-200 hover:shadow-md">
          <CardHeader className="border-b border-[#E5E7EB]/50 pb-4">
            <CardTitle className="text-[#111827] text-lg font-semibold flex items-center gap-2">
              <Activity className="size-5 text-[#2563EB]" />
              Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-6">
            <div className="space-y-6">
              {recentActivities.map((activity, index) => (
                <div key={activity.id} className="relative flex gap-4 group">
                  {index !== recentActivities.length - 1 && (
                    <div className="absolute left-5 top-12 bottom-[-1.5rem] w-px bg-[#E5E7EB] transition-colors group-hover:bg-[#2563EB]/30" />
                  )}
                  <div className="relative mt-1">
                    <div className="absolute -bottom-1 -right-1 z-10 flex size-4 items-center justify-center rounded-full bg-white ring-1 ring-white">
                      {getActivityIcon(activity.action)}
                    </div>
                    <Avatar className="size-10 border-2 border-white ring-1 ring-[#E5E7EB] shadow-sm transition-transform duration-200 group-hover:scale-105">
                      <AvatarFallback className="bg-[#111827] text-white text-xs font-semibold">
                        {activity.user.firstName?.charAt(0)}{activity.user.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex flex-col pt-1">
                    <p className="text-sm text-[#111827] leading-tight">
                      <span className="font-bold">{activity.user.firstName} {activity.user.lastName}</span>{" "}
                      <span className="text-[#6B7280]">{activity.action}</span>
                    </p>
                    <p className="text-xs font-medium text-[#6B7280] mt-1.5">{formatRelativeTime(activity.time)}</p>
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Activity className="size-8 text-[#E5E7EB]" />
                  <p className="text-center text-[#6B7280] font-medium">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card className="rounded-xl border-[#E5E7EB] bg-[#FFFFFF] shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
        <CardHeader className="border-b border-[#E5E7EB]/50 pb-4">
          <CardTitle className="text-[#111827] text-lg font-semibold flex items-center gap-2">
            <CheckSquare className="size-5 text-[#2563EB]" />
            Active Tasks
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E5E7EB] hover:bg-transparent">
                <TableHead className="text-[#6B7280] px-6 font-semibold py-4">Task Name</TableHead>
                <TableHead className="text-[#6B7280] font-semibold py-4">Status</TableHead>
                <TableHead className="text-[#6B7280] font-semibold py-4">Priority</TableHead>
                <TableHead className="text-[#6B7280] font-semibold py-4">Due Date</TableHead>
                <TableHead className="text-[#6B7280] px-6 text-right font-semibold py-4">Assignee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTasks.map((task) => (
                <TableRow 
                  key={task.id} 
                  onClick={() => router.push('/tasks')}
                  className="border-[#E5E7EB]/50 hover:bg-[#FAFAFA] cursor-pointer transition-colors duration-150 group"
                >
                  <TableCell className="font-semibold text-[#111827] px-6 py-4 group-hover:text-[#2563EB] transition-colors">{task.title}</TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className={
                      task.status === "DONE" ? "border-[#16A34A] text-[#16A34A] bg-[#16A34A]/5" :
                      task.status === "IN_PROGRESS" ? "border-[#2563EB] text-[#2563EB] bg-[#2563EB]/5" :
                      "border-[#6B7280] text-[#6B7280] bg-[#6B7280]/5"
                    }>
                      {task.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className={
                      task.priority === "HIGH" ? "border-[#DC2626] text-[#DC2626] bg-[#DC2626]/5" :
                      task.priority === "MEDIUM" ? "border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B]/5" :
                      "border-[#6B7280] text-[#6B7280] bg-[#6B7280]/5"
                    }>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-[#111827] font-medium text-sm">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No due date"}
                  </TableCell>
                  <TableCell className="px-6 text-right py-4">
                    <div className="flex items-center justify-end gap-3">
                      <span className="text-sm font-medium text-[#111827]">
                        {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : "Unassigned"}
                      </span>
                      <Avatar className="size-8 border border-white shadow-sm ring-1 ring-[#E5E7EB]">
                        <AvatarFallback className="bg-[#111827] text-white text-xs font-semibold">
                          {task.assignee ? `${task.assignee.firstName.charAt(0)}${task.assignee.lastName.charAt(0)}` : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {recentTasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckSquare className="size-8 text-[#E5E7EB]" />
                      <p className="text-[#6B7280] font-medium">No recent tasks found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
