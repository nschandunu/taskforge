"use client";

import { useQuery } from "@tanstack/react-query";
import { FolderKanban, CheckSquare, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { getDashboard } from "@/services/dashboard.service";
import { getUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  const user = getUser();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-md" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="rounded-xl border-[#E5E7EB] shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="size-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2 rounded-md" />
                <Skeleton className="h-3 w-28 rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-[300px] w-full rounded-xl" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
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

  const recentProjects = data.recentProjects || [];
  const recentActivities = data.recentActivities || data.recentActivity || [];
  const recentTasks = data.recentTasks || [];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Dashboard</h2>
        <div className="flex flex-col">
          <p className="text-[#6B7280]">Welcome back, {user?.name || "User"}</p>
          <p className="text-sm font-medium text-[#111827] mt-3 mb-1">Today's overview</p>
          <Separator className="bg-[#E5E7EB] w-full max-w-[200px]" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-xl border-[#E5E7EB] bg-[#FFFFFF] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#111827]">Projects</CardTitle>
            <FolderKanban className="size-4 text-[#6B7280]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#111827]">{data.overview.totalProjects}</div>
            <p className="text-xs text-[#6B7280] mt-1">+2 from last month</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl border-[#E5E7EB] bg-[#FFFFFF] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#111827]">Tasks</CardTitle>
            <CheckSquare className="size-4 text-[#6B7280]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#111827]">{data.overview.totalTasks}</div>
            <p className="text-xs text-[#6B7280] mt-1">+12 from last week</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-[#E5E7EB] bg-[#FFFFFF] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#111827]">Completed Tasks</CardTitle>
            <CheckCircle2 className="size-4 text-[#16A34A]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#111827]">{data.overview.completedTasks}</div>
            <p className="text-xs text-[#6B7280] mt-1">+8 this week</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-[#E5E7EB] bg-[#FFFFFF] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#111827]">Overdue Tasks</CardTitle>
            <Clock className="size-4 text-[#DC2626]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#111827]">{data.overview.overdueTasks}</div>
            <p className="text-xs text-[#DC2626] mt-1">-3 from yesterday</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-xl border-[#E5E7EB] bg-[#FFFFFF] shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-[#111827] text-lg">Recent Projects</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 px-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#E5E7EB] hover:bg-transparent">
                  <TableHead className="text-[#6B7280] px-6">Name</TableHead>
                  <TableHead className="text-[#6B7280]">Status</TableHead>
                  <TableHead className="text-[#6B7280]">Priority</TableHead>
                  <TableHead className="text-[#6B7280] px-6 text-right">Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProjects.map((project) => (
                  <TableRow key={project.id} className="border-[#E5E7EB] hover:bg-[#FAFAFA]">
                    <TableCell className="font-medium text-[#111827] px-6">{project.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        project.status === "ACTIVE" ? "border-[#2563EB] text-[#2563EB]" :
                        project.status === "COMPLETED" ? "border-[#16A34A] text-[#16A34A]" :
                        "border-[#F59E0B] text-[#F59E0B]"
                      }>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        project.priority === "HIGH" ? "border-[#DC2626] text-[#DC2626]" :
                        project.priority === "MEDIUM" ? "border-[#F59E0B] text-[#F59E0B]" :
                        "border-[#6B7280] text-[#6B7280]"
                      }>
                        {project.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-sm text-[#6B7280]">{project.owner.name}</span>
                        <Avatar className="size-6">
                          <AvatarFallback className="bg-[#2563EB]/10 text-[#2563EB] text-[10px]">
                            {project.owner.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {recentProjects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-[#6B7280] py-6">
                      No recent projects.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-[#E5E7EB] bg-[#FFFFFF] shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-[#111827] text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-6 pl-2">
              {recentActivities.map((activity, index) => (
                <div key={activity.id} className="relative flex gap-4">
                  {index !== recentActivities.length - 1 && (
                    <div className="absolute left-4 top-10 -bottom-6 w-px bg-[#E5E7EB]" />
                  )}
                  <div className="relative mt-1">
                    <Avatar className="size-8 border-2 border-white ring-1 ring-[#E5E7EB]">
                      <AvatarFallback className="bg-[#2563EB]/10 text-[#2563EB] text-xs">
                        {activity.user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm text-[#111827]">
                      <span className="font-medium">{activity.user.name}</span> {activity.action}
                    </p>
                    <p className="text-xs text-[#6B7280] mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <p className="text-center text-[#6B7280] py-4 text-sm">
                  No recent activity.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border-[#E5E7EB] bg-[#FFFFFF] shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="text-[#111827] text-lg">Recent Tasks</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E5E7EB] hover:bg-transparent">
                <TableHead className="text-[#6B7280] px-6">Task Name</TableHead>
                <TableHead className="text-[#6B7280]">Status</TableHead>
                <TableHead className="text-[#6B7280]">Priority</TableHead>
                <TableHead className="text-[#6B7280]">Due Date</TableHead>
                <TableHead className="text-[#6B7280] px-6 text-right">Assignee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTasks.map((task) => (
                <TableRow key={task.id} className="border-[#E5E7EB] hover:bg-[#FAFAFA]">
                  <TableCell className="font-medium text-[#111827] px-6">{task.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      task.status === "DONE" ? "border-[#16A34A] text-[#16A34A]" :
                      task.status === "IN_PROGRESS" ? "border-[#2563EB] text-[#2563EB]" :
                      "border-[#6B7280] text-[#6B7280]"
                    }>
                      {task.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      task.priority === "HIGH" ? "border-[#DC2626] text-[#DC2626]" :
                      task.priority === "MEDIUM" ? "border-[#F59E0B] text-[#F59E0B]" :
                      "border-[#6B7280] text-[#6B7280]"
                    }>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#6B7280] text-sm">{task.dueDate}</TableCell>
                  <TableCell className="px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm text-[#6B7280]">{task.assignee.name}</span>
                      <Avatar className="size-6">
                        <AvatarFallback className="bg-[#2563EB]/10 text-[#2563EB] text-[10px]">
                          {task.assignee.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {recentTasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-[#6B7280] py-6">
                    No recent tasks.
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
