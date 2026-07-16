"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Search, MoreVertical, Plus, FolderKanban, Users, 
  CheckSquare, Calendar, AlertCircle, Loader2, Activity
} from "lucide-react";
import { toast } from "sonner";
import { motion, type Variants } from "framer-motion";

import { getProjects, createProject, getProjectDetails, updateProject, deleteProject } from "@/services/projects.service";
import { getTasksByProject } from "@/services/tasks.service";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const projectFormSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

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

function ProjectProgress({ projectId }: { projectId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["tasks", "project", projectId],
    queryFn: () => getTasksByProject(projectId),
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="space-y-1.5 mb-5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    );
  }

  const tasks = data?.items || [];
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "DONE").length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="space-y-1.5 mb-5 group/progress">
      <div className="flex justify-between text-xs text-muted-foreground font-semibold">
        <span>Progress</span>
        <span className="text-foreground">{percentage}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary border border-border/50">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-primary" 
        />
      </div>
      <p className="text-[10px] font-medium text-muted-foreground pt-0.5">
        {completed} of {total} tasks completed
      </p>
    </div>
  );
}

function ProjectDetailsDrawer({ projectId, isOpen, onClose }: { projectId: string | null, isOpen: boolean, onClose: () => void }) {
  const { data: project, isLoading, isError } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectDetails(projectId!),
    enabled: !!projectId && isOpen,
  });

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto bg-background border-l border-border/50 shadow-2xl">
        <div className="sr-only">
          <SheetTitle>Project Details</SheetTitle>
          <SheetDescription>View in-depth project details.</SheetDescription>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : isError || !project ? (
          <div className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertTitle>Error Loading Project</AlertTitle>
            </Alert>
          </div>
        ) : (
          <div className="flex flex-col pb-8">
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-8 border-b border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className={
                  project.status === "ACTIVE" ? "border-primary/30 text-primary bg-primary/10" : 
                  project.status === "COMPLETED" ? "border-success/30 text-success bg-success/10" : 
                  "border-warning/30 text-warning bg-warning/10"
                }>
                  {project.status.replace("_", " ")}
                </Badge>
                <Badge variant="outline" className={
                  project.priority === "HIGH" ? "border-destructive/30 text-destructive bg-destructive/10" : 
                  project.priority === "MEDIUM" ? "border-warning/30 text-warning bg-warning/10" : 
                  "border-muted-foreground/30 text-muted-foreground bg-secondary"
                }>
                  {project.priority} Priority
                </Badge>
              </div>
              <h3 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">{project.name}</h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-[90%]">
                {project.description || "No detailed description provided for this project."}
              </p>
            </div>

            <div className="px-6 mt-8 space-y-10">
              <div className="grid grid-cols-2 gap-6 bg-card p-5 rounded-2xl border border-border/50 shadow-sm">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Created On</span>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    {new Date(project.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Project Owner</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-5 shadow-sm ring-1 ring-border">
                      <AvatarFallback className="bg-secondary text-foreground text-[9px] font-bold">
                        {project.owner.firstName.charAt(0)}{project.owner.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {project.owner.firstName} {project.owner.lastName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CheckSquare className="size-4 text-primary" />
                  Tasks & Progress
                </h4>
                <div className="p-5 rounded-2xl border border-border/50 bg-card shadow-sm">
                  <ProjectProgress projectId={projectId!} />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  Team Members ({project.members?.length || 0})
                </h4>
                <div className="space-y-2">
                  {project.members?.map((member: any) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-card hover:bg-secondary/50 transition-colors border border-border/30">
                      <Avatar className="size-10 shadow-sm ring-2 ring-background">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                          {member.user.firstName.charAt(0)}{member.user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">{member.user.firstName} {member.user.lastName}</span>
                        <span className="text-xs font-medium text-muted-foreground capitalize">{member.role.toLowerCase()}</span>
                      </div>
                    </div>
                  ))}
                  {(!project.members || project.members.length === 0) && (
                    <p className="text-sm text-muted-foreground italic px-2">No team members assigned.</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Activity className="size-4 text-primary" />
                  Recent Activity
                </h4>
                <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center bg-secondary/30 transition-colors hover:bg-secondary/50">
                  <Activity className="size-6 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-bold text-foreground">Activity feed unavailable</p>
                  <p className="text-xs font-medium text-muted-foreground mt-1.5 max-w-[220px] mx-auto leading-relaxed">The backend API currently does not support project-specific activity feeds.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      priority: "MEDIUM",
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: ProjectFormValues) => createProject(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created successfully");
      setIsCreateOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create project");
    }
  });

  const editMutation = useMutation({
    mutationFn: ({ id, values }: { id: string, values: Partial<ProjectFormValues> }) => updateProject(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated successfully");
      setEditingProjectId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update project");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted successfully");
      setDeletingProjectId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete project");
    }
  });

  const onSubmit = (values: ProjectFormValues) => {
    createMutation.mutate(values);
  };

  const filteredProjects = data?.items.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || project.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || project.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 w-full sm:w-64" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[280px] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Projects</h2>
          <p className="text-muted-foreground font-medium">Manage all active projects.</p>
        </div>
        <Alert variant="destructive" className="border-destructive/20 bg-destructive/5 rounded-2xl">
          <AlertCircle className="size-5" />
          <AlertTitle className="font-bold">Error Loading Projects</AlertTitle>
          <AlertDescription className="font-medium">
            {error instanceof Error ? error.message : "Failed to load projects. Please try again."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div className="space-y-1.5">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Projects</h2>
          <p className="text-muted-foreground font-medium">Manage and monitor all active workspaces.</p>
        </div>
        
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="shadow-sm font-bold"
        >
          <Plus className="mr-2 size-[1.1rem]" />
          New Project
        </Button>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Fill out the details below to initialize a new project workspace.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Project Name</label>
              <Input placeholder="e.g. Website Redesign" {...form.register("name")} className="h-11 rounded-xl bg-secondary/50 focus:bg-background transition-colors" />
              {form.formState.errors.name && (
                <p className="text-xs font-semibold text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Description (Optional)</label>
              <Input placeholder="Brief description of the project" {...form.register("description")} className="h-11 rounded-xl bg-secondary/50 focus:bg-background transition-colors" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Priority</label>
              <select 
                className="flex h-11 w-full rounded-xl border border-input bg-secondary/50 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-colors"
                {...form.register("priority")}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-2 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input 
            placeholder="Search projects..." 
            className="pl-10 rounded-xl bg-secondary/30 h-10 border-transparent focus-visible:bg-background transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select 
          className="h-10 w-full sm:w-40 rounded-xl border-transparent bg-secondary/30 px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="PLANNING">Planning</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
        </select>
        
        <select 
          className="h-10 w-full sm:w-40 rounded-xl border-transparent bg-secondary/30 px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="ALL">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-secondary/20 py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary mb-4 shadow-sm">
            <FolderKanban className="size-7 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground">No projects found</h3>
          <p className="text-sm font-medium text-muted-foreground mt-2 max-w-sm leading-relaxed">
            {searchQuery || statusFilter !== "ALL" || priorityFilter !== "ALL" 
              ? "We couldn't find any projects matching your current filters." 
              : "You don't have any projects yet. Create one to get started."}
          </p>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredProjects.map((project) => (
            <motion.div variants={itemVariants} key={project.id}>
              <Card className="flex flex-col rounded-2xl border-border/40 bg-card shadow-sm transition-all duration-200 ease-out hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 group h-full">
                <CardHeader className="flex flex-row items-start justify-between pb-4">
                  <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                    <CardTitle className="text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {project.name}
                    </CardTitle>
                    <p className="text-sm font-medium text-muted-foreground line-clamp-2 min-h-[40px] leading-relaxed">
                      {project.description || "No description provided."}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button variant="ghost" size="icon" className="shrink-0 -mr-2 text-muted-foreground hover:text-foreground rounded-xl">
                        <MoreVertical className="size-4" />
                      </Button>
                    } />
                    <DropdownMenuContent align="end" className="w-44 rounded-xl border-border/50 bg-popover shadow-lg backdrop-blur-xl p-1">
                      <DropdownMenuItem 
                        onClick={() => setSelectedProjectId(project.id)}
                        className="cursor-pointer font-medium text-foreground focus:bg-secondary rounded-lg my-0.5 px-3"
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setEditingProjectId(project.id)}
                        className="cursor-pointer font-medium text-foreground focus:bg-secondary rounded-lg my-0.5 px-3"
                      >
                        Edit Project
                      </DropdownMenuItem>
                      <Separator className="bg-border/50 my-1" />
                      <DropdownMenuItem 
                        onClick={() => setDeletingProjectId(project.id)}
                        className="cursor-pointer font-medium text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg my-0.5 px-3 transition-colors"
                      >
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                
                <CardContent className="pb-5 flex-1 flex flex-col justify-between">
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Badge variant="outline" className={
                      project.status === "ACTIVE" ? "border-primary/20 text-primary bg-primary/5" :
                      project.status === "COMPLETED" ? "border-success/20 text-success bg-success/5" :
                      project.status === "PLANNING" ? "border-warning/20 text-warning bg-warning/5" :
                      "border-muted-foreground/20 text-muted-foreground bg-secondary"
                    }>
                      {project.status.replace("_", " ")}
                    </Badge>
                    <Badge variant="outline" className={
                      project.priority === "HIGH" ? "border-destructive/20 text-destructive bg-destructive/5" :
                      project.priority === "MEDIUM" ? "border-warning/20 text-warning bg-warning/5" :
                      "border-muted-foreground/20 text-muted-foreground bg-secondary"
                    }>
                      {project.priority}
                    </Badge>
                  </div>
                  
                  <div className="mt-auto">
                    <ProjectProgress projectId={project.id} />
                  </div>
                </CardContent>
                <CardFooter className="bg-secondary/20 border-t border-border/40 p-4 rounded-b-2xl flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      <Avatar className="size-7 border-2 border-card shadow-sm ring-1 ring-border/50 z-20">
                        <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                          {project.owner.firstName.charAt(0)}{project.owner.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {project.members?.slice(0, 3).map((member: any, i: number) => (
                        <Avatar key={member.id} className={`size-7 border-2 border-card shadow-sm ring-1 ring-border/50 z-${10 - i}`}>
                          <AvatarFallback className="bg-secondary text-foreground text-[10px] font-bold">
                            {member.user.firstName.charAt(0)}{member.user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.members && project.members.length > 3 && (
                        <div className="size-7 rounded-full bg-secondary text-foreground text-[10px] font-bold flex items-center justify-center border-2 border-card z-0 ring-1 ring-border/50 shadow-sm">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Calendar className="size-3.5" />
                    <span>{new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <ProjectDetailsDrawer 
        projectId={selectedProjectId} 
        isOpen={!!selectedProjectId} 
        onClose={() => setSelectedProjectId(null)} 
      />

      <Dialog open={!!editingProjectId} onOpenChange={(open) => !open && setEditingProjectId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Modify the details of your project workspace.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            editMutation.mutate({ 
              id: editingProjectId!, 
              values: { 
                name: formData.get("name") as string,
                description: formData.get("description") as string 
              } 
            });
          }}>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Project Name</label>
                <Input 
                  name="name"
                  required
                  defaultValue={data?.items?.find(p => p.id === editingProjectId)?.name} 
                  className="h-11 rounded-xl bg-secondary/50 focus:bg-background transition-colors" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Description</label>
                <textarea 
                  name="description"
                  defaultValue={data?.items?.find(p => p.id === editingProjectId)?.description || ""} 
                  className="flex min-h-[100px] w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-all"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditingProjectId(null)}>Cancel</Button>
              <Button type="submit" disabled={editMutation.isPending}>
                {editMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingProjectId} onOpenChange={(open) => !open && setDeletingProjectId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="size-[1.2rem]" />
              Delete Project
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-bold text-foreground">{data?.items?.find(p => p.id === deletingProjectId)?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm font-medium text-foreground mb-3">Type <span className="font-mono font-bold bg-secondary px-1.5 py-0.5 rounded-md border border-border/50 text-destructive">delete</span> to confirm.</p>
            <Input 
              className="h-11 rounded-xl focus-visible:ring-destructive focus-visible:border-destructive transition-colors" 
              onChange={(e) => {
                const btn = document.getElementById("confirm-delete-btn") as HTMLButtonElement;
                if (btn) btn.disabled = e.target.value.toLowerCase() !== "delete";
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeletingProjectId(null)}>Cancel</Button>
            <Button 
              id="confirm-delete-btn"
              disabled
              variant="destructive" 
              onClick={() => deleteMutation.mutate(deletingProjectId!)}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
