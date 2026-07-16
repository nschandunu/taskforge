"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  MoreVertical, 
  Plus, 
  FolderKanban, 
  Users, 
  CheckSquare, 
  Calendar,
  AlertCircle
} from "lucide-react";

import { getProjects } from "@/services/projects.service";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
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
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Projects</h2>
          <p className="text-[#6B7280]">Manage all active projects.</p>
        </div>
        
        <Dialog>
          <DialogTrigger render={
            <Button className="rounded-lg bg-[#2563EB] text-[#FFFFFF] hover:bg-[#2563EB]/90 h-10">
              <Plus className="mr-2 size-4" />
              New Project
            </Button>
          } />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Fill out the details below to create a new project. (UI Preview)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">Project Name</label>
                <Input placeholder="e.g. Website Redesign" className="rounded-lg" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">Description</label>
                <Input placeholder="Brief description of the project" className="rounded-lg" />
              </div>
            </div>
            <DialogFooter>
              <Button className="rounded-lg bg-[#2563EB] text-white hover:bg-[#2563EB]/90">
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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
              ? "We couldn't find any projects matching your current filters. Try adjusting them." 
              : "You don't have any projects yet. Create one to get started."}
          </p>
          {!(searchQuery || statusFilter !== "ALL" || priorityFilter !== "ALL") && (
            <Button className="mt-4 rounded-lg bg-[#2563EB] text-[#FFFFFF] hover:bg-[#2563EB]/90">
              <Plus className="mr-2 size-4" />
              New Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="flex flex-col rounded-xl border-[#E5E7EB] bg-[#FFFFFF] shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between pb-4">
                <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                  <CardTitle className="text-lg font-semibold text-[#111827] truncate">
                    {project.name}
                  </CardTitle>
                  <p className="text-sm text-[#6B7280] line-clamp-2 min-h-[40px]">
                    {project.description || "No description provided."}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger render={
                    <Button variant="ghost" size="icon" className="shrink-0 -mr-2 text-[#6B7280] hover:text-[#111827] rounded-lg" />
                  }>
                    <MoreVertical className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 rounded-xl border-[#E5E7EB] bg-[#FFFFFF] shadow-sm">
                    <DropdownMenuItem className="cursor-pointer text-[#111827] focus:bg-[#FAFAFA]">
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-[#111827] focus:bg-[#FAFAFA]">
                      Edit Project
                    </DropdownMenuItem>
                    <Separator className="bg-[#E5E7EB] my-1" />
                    <DropdownMenuItem className="cursor-pointer text-[#DC2626] focus:bg-[#FAFAFA] focus:text-[#DC2626]">
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
                    {project.priority} Priority
                  </Badge>
                </div>
                
                <div className="space-y-1.5 mb-5">
                  <div className="flex justify-between text-xs text-[#6B7280]">
                    <span>Progress</span>
                    <span>N/A</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#FAFAFA] border border-[#E5E7EB]">
                    <div className="h-full bg-[#E5E7EB] w-0" />
                  </div>
                  <p className="text-[10px] text-[#6B7280] text-center pt-0.5">Progress unavailable</p>
                </div>

                <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4 mt-auto">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarFallback className="bg-[#2563EB]/10 text-[#2563EB] text-[10px]">
                        {project.owner.firstName.charAt(0)}{project.owner.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-[#111827] truncate max-w-[100px]">
                      {project.owner.firstName} {project.owner.lastName}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-[#6B7280]">
                    <div className="flex items-center gap-1" title="Members">
                      <Users className="size-3" />
                      <span className="text-xs">{project.members?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Tasks">
                      <CheckSquare className="size-3" />
                      <span className="text-xs">{project.tasks?.length || 0}</span>
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
    </div>
  );
}
