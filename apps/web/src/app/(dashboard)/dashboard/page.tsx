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
import { motion, type Variants } from "framer-motion";
import { CountUp } from "@/components/ui/count-up";

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
  if (lower.includes("creat") || lower.includes("add")) return <PlusCircle className="size-4 text-success" />;
  if (lower.includes("delet") || lower.includes("remov")) return <Trash2 className="size-4 text-destructive" />;
  if (lower.includes("updat") || lower.includes("edit")) return <Edit3 className="size-4 text-warning" />;
  return <Activity className="size-4 text-primary" />;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

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
      <div className="mx-auto flex w-full max-w-7xl flex-col space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="size-10 rounded-full" />
              </div>
              <Skeleton className="h-12 w-20 mt-4" />
              <Skeleton className="h-3 w-32 mt-2" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
          <div className="lg:col-span-4 flex flex-col gap-4 rounded-2xl border border-border/50 bg-card p-6 shadow-sm h-[450px]">
            <Skeleton className="h-7 w-40 mb-4" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
          <div className="lg:col-span-3 flex flex-col gap-4 rounded-2xl border border-border/50 bg-card p-6 shadow-sm h-[450px]">
            <Skeleton className="h-7 w-40 mb-4" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="size-10 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card p-6 shadow-sm h-[400px]">
          <Skeleton className="h-7 w-40 mb-4" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground text-lg">Welcome back, {user?.name || "User"}</p>
        </div>
        <Alert variant="destructive" className="rounded-xl border-destructive/20 bg-destructive/5 text-destructive">
          <AlertCircle className="size-5" />
          <AlertTitle className="text-base font-semibold">Error Loading Dashboard</AlertTitle>
          <AlertDescription className="text-sm">
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
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="mx-auto flex w-full max-w-7xl flex-col space-y-8"
    >
      
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Overview</h2>
        <p className="text-muted-foreground text-base font-medium">Welcome back, {user?.name || "User"}. Here is what's happening today.</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { 
            title: "Projects", 
            value: data.overview.totalProjects, 
            subtitle: "Active workspace projects",
            icon: FolderKanban,
            color: "text-primary",
            bg: "bg-primary/10"
          },
          { 
            title: "Tasks", 
            value: data.overview.totalTasks, 
            subtitle: "Total assigned tasks",
            icon: CheckSquare,
            color: "text-foreground",
            bg: "bg-secondary"
          },
          { 
            title: "Completed", 
            value: data.overview.completedTasks, 
            subtitle: "Tasks successfully finished",
            icon: CheckCircle2,
            color: "text-success",
            bg: "bg-success/10"
          },
          { 
            title: "Overdue", 
            value: data.overview.overdueTasks, 
            subtitle: "Requires immediate attention",
            icon: Clock,
            color: "text-destructive",
            bg: "bg-destructive/10"
          }
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group rounded-2xl border border-border/40 bg-card p-6 shadow-sm hover:shadow-md hover:border-border transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.title}</span>
              <div className={`flex size-10 items-center justify-center rounded-xl ${stat.bg} transition-transform group-hover:scale-110`}>
                <stat.icon className={`size-5 ${stat.color}`} />
              </div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-foreground tracking-tight">
                <CountUp to={stat.value} duration={0.8} />
              </div>
              <p className="text-sm font-medium text-muted-foreground mt-2">{stat.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-7">
        
        {/* Recent Projects */}
        <motion.div variants={itemVariants} className="lg:col-span-4 rounded-2xl border border-border/50 bg-card shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow">
          <div className="border-b border-border/50 p-6 pb-4">
            <h3 className="text-foreground text-lg font-bold flex items-center gap-2">
              <FolderKanban className="size-5 text-primary" />
              Recent Projects
            </h3>
          </div>
          <div className="flex-1 overflow-x-auto">
            <Table>
              <TableHeader className="bg-secondary/30">
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-muted-foreground px-6 font-semibold py-3 h-11">Name</TableHead>
                  <TableHead className="text-muted-foreground font-semibold py-3 h-11">Status</TableHead>
                  <TableHead className="text-muted-foreground font-semibold py-3 h-11">Priority</TableHead>
                  <TableHead className="text-muted-foreground px-6 text-right font-semibold py-3 h-11">Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProjects.map((project) => (
                  <TableRow 
                    key={project.id} 
                    onClick={() => router.push('/projects')}
                    className="border-border/50 hover:bg-secondary/50 cursor-pointer transition-colors group"
                  >
                    <TableCell className="font-semibold text-foreground px-6 py-4 group-hover:text-primary transition-colors">{project.name}</TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className={
                        project.status === "ACTIVE" ? "border-primary/20 text-primary bg-primary/5" :
                        project.status === "COMPLETED" ? "border-success/20 text-success bg-success/5" :
                        "border-warning/20 text-warning bg-warning/5"
                      }>
                        {project.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className={
                        project.priority === "HIGH" ? "border-destructive/20 text-destructive bg-destructive/5" :
                        project.priority === "MEDIUM" ? "border-warning/20 text-warning bg-warning/5" :
                        "border-muted-foreground/20 text-muted-foreground bg-secondary"
                      }>
                        {project.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 text-right py-4">
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-sm font-medium text-foreground">{project.owner.firstName} {project.owner.lastName}</span>
                        <Avatar className="size-8 ring-2 ring-background shadow-sm">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
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
                        <FolderKanban className="size-8 text-muted" />
                        <p className="text-muted-foreground font-medium">No recent projects found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-3 rounded-2xl border border-border/50 bg-card shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <div className="border-b border-border/50 p-6 pb-4">
            <h3 className="text-foreground text-lg font-bold flex items-center gap-2">
              <Activity className="size-5 text-primary" />
              Activity Feed
            </h3>
          </div>
          <div className="flex-1 p-6">
            <div className="space-y-6">
              {recentActivities.map((activity, index) => (
                <div key={activity.id} className="relative flex gap-4 group">
                  {index !== recentActivities.length - 1 && (
                    <div className="absolute left-[1.125rem] top-10 bottom-[-1.5rem] w-[2px] rounded-full bg-secondary transition-colors group-hover:bg-primary/20" />
                  )}
                  <div className="relative mt-0.5 shrink-0 z-10">
                    <Avatar className="size-9 ring-4 ring-background shadow-sm">
                      <AvatarFallback className="bg-secondary text-foreground text-xs font-bold border border-border">
                        {activity.user.firstName?.charAt(0)}{activity.user.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-background ring-2 ring-background">
                      {getActivityIcon(activity.action)}
                    </div>
                  </div>
                  <div className="flex flex-col pt-0.5">
                    <p className="text-sm text-foreground leading-snug">
                      <span className="font-semibold">{activity.user.firstName} {activity.user.lastName}</span>{" "}
                      <span className="text-muted-foreground font-medium">{activity.action}</span>
                    </p>
                    <p className="text-[11px] font-semibold text-muted-foreground/70 mt-1 uppercase tracking-wider">{formatRelativeTime(activity.createdAt)}</p>
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Activity className="size-8 text-muted" />
                  <p className="text-center text-muted-foreground font-medium">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Tasks */}
      <motion.div variants={itemVariants} className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="border-b border-border/50 p-6 pb-4">
          <h3 className="text-foreground text-lg font-bold flex items-center gap-2">
            <CheckSquare className="size-5 text-primary" />
            Active Tasks
          </h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground px-6 font-semibold py-3 h-11">Task Name</TableHead>
                <TableHead className="text-muted-foreground font-semibold py-3 h-11">Status</TableHead>
                <TableHead className="text-muted-foreground font-semibold py-3 h-11">Priority</TableHead>
                <TableHead className="text-muted-foreground font-semibold py-3 h-11">Due Date</TableHead>
                <TableHead className="text-muted-foreground px-6 text-right font-semibold py-3 h-11">Assignee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTasks.map((task) => (
                <TableRow 
                  key={task.id} 
                  onClick={() => router.push('/tasks')}
                  className="border-border/50 hover:bg-secondary/50 cursor-pointer transition-colors group"
                >
                  <TableCell className="font-semibold text-foreground px-6 py-4 group-hover:text-primary transition-colors">{task.title}</TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className={
                      task.status === "DONE" ? "border-success/20 text-success bg-success/5" :
                      task.status === "IN_PROGRESS" ? "border-primary/20 text-primary bg-primary/5" :
                      "border-muted-foreground/20 text-muted-foreground bg-secondary"
                    }>
                      {task.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className={
                      task.priority === "HIGH" ? "border-destructive/20 text-destructive bg-destructive/5" :
                      task.priority === "MEDIUM" ? "border-warning/20 text-warning bg-warning/5" :
                      "border-muted-foreground/20 text-muted-foreground bg-secondary"
                    }>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-muted-foreground font-medium text-sm">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No due date"}
                  </TableCell>
                  <TableCell className="px-6 text-right py-4">
                    <div className="flex items-center justify-end gap-3">
                      <span className="text-sm font-semibold text-foreground">
                        {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : "Unassigned"}
                      </span>
                      <Avatar className="size-8 ring-2 ring-background shadow-sm">
                        <AvatarFallback className="bg-secondary text-foreground text-xs font-bold border border-border">
                          {task.assignee ? `${task.assignee.firstName.charAt(0)}${task.assignee.lastName.charAt(0)}` : "?"}
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
                      <CheckSquare className="size-8 text-muted" />
                      <p className="text-muted-foreground font-medium">No recent tasks found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </motion.div>
  );
}
