"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical, AlertCircle, Calendar, MessageSquare, Clock, FolderKanban, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { 
  getAllTasks, 
  updateTaskStatus, 
  getTaskDetails, 
  getTaskComments, 
  createTaskComment,
  createTask,
  updateTaskPriority,
  updateTaskDueDate,
  assignTask
} from "@/services/tasks.service";
import { getProjects, getProjectDetails, getProjectMembers } from "@/services/projects.service";
import type { Task, TaskStatus } from "@/types/tasks";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  projectId: z.string().min(1, "Project is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "IN_REVIEW", title: "In Review" },
  { id: "DONE", title: "Done" },
];

function SortableTaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: "Task", task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="h-32 w-full rounded-xl border-2 border-dashed border-[#2563EB]/50 bg-[#2563EB]/5 opacity-50"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex cursor-pointer flex-col gap-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-4 shadow-sm transition-all hover:border-[#2563EB]/30 hover:shadow-md"
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline" className={
            task.priority === "HIGH" ? "border-[#DC2626] text-[#DC2626] bg-[#DC2626]/5" :
            task.priority === "MEDIUM" ? "border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B]/5" :
            "border-[#6B7280] text-[#6B7280] bg-[#6B7280]/5"
          }>
            {task.priority}
          </Badge>
          <GripVertical className="size-4 text-[#E5E7EB] opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <h4 className="font-semibold text-[#111827] line-clamp-2 leading-tight">{task.title}</h4>
        <p className="text-xs text-[#6B7280] line-clamp-2">{task.description}</p>
      </div>
      
      <div className="mt-auto pt-2 flex items-center justify-between border-t border-[#E5E7EB]/50">
        <span className="text-[10px] font-medium text-[#6B7280] bg-[#FAFAFA] px-2 py-1 rounded-md truncate max-w-[100px]">
          {task.project?.name || "No Project"}
        </span>
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <div className="flex items-center gap-1 text-[10px] text-[#6B7280]">
              <Calendar className="size-3" />
              <span>{new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5" title={task.assignee ? `Assigned to ${task.assignee.firstName} ${task.assignee.lastName}` : "Unassigned"}>
            <Avatar className="size-6 border border-white shadow-sm ring-1 ring-[#E5E7EB]">
              <AvatarFallback className="bg-[#2563EB]/10 text-[#2563EB] text-[9px] font-medium">
                {task.assignee?.firstName?.charAt(0) || "U"}{task.assignee?.lastName?.charAt(0) || "N"}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-medium text-[#111827] max-w-[70px] truncate">
              {task.assignee ? task.assignee.firstName : "Unassigned"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const queryClient = useQueryClient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: getAllTasks,
  });

  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });

  useEffect(() => {
    if (data?.items) {
      setTasks(data.items);
    }
  }, [data]);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      projectId: "",
      priority: "MEDIUM",
      dueDate: "",
    },
  });

  const selectedProjectId = form.watch("projectId");
  const { data: projectMembers, isLoading: isLoadingMembers } = useQuery({
    queryKey: ["projectMembers", selectedProjectId],
    queryFn: () => getProjectMembers(selectedProjectId!),
    enabled: !!selectedProjectId,
  });

  const createMutation = useMutation({
    mutationFn: (values: TaskFormValues) => createTask(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created successfully");
      setIsCreateOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create task");
    }
  });

  const onSubmit = (values: TaskFormValues) => {
    createMutation.mutate(values);
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus; previousTasks: Task[] }) => updateTaskStatus(taskId, status),
    onError: (err, variables) => {
      toast.error(err.message || "Failed to update task status");
      if (variables.previousTasks) {
        setTasks(variables.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveTask) return;

    setTasks(tasks => {
      const activeIndex = tasks.findIndex(t => t.id === activeId);
      
      if (isOverTask) {
        const overIndex = tasks.findIndex(t => t.id === overId);
        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          const newTasks = [...tasks];
          newTasks[activeIndex].status = tasks[overIndex].status;
          return arrayMove(newTasks, activeIndex, overIndex);
        }
        return arrayMove(tasks, activeIndex, overIndex);
      }

      if (isOverColumn) {
        const overStatus = over.id as TaskStatus;
        if (tasks[activeIndex].status !== overStatus) {
          const newTasks = [...tasks];
          newTasks[activeIndex].status = overStatus;
          return arrayMove(newTasks, activeIndex, activeIndex); 
        }
      }

      return tasks;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const activeTaskFinal = tasks.find(t => t.id === activeId);
    
    const originalTask = data?.items.find(t => t.id === activeId);
    
    if (activeTaskFinal && originalTask && activeTaskFinal.status !== originalTask.status) {
      const previousTasks = [...(data?.items || [])];
      updateStatusMutation.mutate(
        { taskId: activeId, status: activeTaskFinal.status, previousTasks }
      );
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsSheetOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32 rounded-md" />
            <Skeleton className="h-4 w-48 rounded-md" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-4 h-[600px]">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24 rounded-md" />
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Tasks</h2>
          <p className="text-[#6B7280]">Manage project tasks visually.</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Error Loading Tasks</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load tasks."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col space-y-6 animate-in fade-in duration-300">
      <div className="flex shrink-0 flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Tasks</h2>
          <p className="text-[#6B7280]">Manage project tasks visually.</p>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="rounded-lg bg-[#2563EB] text-[#FFFFFF] hover:bg-[#2563EB]/90 h-10 shadow-sm"
        >
          <Plus className="mr-2 size-4" />
          New Task
        </Button>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Fill out the details below to initialize a new task.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111827]">Task Title</label>
              <Input placeholder="e.g. Design Landing Page" {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111827]">Project</label>
              <select 
                className="flex h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                {...form.register("projectId")}
              >
                <option value="" disabled>Select a project</option>
                {projectsData?.items.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {form.formState.errors.projectId && (
                <p className="text-xs text-red-500">{form.formState.errors.projectId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111827]">Assignee (Optional)</label>
              
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full justify-between border-[#E5E7EB] text-left font-normal bg-white hover:bg-[#FAFAFA]"
                    disabled={!selectedProjectId || isLoadingMembers}
                  >
                    {form.watch("assigneeId") ? (() => {
                      const selectedMember = projectMembers?.find(m => m.userId === form.watch("assigneeId"));
                      if (!selectedMember) return "Select Assignee";
                      return (
                        <div className="flex items-center gap-2">
                          <Avatar className="size-5">
                            <AvatarFallback className="bg-[#2563EB]/10 text-[#2563EB] text-[9px] font-medium">
                              {selectedMember.user.firstName.charAt(0)}{selectedMember.user.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-[#111827] font-medium">{selectedMember.user.firstName} {selectedMember.user.lastName}</span>
                        </div>
                      );
                    })() : <span className="text-[#6B7280]">Unassigned</span>}
                    <ChevronDown className="size-4 opacity-50 text-[#6B7280]" />
                  </Button>
                } />
                <DropdownMenuContent className="w-[425px] p-2 rounded-xl shadow-lg border-[#E5E7EB]">
                  <DropdownMenuItem 
                    onClick={() => form.setValue("assigneeId", "")}
                    className="cursor-pointer mb-1 p-2 focus:bg-[#FAFAFA] rounded-lg"
                  >
                    <span className="text-sm text-[#6B7280] font-medium">Unassigned</span>
                  </DropdownMenuItem>
                  {projectMembers?.map(member => (
                    <DropdownMenuItem 
                      key={member.id} 
                      onClick={() => form.setValue("assigneeId", member.userId)}
                      className="flex items-center gap-3 cursor-pointer p-2 focus:bg-[#FAFAFA] rounded-lg mb-1 last:mb-0 transition-colors"
                    >
                      <Avatar className="size-9 shadow-sm border border-[#E5E7EB]">
                        <AvatarFallback className="bg-gradient-to-br from-[#2563EB]/10 to-transparent text-[#2563EB] text-xs font-semibold">
                          {member.user.firstName.charAt(0)}{member.user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[#111827]">{member.user.firstName} {member.user.lastName}</span>
                        <span className="text-[10px] text-[#6B7280] font-medium tracking-wide uppercase">{member.role}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {!selectedProjectId && (
                <p className="text-[10px] text-[#6B7280] font-medium">Select a project first to view its team members.</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111827]">Description (Optional)</label>
              <Input placeholder="Brief details about the task" {...form.register("description")} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#111827]">Due Date (Optional)</label>
                <Input type="date" {...form.register("dueDate")} />
              </div>
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
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCorners} 
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
          <div className="flex h-full min-w-max gap-6">
            {COLUMNS.map((column) => {
              const columnTasks = tasks.filter((t) => t.status === column.id);
              
              return (
                <div key={column.id} className="flex h-full w-[340px] flex-col rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] shadow-sm">
                  <div className="flex shrink-0 items-center justify-between p-4 pb-2">
                    <h3 className="font-semibold text-[#111827]">{column.title}</h3>
                    <Badge variant="secondary" className="bg-[#E5E7EB]/50 text-[#6B7280] font-medium border-0">
                      {columnTasks.length}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 pt-2">
                    <SortableContext items={columnTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                      <div className="flex min-h-[150px] flex-col gap-3">
                        {columnTasks.map((task) => (
                          <SortableTaskCard key={task.id} task={task} onClick={() => handleTaskClick(task)} />
                        ))}
                        {columnTasks.length === 0 && (
                          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] bg-transparent">
                            <span className="text-sm text-[#6B7280]">No tasks here</span>
                          </div>
                        )}
                      </div>
                    </SortableContext>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="opacity-90 shadow-xl ring-1 ring-[#2563EB]/50 rotate-2">
              <SortableTaskCard task={activeTask} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-[480px] overflow-hidden bg-[#FFFFFF] border-l border-[#E5E7EB] shadow-2xl p-0">
          {selectedTask && <TaskDrawerContent initialTask={selectedTask} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function TaskDrawerContent({ initialTask }: { initialTask: Task }) {
  const queryClient = useQueryClient();
  const { data: task, isLoading: isTaskLoading } = useQuery({
    queryKey: ["task", initialTask.id],
    queryFn: () => getTaskDetails(initialTask.id),
    initialData: initialTask,
  });

  const { data: comments, isLoading: isCommentsLoading, isError: isCommentsError } = useQuery({
    queryKey: ["comments", initialTask.id],
    queryFn: () => getTaskComments(initialTask.id),
  });

  const { data: projectDetails } = useQuery({
    queryKey: ["project", task.projectId],
    queryFn: () => getProjectDetails(task.projectId),
    enabled: !!task.projectId,
  });

  const priorityMutation = useMutation({
    mutationFn: (priority: "HIGH" | "MEDIUM" | "LOW") => updateTaskPriority(task.id, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", task.id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Priority updated");
    }
  });

  const dueDateMutation = useMutation({
    mutationFn: (dueDate: string) => updateTaskDueDate(task.id, new Date(dueDate).toISOString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", task.id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Due date updated");
    }
  });

  const assignMutation = useMutation({
    mutationFn: (assigneeId: string) => assignTask(task.id, assigneeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", task.id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Assignee updated");
    }
  });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<{ content: string }>();

  const postCommentMutation = useMutation({
    mutationFn: (content: string) => createTaskComment(initialTask.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", initialTask.id] });
      reset();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to post comment");
    }
  });

  const onSubmit = (data: { content: string }) => {
    if (!data.content.trim()) return;
    postCommentMutation.mutate(data.content);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 border-b border-[#E5E7EB] bg-[#FAFAFA]">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className={
            task.status === "DONE" ? "border-[#16A34A] text-[#16A34A] bg-[#16A34A]/5" :
            task.status === "IN_PROGRESS" ? "border-[#2563EB] text-[#2563EB] bg-[#2563EB]/5" :
            task.status === "IN_REVIEW" ? "border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B]/5" :
            "border-[#6B7280] text-[#6B7280] bg-[#6B7280]/5"
          }>
            {task.status.replace("_", " ")}
          </Badge>
          <Badge variant="outline" className={
            task.priority === "HIGH" ? "border-[#DC2626] text-[#DC2626] bg-[#DC2626]/5" :
            task.priority === "MEDIUM" ? "border-[#F59E0B] text-[#F59E0B] bg-[#F59E0B]/5" :
            "border-[#6B7280] text-[#6B7280] bg-[#6B7280]/5"
          }>
            {task.priority}
          </Badge>
        </div>
        
        {/* Missing Backend Support Alert for Editing Title/Desc */}
        <div className="group relative">
          <SheetTitle className="text-xl font-bold text-[#111827] leading-tight mb-2">
            {task.title}
          </SheetTitle>
          <div className="absolute inset-0 bg-[#FAFAFA]/50 hidden group-hover:flex items-center justify-center cursor-not-allowed opacity-0 group-hover:opacity-100 transition-opacity rounded" title="Edit Task Name (Not supported by backend)">
            <span className="text-xs bg-[#111827] text-white px-2 py-1 rounded">Read Only</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-[#6B7280] font-medium bg-[#FFFFFF] w-fit px-2 py-1 rounded-md border border-[#E5E7EB]">
          <FolderKanban className="size-3.5" />
          {task.project?.name || "No Project"}
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        <div className="space-y-3 group relative">
          <h4 className="text-sm font-semibold text-[#111827]">Description</h4>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            {task.description || "No description provided for this task."}
          </p>
          <div className="absolute inset-0 bg-[#FFFFFF]/50 hidden group-hover:flex items-center justify-center cursor-not-allowed opacity-0 group-hover:opacity-100 transition-opacity rounded" title="Edit Task Description (Not supported by backend)">
            <span className="text-xs bg-[#111827] text-white px-2 py-1 rounded">Read Only</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 p-3 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA]">
            <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Assignee</span>
            <select 
              className="w-full text-sm font-medium text-[#111827] bg-transparent border-0 focus:ring-0 cursor-pointer p-0 appearance-none"
              value={task.assigneeId || ""}
              onChange={(e) => assignMutation.mutate(e.target.value)}
              disabled={!projectDetails?.members}
            >
              <option value="">Unassigned</option>
              {projectDetails?.members?.map((m: any) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.firstName} {m.user.lastName}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2 p-3 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA]">
            <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Due Date</span>
            <input 
              type="date" 
              className="w-full text-sm font-medium text-[#111827] bg-transparent border-0 focus:ring-0 cursor-pointer p-0"
              value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ""}
              onChange={(e) => dueDateMutation.mutate(e.target.value)}
            />
          </div>

          <div className="space-y-2 p-3 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA]">
            <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Priority</span>
            <select 
              className="w-full text-sm font-medium text-[#111827] bg-transparent border-0 focus:ring-0 cursor-pointer p-0 appearance-none"
              value={task.priority}
              onChange={(e) => priorityMutation.mutate(e.target.value as any)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div className="space-y-2 p-3 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] relative group cursor-not-allowed">
            <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Actual Hours</span>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-[#16A34A]" />
              <span className="text-sm font-medium text-[#111827]">0h</span>
            </div>
            <div className="absolute inset-0 bg-[#FAFAFA]/50 hidden group-hover:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded" title="Edit Actual Hours (Not supported by backend)">
              <span className="text-xs bg-[#111827] text-white px-2 py-1 rounded">Read Only</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-[#6B7280] pt-2">
          <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(task.updatedAt).toLocaleDateString()}</span>
        </div>

        <div className="space-y-4 pt-4 border-t border-[#E5E7EB]">
          <h4 className="text-sm font-semibold text-[#111827] flex items-center gap-2">
            <MessageSquare className="size-4" />
            Comments
          </h4>
          
          <div className="rounded-xl border border-dashed border-[#E5E7EB] p-8 text-center bg-[#FAFAFA] mt-4">
            <AlertCircle className="size-5 text-[#6B7280] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#111827]">Comments are currently unavailable</p>
            <p className="text-xs text-[#6B7280] mt-1">The backend API is missing the required comment endpoints.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
