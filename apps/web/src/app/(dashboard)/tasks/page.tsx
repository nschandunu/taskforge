"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Plus, GripVertical, AlertCircle, Calendar, MessageSquare, Clock, FolderKanban } from "lucide-react";
import { toast } from "sonner";

import { getAllTasks, updateTaskStatus, getTaskDetails, getTaskComments, createTaskComment } from "@/services/tasks.service";
import type { Task, TaskStatus } from "@/types/tasks";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

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
        <h4 className="font-semibold text-[#111827] line-clamp-2 leading-tight">{task.name}</h4>
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
          <Avatar className="size-6 border border-white shadow-sm ring-1 ring-[#E5E7EB]">
            <AvatarFallback className="bg-[#2563EB]/10 text-[#2563EB] text-[9px]">
              {task.assignee?.firstName?.charAt(0) || "U"}{task.assignee?.lastName?.charAt(0) || "N"}
            </AvatarFallback>
          </Avatar>
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

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: getAllTasks,
  });

  useEffect(() => {
    if (data?.items) {
      setTasks(data.items);
    }
  }, [data]);

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
    
    // Check if status changed compared to server data
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
    <div className="flex h-[calc(100vh-140px)] flex-col space-y-6">
      <div className="flex shrink-0 flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Tasks</h2>
          <p className="text-[#6B7280]">Manage project tasks visually.</p>
        </div>
        <Button className="rounded-lg bg-[#2563EB] text-[#FFFFFF] hover:bg-[#2563EB]/90 h-10 shadow-sm">
          <Plus className="mr-2 size-4" />
          New Task
        </Button>
      </div>

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
        <SheetTitle className="text-xl font-bold text-[#111827] leading-tight mb-2">
          {task.name}
        </SheetTitle>
        <div className="flex items-center gap-1.5 text-sm text-[#6B7280] font-medium bg-[#FFFFFF] w-fit px-2 py-1 rounded-md border border-[#E5E7EB]">
          <FolderKanban className="size-3.5" />
          {task.project?.name || "No Project"}
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-[#111827]">Description</h4>
          <p className="text-sm text-[#6B7280] leading-relaxed">
            {task.description || "No description provided for this task."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 p-3 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA]">
            <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Assignee</span>
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarFallback className="bg-[#2563EB]/10 text-[#2563EB] text-[10px]">
                  {task.assignee?.firstName?.charAt(0) || "U"}{task.assignee?.lastName?.charAt(0) || "N"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-[#111827] truncate">
                {task.assignee?.firstName || "Unassigned"} {task.assignee?.lastName || ""}
              </span>
            </div>
          </div>
          
          <div className="space-y-2 p-3 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA]">
            <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Due Date</span>
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-[#6B7280]" />
              <span className="text-sm font-medium text-[#111827]">
                {task.dueDate 
                  ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) 
                  : "No due date"}
              </span>
            </div>
          </div>

          <div className="space-y-2 p-3 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA]">
            <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Est. Hours</span>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-[#6B7280]" />
              <span className="text-sm font-medium text-[#111827]">0h</span>
            </div>
          </div>

          <div className="space-y-2 p-3 rounded-lg border border-[#E5E7EB] bg-[#FAFAFA]">
            <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Actual Hours</span>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-[#16A34A]" />
              <span className="text-sm font-medium text-[#111827]">0h</span>
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
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <textarea
              {...register("content", { required: true })}
              placeholder="Write a comment..."
              className="w-full rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] p-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] min-h-[80px]"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="rounded-lg bg-[#2563EB] text-[#FFFFFF] hover:bg-[#2563EB]/90 h-8 text-xs">
                Post Comment
              </Button>
            </div>
          </form>

          {isCommentsLoading ? (
            <div className="space-y-4 pt-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : isCommentsError ? (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="size-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Failed to load comments.</AlertDescription>
            </Alert>
          ) : !comments || comments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#E5E7EB] p-8 text-center bg-[#FAFAFA] mt-4">
              <p className="text-sm text-[#6B7280]">No comments yet.</p>
            </div>
          ) : (
            <div className="space-y-6 pt-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="size-8 border border-white shadow-sm ring-1 ring-[#E5E7EB]">
                    <AvatarFallback className="bg-[#2563EB]/10 text-[#2563EB] text-xs">
                      {comment.author?.firstName?.charAt(0) || "U"}{comment.author?.lastName?.charAt(0) || "N"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#111827]">
                        {comment.author?.firstName} {comment.author?.lastName}
                      </span>
                      <span className="text-xs text-[#6B7280]">
                        {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" })}
                      </span>
                    </div>
                    <div className="rounded-lg border border-[#E5E7EB] bg-[#FAFAFA] p-3 text-sm text-[#111827]">
                      {comment.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
