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
import { motion, type Variants } from "framer-motion";

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
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const columnVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 250, damping: 25 } }
};

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
        className="h-32 w-full rounded-2xl border-2 border-dashed border-primary/50 bg-primary/10 opacity-60 shadow-lg"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex cursor-grab active:cursor-grabbing flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:border-border hover:shadow-md"
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline" className={
            task.priority === "HIGH" ? "border-destructive/20 text-destructive bg-destructive/5" :
            task.priority === "MEDIUM" ? "border-warning/20 text-warning bg-warning/5" :
            "border-muted-foreground/20 text-muted-foreground bg-secondary"
          }>
            {task.priority}
          </Badge>
          <GripVertical className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <h4 className="font-bold text-foreground line-clamp-2 leading-tight">{task.title}</h4>
        <p className="text-xs font-medium text-muted-foreground line-clamp-2">{task.description}</p>
      </div>
      
      <div className="mt-auto pt-3 flex items-center justify-between border-t border-border/50">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary px-2 py-1 rounded-md truncate max-w-[100px]">
          {task.project?.name || "No Project"}
        </span>
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
              <Calendar className="size-3" />
              <span>{new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5" title={task.assignee ? `Assigned to ${task.assignee.firstName} ${task.assignee.lastName}` : "Unassigned"}>
            <Avatar className="size-6 ring-1 ring-border shadow-sm">
              <AvatarFallback className="bg-secondary text-foreground text-[9px] font-bold border border-border">
                {task.assignee?.firstName?.charAt(0) || "U"}{task.assignee?.lastName?.charAt(0) || "N"}
              </AvatarFallback>
            </Avatar>
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
          newTasks[activeIndex] = { ...newTasks[activeIndex], status: tasks[overIndex].status };
          return arrayMove(newTasks, activeIndex, overIndex);
        }
        return arrayMove(tasks, activeIndex, overIndex);
      }

      if (isOverColumn) {
        const overStatus = over.id as TaskStatus;
        if (tasks[activeIndex].status !== overStatus) {
          const newTasks = [...tasks];
          newTasks[activeIndex] = { ...newTasks[activeIndex], status: overStatus };
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
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4 rounded-2xl border border-border/50 bg-card p-4 h-[600px] shadow-sm">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Tasks</h2>
          <p className="text-muted-foreground font-medium">Manage project tasks visually.</p>
        </div>
        <Alert variant="destructive" className="border-destructive/20 bg-destructive/5 rounded-2xl">
          <AlertCircle className="size-5" />
          <AlertTitle className="font-bold">Error Loading Tasks</AlertTitle>
          <AlertDescription className="font-medium">
            {error instanceof Error ? error.message : "Failed to load tasks."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col space-y-6">
      <div className="flex shrink-0 flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div className="space-y-1.5">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Tasks</h2>
          <p className="text-muted-foreground font-medium">Manage and track issues across your workflow.</p>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          className="shadow-sm font-bold"
        >
          <Plus className="mr-2 size-[1.1rem]" />
          New Task
        </Button>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Fill out the details below to initialize a new task.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Task Title</label>
              <Input placeholder="e.g. Design Landing Page" {...form.register("title")} className="h-11 rounded-xl bg-secondary/50 focus:bg-background transition-colors" />
              {form.formState.errors.title && (
                <p className="text-xs font-semibold text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Project</label>
              <select 
                className="flex h-11 w-full rounded-xl border border-input bg-secondary/50 px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-colors"
                {...form.register("projectId")}
              >
                <option value="" disabled>Select a project</option>
                {projectsData?.items.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {form.formState.errors.projectId && (
                <p className="text-xs font-semibold text-destructive">{form.formState.errors.projectId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Assignee (Optional)</label>
              
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full h-11 rounded-xl justify-between border-input text-left font-normal bg-secondary/50 hover:bg-background transition-colors"
                    disabled={!selectedProjectId || isLoadingMembers}
                  >
                    {form.watch("assigneeId") ? (() => {
                      const selectedMember = projectMembers?.find(m => m.userId === form.watch("assigneeId"));
                      if (!selectedMember) return "Select Assignee";
                      return (
                        <div className="flex items-center gap-2">
                          <Avatar className="size-5 ring-1 ring-border">
                            <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-bold">
                              {selectedMember.user.firstName.charAt(0)}{selectedMember.user.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-foreground font-semibold">{selectedMember.user.firstName} {selectedMember.user.lastName}</span>
                        </div>
                      );
                    })() : <span className="text-muted-foreground font-medium">Unassigned</span>}
                    <ChevronDown className="size-4 opacity-50 text-muted-foreground" />
                  </Button>
                } />
                <DropdownMenuContent className="w-[425px] p-2 rounded-xl shadow-lg border-border/50 bg-popover backdrop-blur-xl">
                  <DropdownMenuItem 
                    onClick={() => form.setValue("assigneeId", "")}
                    className="cursor-pointer mb-1 p-2 focus:bg-secondary rounded-lg"
                  >
                    <span className="text-sm text-muted-foreground font-semibold">Unassigned</span>
                  </DropdownMenuItem>
                  {projectMembers?.map(member => (
                    <DropdownMenuItem 
                      key={member.id} 
                      onClick={() => form.setValue("assigneeId", member.userId)}
                      className="flex items-center gap-3 cursor-pointer p-2 focus:bg-secondary rounded-lg mb-1 last:mb-0 transition-colors"
                    >
                      <Avatar className="size-9 ring-1 ring-border">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {member.user.firstName.charAt(0)}{member.user.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">{member.user.firstName} {member.user.lastName}</span>
                        <span className="text-[10px] text-muted-foreground font-bold tracking-wide uppercase">{member.role}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {!selectedProjectId && (
                <p className="text-[10px] text-muted-foreground font-medium">Select a project first to view its team members.</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">Description (Optional)</label>
              <Input placeholder="Brief details about the task" {...form.register("description")} className="h-11 rounded-xl bg-secondary/50 focus:bg-background transition-colors" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Due Date (Optional)</label>
                <Input type="date" {...form.register("dueDate")} className="h-11 rounded-xl bg-secondary/50 focus:bg-background transition-colors" />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
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
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex h-full min-w-max gap-6"
          >
            {COLUMNS.map((column) => {
              const columnTasks = tasks.filter((t) => t.status === column.id);
              
              return (
                <motion.div variants={columnVariants} key={column.id} className="flex h-full w-[340px] flex-col rounded-3xl border border-border/40 bg-secondary/30 shadow-inner">
                  <div className="flex shrink-0 items-center justify-between p-5 pb-3">
                    <h3 className="text-[13px] font-extrabold uppercase tracking-wider text-muted-foreground">{column.title}</h3>
                    <Badge variant="secondary" className="bg-background shadow-sm text-foreground font-bold border border-border/50">
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
                          <div className="flex h-32 items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-transparent transition-colors hover:bg-secondary/50 hover:border-primary/30">
                            <span className="text-sm font-semibold text-muted-foreground/60">Drop tasks here</span>
                          </div>
                        )}
                      </div>
                    </SortableContext>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="opacity-100 shadow-xl ring-1 ring-border rotate-2 scale-[1.02] transition-transform cursor-grabbing duration-200">
              <SortableTaskCard task={activeTask} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-[480px] overflow-hidden bg-background border-l border-border/50 shadow-2xl p-0">
          <div className="sr-only">
            <SheetTitle>Task Details</SheetTitle>
            <SheetDescription>View and edit task details.</SheetDescription>
          </div>
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
    <div className="flex flex-col h-full bg-background">
      <div className="px-8 py-8 border-b border-border/50 bg-secondary/30">
        <div className="flex items-center gap-2 mb-5">
          <Badge variant="outline" className={
            task.status === "DONE" ? "border-success/30 text-success bg-success/10" :
            task.status === "IN_PROGRESS" ? "border-primary/30 text-primary bg-primary/10" :
            task.status === "IN_REVIEW" ? "border-warning/30 text-warning bg-warning/10" :
            "border-muted-foreground/30 text-muted-foreground bg-secondary"
          }>
            {task.status.replace("_", " ")}
          </Badge>
          <Badge variant="outline" className={
            task.priority === "HIGH" ? "border-destructive/30 text-destructive bg-destructive/10" :
            task.priority === "MEDIUM" ? "border-warning/30 text-warning bg-warning/10" :
            "border-muted-foreground/30 text-muted-foreground bg-secondary"
          }>
            {task.priority}
          </Badge>
        </div>
        
        <div className="group relative">
          <h3 className="text-2xl font-extrabold text-foreground leading-tight mb-3">
            {task.title}
          </h3>
          <div className="absolute inset-0 bg-background/50 hidden group-hover:flex items-center justify-center cursor-not-allowed opacity-0 group-hover:opacity-100 transition-opacity rounded" title="Edit Task Name (Not supported by backend)">
            <span className="text-xs bg-foreground text-background px-2 py-1 rounded font-bold">Read Only</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold bg-card w-fit px-3 py-1.5 rounded-lg border border-border shadow-sm">
          <FolderKanban className="size-3.5" />
          {task.project?.name || "No Project"}
        </div>
      </div>

      <div className="p-8 space-y-8 flex-1 overflow-y-auto">
        <div className="space-y-3 group relative">
          <h4 className="text-[13px] font-extrabold text-muted-foreground uppercase tracking-wider">Description</h4>
          <p className="text-sm font-medium text-foreground leading-relaxed">
            {task.description || "No description provided for this task."}
          </p>
          <div className="absolute inset-0 bg-background/50 hidden group-hover:flex items-center justify-center cursor-not-allowed opacity-0 group-hover:opacity-100 transition-opacity rounded" title="Edit Task Description (Not supported by backend)">
            <span className="text-xs bg-foreground text-background px-2 py-1 rounded font-bold">Read Only</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 p-4 rounded-xl border border-border/50 bg-secondary/20 transition-colors hover:bg-secondary/40">
            <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">Assignee</span>
            <select 
              className="w-full text-sm font-bold text-foreground bg-transparent border-0 focus:ring-0 cursor-pointer p-0 appearance-none"
              value={task.assigneeId || ""}
              onChange={(e) => assignMutation.mutate(e.target.value)}
              disabled={!projectDetails?.members}
            >
              <option value="">Unassigned</option>
              {projectDetails?.members?.map((m: any) => (
                <option key={m.userId} value={m.userId} className="font-medium bg-background text-foreground">
                  {m.user.firstName} {m.user.lastName}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2 p-4 rounded-xl border border-border/50 bg-secondary/20 transition-colors hover:bg-secondary/40">
            <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">Due Date</span>
            <input 
              type="date" 
              className="w-full text-sm font-bold text-foreground bg-transparent border-0 focus:ring-0 cursor-pointer p-0"
              value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ""}
              onChange={(e) => dueDateMutation.mutate(e.target.value)}
            />
          </div>

          <div className="space-y-2 p-4 rounded-xl border border-border/50 bg-secondary/20 transition-colors hover:bg-secondary/40">
            <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">Priority</span>
            <select 
              className="w-full text-sm font-bold text-foreground bg-transparent border-0 focus:ring-0 cursor-pointer p-0 appearance-none"
              value={task.priority}
              onChange={(e) => priorityMutation.mutate(e.target.value as any)}
            >
              <option value="LOW" className="bg-background">Low</option>
              <option value="MEDIUM" className="bg-background">Medium</option>
              <option value="HIGH" className="bg-background">High</option>
            </select>
          </div>

          <div className="space-y-2 p-4 rounded-xl border border-border/50 bg-secondary/20 relative group cursor-not-allowed">
            <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider">Actual Hours</span>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-success" />
              <span className="text-sm font-bold text-foreground">0h</span>
            </div>
            <div className="absolute inset-0 bg-background/50 hidden group-hover:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" title="Edit Actual Hours (Not supported by backend)">
              <span className="text-xs bg-foreground text-background px-2 py-1 rounded font-bold">Read Only</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between text-xs font-semibold text-muted-foreground/70 pt-2 uppercase tracking-wider">
          <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(task.updatedAt).toLocaleDateString()}</span>
        </div>

        <div className="space-y-4 pt-6 border-t border-border/50">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="size-4 text-primary" />
            Comments
          </h4>
          
          <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center bg-secondary/30 mt-4">
            <AlertCircle className="size-6 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-bold text-foreground">Comments are currently unavailable</p>
            <p className="text-xs font-medium text-muted-foreground mt-1.5 max-w-[220px] mx-auto leading-relaxed">The backend API is missing the required comment endpoints.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
