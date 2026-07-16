"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Search, MoreVertical, Plus, FolderKanban, Users, 
  CheckSquare, Calendar, AlertCircle, Loader2
} from "lucide-react";
import { toast } from "sonner";

import { getProjects, createProject, getProjectDetails } from "@/services/projects.service";
import { getTasksByProject } from "@/services/tasks.service";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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

// Sub-component to fetch tasks and calculate progress
function ProjectProgress({ projectId }: { projectId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["tasks", "project", projectId],
    queryFn: () => getTasksByProject(projectId),
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="space-y-1.5 mb-5">
        <div className="flex justify-between text-xs text-[#6B7280]">
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
    <div className="space-y-1.5 mb-5">
      <div className="flex justify-between text-xs text-[#6B7280] font-medium">
        <span>Progress</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#FAFAFA] border border-[#E5E7EB]">
        <div 
          className="h-full bg-[#2563EB] transition-all duration-500 ease-in-out" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-[10px] text-[#6B7280] pt-0.5">
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
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl">Project Details</SheetTitle>
          <SheetDescription>View comprehensive project metadata.</SheetDescription>
        </SheetHeader>
        
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : isError || !project ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Error Loading Project</AlertTitle>
          </Alert>
        ) : (
          <div className="space-y-8 animate-in fade-in">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-[#111827]">{project.name}</h3>
              <div className="flex gap-2">
                <Badge variant="outline" className={project.status === "ACTIVE" ? "border-[#2563EB] text-[#2563EB] bg-[#2563EB]/5" : "border-[#6B7280]"}>{project.status}</Badge>
                <Badge variant="outline" className={project.priority === "HIGH" ? "border-[#DC2626] text-[#DC2626] bg-[#DC2626]/5" : "border-[#6B7280]"}>{project.priority}</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#111827]">Description</h4>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                {project.description || "No description provided."}
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-[#111827]">Team Members</h4>
              <div className="space-y-3">
                {project.members?.map((member: any) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-[#2563EB]/10 text-[#2563EB] text-xs">
                        {member.user.firstName.charAt(0)}{member.user.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[#111827]">{member.user.firstName} {member.user.lastName}</span>
                      <span className="text-xs text-[#6B7280]">{member.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-[#6B7280]">Created</span>
                <p className="text-sm font-medium text-[#111827]">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-[#6B7280]">Owner</span>
                <p className="text-sm font-medium text-[#111827]">
                  {project.owner.firstName} {project.owner.lastName}
                </p>
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32 rounded-md" />
            <Skeleton className="h-4 w-48 rounded-md" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 w-full sm:w-64 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[280px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Projects</h2>
          <p className="text-[#6B7280]">Manage all active projects.</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Error Loading Projects</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load projects. Please try again."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Projects</h2>
          <p className="text-[#6B7280]">Manage all active projects.</p>
        </div>
        
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="rounded-lg bg-[#2563EB] text-[#FFFFFF] hover:bg-[#2563EB]/90 h-10 shadow-sm"
        >
          <Plus className="mr-2 size-4" />
          New Project
        </Button>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Fill out the details below to initialize a new project workspace.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111827]">Project Name</label>
              <Input placeholder="e.g. Website Redesign" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111827]">Description (Optional)</label>
              <Input placeholder="Brief description of the project" {...form.register("description")} />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111827]">Priority</label>
              <select 
                className="flex h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                {...form.register("priority")}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[#2563EB] hover:bg-[#2563EB]/90"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#6B7280]" />
          <Input 
            placeholder="Search projects..." 
            className="pl-9 rounded-lg border-[#E5E7EB] bg-[#FFFFFF] h-10 focus-visible:ring-[#2563EB]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select 
          className="h-10 w-full sm:w-40 rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] px-3 py-2 text-sm text-[#111827] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
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
          className="h-10 w-full sm:w-40 rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] px-3 py-2 text-sm text-[#111827] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
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
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFAFA] py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E5E7EB]/50 mb-4">
            <FolderKanban className="size-6 text-[#6B7280]" />
          </div>
          <h3 className="text-lg font-medium text-[#111827]">No projects found</h3>
          <p className="text-sm text-[#6B7280] mt-1 max-w-sm">
            {searchQuery || statusFilter !== "ALL" || priorityFilter !== "ALL" 
              ? "We couldn't find any projects matching your current filters." 
              : "You don't have any projects yet. Create one to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="flex flex-col rounded-xl border-[#E5E7EB] bg-[#FFFFFF] shadow-sm transition-all hover:shadow-md hover:border-[#2563EB]/30 group">
              <CardHeader className="flex flex-row items-start justify-between pb-4">
                <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                  <CardTitle className="text-lg font-semibold text-[#111827] truncate group-hover:text-[#2563EB] transition-colors">
                    {project.name}
                  </CardTitle>
                  <p className="text-sm text-[#6B7280] line-clamp-2 min-h-[40px]">
                    {project.description || "No description provided."}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <Button variant="ghost" size="icon" className="shrink-0 -mr-2 text-[#6B7280] hover:text-[#111827] rounded-lg">
                      <MoreVertical className="size-4" />
                    </Button>
                  } />
                  <DropdownMenuContent align="end" className="w-40 rounded-xl border-[#E5E7EB] bg-[#FFFFFF] shadow-sm">
                    <DropdownMenuItem 
                      onClick={() => setSelectedProjectId(project.id)}
                      className="cursor-pointer text-[#111827] focus:bg-[#FAFAFA]"
                    >
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled className="cursor-not-allowed opacity-50 text-[#111827]" title="Not supported by backend yet">
                      Edit Project
                    </DropdownMenuItem>
                    <Separator className="bg-[#E5E7EB] my-1" />
                    <DropdownMenuItem disabled className="cursor-not-allowed opacity-50 text-[#DC2626]" title="Not supported by backend yet">
                      Delete Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              
              <CardContent className="pb-4 flex-1">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className={
                    project.status === "ACTIVE" ? "border-[#2563EB] text-[#2563EB] bg-[#2563EB]/5" :
                    project.status === "COMPLETED" ? "border-[#16A34A] text-[#16A34A] bg-[#16A34A]/5" :
                    project.status === "PLANNING" ? "border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B]/5" :
                    "border-[#6B7280] text-[#6B7280] bg-[#6B7280]/5"
                  }>
                    {project.status.replace("_", " ")}
                  </Badge>
                  <Badge variant="outline" className={
                    project.priority === "HIGH" ? "border-[#DC2626] text-[#DC2626] bg-[#DC2626]/5" :
                    project.priority === "MEDIUM" ? "border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B]/5" :
                    "border-[#6B7280] text-[#6B7280] bg-[#6B7280]/5"
                  }>
                    {project.priority}
                  </Badge>
                </div>
                
                <ProjectProgress projectId={project.id} />

                <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4 mt-auto">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6 shadow-sm">
                      <AvatarFallback className="bg-[#111827] text-white text-[10px] font-medium">
                        {project.owner.firstName.charAt(0)}{project.owner.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-[#111827] truncate max-w-[100px]">
                      {project.owner.firstName} {project.owner.lastName}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-[#6B7280]">
                    <div className="flex items-center gap-1">
                      <Users className="size-3" />
                      <span className="text-xs">{project.members?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-[#FAFAFA] border-t border-[#E5E7EB] p-3 px-6 text-xs text-[#6B7280] rounded-b-xl flex justify-between">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3" />
                  <span>Created {new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <ProjectDetailsDrawer 
        projectId={selectedProjectId} 
        isOpen={!!selectedProjectId} 
        onClose={() => setSelectedProjectId(null)} 
      />
    </div>
  );
}
