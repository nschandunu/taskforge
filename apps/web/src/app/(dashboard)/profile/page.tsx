"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/lib/auth";
import type { User } from "@/types/auth";
import { getProjects } from "@/services/projects.service";
import { getAllTasks } from "@/services/tasks.service";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckSquare, FolderKanban, Shield, Mail, Activity, AlertCircle } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });

  const { data: tasksData, isLoading: isTasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: getAllTasks,
  });

  if (!user) {
    return <div className="p-8"><Skeleton className="h-96 w-full rounded-2xl" /></div>;
  }

  const ownedProjects = projectsData?.items.filter(p => p.owner.id === user.id) || [];
  const assignedTasks = tasksData?.items.filter(t => t.assigneeId === user.id) || [];
  const isLoading = isProjectsLoading || isTasksLoading;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-1.5">
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
          My Profile
        </h2>
        <p className="text-muted-foreground font-medium">
          View your personal information and activity.
        </p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div variants={itemVariants} className="md:col-span-1 space-y-6">
          <Card className="rounded-3xl border-border/40 bg-card shadow-sm overflow-hidden text-center">
            <div className="h-32 bg-secondary/50 w-full" />
            <div className="px-6 pb-6 relative">
              <Avatar className="size-24 rounded-2xl ring-4 ring-background shadow-lg mx-auto -mt-12 mb-4 bg-card">
                <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary rounded-2xl">
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold text-foreground">{user.name}</h3>
              <Badge variant="outline" className="mt-2 text-xs font-bold bg-secondary">
                {user.role.replace("_", " ")}
              </Badge>
              
              <div className="mt-6 space-y-3 text-left border-t border-border/40 pt-4">
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <Mail className="size-4 text-muted-foreground" />
                  <span className="font-medium truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <Shield className="size-4 text-muted-foreground" />
                  <span className="font-medium capitalize">{user.role.toLowerCase().replace("_", " ")}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span className="font-medium">Active Account</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="rounded-2xl border-border/40 bg-card shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CheckSquare className="size-5 text-primary" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-foreground">
                    {isLoading ? <Skeleton className="h-8 w-12" /> : assignedTasks.length}
                  </h3>
                </div>
                <h4 className="text-sm font-bold text-muted-foreground">Assigned Tasks</h4>
              </CardContent>
            </Card>
            
            <Card className="rounded-2xl border-border/40 bg-card shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="size-10 rounded-xl bg-secondary flex items-center justify-center border border-border/50">
                    <FolderKanban className="size-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-3xl font-extrabold text-foreground">
                    {isLoading ? <Skeleton className="h-8 w-12" /> : ownedProjects.length}
                  </h3>
                </div>
                <h4 className="text-sm font-bold text-muted-foreground">Owned Projects</h4>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border-border/40 bg-card shadow-sm h-[320px] flex flex-col">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Activity className="size-4 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-secondary/10">
              <div className="size-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <AlertCircle className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-bold text-foreground">Activity feed unavailable</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs font-medium leading-relaxed">
                The backend API currently does not support user-specific activity feeds. This feature will be implemented in a future milestone.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
